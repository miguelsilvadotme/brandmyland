import { NextRequest, NextResponse } from "next/server";
import { getStripe, logStripeFailure } from "@/lib/stripe/client";
import { getMemoryStore, saveMemoryStore } from "@/lib/data/adapter";
import { confirmPaidBid, queueRefundForBid, markRefund } from "@/lib/data/store";
import { bidConfirmationEmail, outbidEmail } from "@/lib/email/send";
import { formatEuroFromCents } from "@/lib/auction/money";
import { serverLog } from "@/lib/analytics";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured" },
      { status: 503 },
    );
  }
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (error) {
    logStripeFailure("webhook_signature", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const store = getMemoryStore();
  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const bidId = session.metadata?.bidId;
      const paid = session.amount_total ?? 0;
      const paymentIntent =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id;
      const result = await confirmPaidBid(store, {
        bidId,
        checkoutSessionId: session.id,
        paymentIntentId: paymentIntent,
        paidAmountCents: paid,
      });
      if (result.ok) {
        const bidder = store.bidders.find((b) => b.id === result.bid.bidderId);
        if (bidder) {
          await bidConfirmationEmail({
            to: bidder.email,
            placementId: result.bid.placementId,
            amountLabel: formatEuroFromCents(result.bid.amountCents),
            depositLabel: formatEuroFromCents(result.bid.depositCents),
          });
        }
        for (const outbidId of result.outbidBidIds) {
          queueRefundForBid(store, outbidId);
          const outbid = store.bids.find((b) => b.id === outbidId);
          const loser = outbid
            ? store.bidders.find((b) => b.id === outbid.bidderId)
            : null;
          if (loser && outbid) {
            await outbidEmail({ to: loser.email, placementId: outbid.placementId });
          }
        }
        serverLog("bid_confirmed", { placementId: result.bid.placementId });
      } else if (result.reason === "stale" && result.bid) {
        queueRefundForBid(store, result.bid.id);
        logStripeFailure("stale_bid_after_payment", result.message, { bidId });
      }
      saveMemoryStore();
    }
    if (event.type === "charge.refunded" || event.type === "refund.updated") {
      const object = event.data.object as { id?: string; status?: string };
      const refund = store.refunds.find((r) => r.stripeRefundId === object.id);
      if (refund && object.status === "succeeded") {
        markRefund(store, refund.id, { status: "succeeded" });
        saveMemoryStore();
      }
    }
  } catch (error) {
    logStripeFailure("webhook_handler", error, { type: event.type });
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}
