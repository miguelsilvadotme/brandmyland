"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { bidFormSchema } from "@/lib/validation/bid";
import { getMemoryStore, saveMemoryStore } from "@/lib/data/adapter";
import {
  addReservation,
  createPendingBid,
  nextBidForPlacement,
  queueRefundForBid,
} from "@/lib/data/store";
import { formatEuroFromCents } from "@/lib/auction/money";
import { resolveAuctionMode, siteUrl } from "@/lib/config";
import { getStripe, stripeEnabled, logStripeFailure } from "@/lib/stripe/client";
import { BidValidationError } from "@/lib/auction/rules";
import { ADMIN_COOKIE, createAdminToken, requireAdmin, verifyAdminPassword } from "@/lib/auth/admin";
import { PLACEMENT_DEFINITIONS } from "@/lib/auction/inventory";
import {
  markRefund,
  type AppStore,
} from "@/lib/data/store";
import { getStripe as stripeClient } from "@/lib/stripe/client";
import {
  finalPaymentEmail,
  rejectedEmail,
} from "@/lib/email/send";
import { serverLog } from "@/lib/analytics";

export async function getPublicCatalog() {
  const store = getMemoryStore();
  const { toPublicPlacement, toPublicBids, adminSummary, activityFromStore } =
    await import("@/lib/data/store");
  return {
    settings: store.settings,
    faqs: store.faqs,
    milestones: store.milestones,
    placements: toPublicPlacement(store),
    bids: toPublicBids(store),
    activity: activityFromStore(store).map((item) => {
      const bid = store.bids.find((b) => b.id === item.id);
      return {
        ...item,
        message: bid
          ? `${item.message.replace(/\d+c/, formatEuroFromCents(bid.amountCents))}`
          : item.message,
      };
    }),
    summary: adminSummary(store),
    mode: resolveAuctionMode(),
    paymentsSafe: stripeEnabled(),
  };
}

export async function submitBidAction(raw: unknown) {
  const parsed = bidFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid form" };
  }
  const data = {
    ...parsed.data,
    companyWebsite: parsed.data.companyWebsite ?? "",
  };
  const mode = resolveAuctionMode();
  if (mode === "preview") {
    return {
      ok: false as const,
      error: "Preview mode is on. Submissions are disabled until the auction opens.",
    };
  }
  if (mode === "closed") {
    return { ok: false as const, error: "This auction is closed." };
  }
  const store = getMemoryStore();
  try {
    const min = nextBidForPlacement(store, data.placementId);
    if (data.amountCents < min) {
      return {
        ok: false as const,
        error: `Minimum bid is now ${formatEuroFromCents(min)}.`,
        code: "stale" as const,
      };
    }
    if (mode === "reservations") {
      addReservation(store, data);
      saveMemoryStore();
      serverLog("reservation_submitted", { placementId: data.placementId });
      return { ok: true as const, kind: "reservation" as const };
    }
    if (!stripeEnabled()) {
      return {
        ok: false as const,
        error:
          "Live bidding is paused because Stripe is not configured. No payment was taken.",
      };
    }
    const stripe = getStripe();
    if (!stripe) {
      return { ok: false as const, error: "Stripe is not available." };
    }
    const idempotencyKey = randomUUID();
    const pending = createPendingBid(store, data, { idempotencyKey });
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        success_url: `${siteUrl()}/?spot=${data.placementId}&bid=confirmed`,
        cancel_url: `${siteUrl()}/?spot=${data.placementId}&bid=cancelled`,
        customer_email: data.workEmail,
        metadata: {
          bidId: pending.id,
          placementId: data.placementId,
          bidAmountCents: String(data.amountCents),
        },
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "eur",
              unit_amount: pending.depositCents,
              product_data: {
                name: `Bid deposit · ${data.placementId}`,
                description: `20% deposit on a ${formatEuroFromCents(data.amountCents)} bid. Refunded if outbid or if the placement cannot proceed.`,
              },
            },
          },
        ],
      },
      { idempotencyKey },
    );
    pending.stripeCheckoutSessionId = session.id;
    const payment = store.payments.find((p) => p.bidId === pending.id);
    if (payment) payment.stripeCheckoutSessionId = session.id;
    saveMemoryStore();
    serverLog("checkout_started", { placementId: data.placementId });
    if (!session.url) {
      return { ok: false as const, error: "Checkout could not be created." };
    }
    redirect(session.url);
  } catch (error) {
    if (error instanceof BidValidationError) {
      return { ok: false as const, error: error.message, code: error.code };
    }
    throw error;
  }
}

export async function adminLoginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (!verifyAdminPassword(password)) {
    redirect("/admin/login?error=1");
  }
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, createAdminToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect("/admin");
}

export async function adminLogoutAction() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

export async function getAdminData() {
  await requireAdmin();
  const store = getMemoryStore();
  const { adminSummary, toPublicPlacement } = await import("@/lib/data/store");
  return {
    summary: adminSummary(store),
    settings: store.settings,
    faqs: store.faqs,
    milestones: store.milestones,
    placements: toPublicPlacement(store),
    bids: store.bids,
    bidders: store.bidders,
    brands: store.brands,
    payments: store.payments,
    refunds: store.refunds,
    reservations: store.reservations,
    audit: store.audit,
    definitions: PLACEMENT_DEFINITIONS,
  };
}

export async function adminUpdateSettings(patch: Partial<AppStore["settings"]>) {
  await requireAdmin();
  const store = getMemoryStore();
  Object.assign(store.settings, patch);
  store.audit.unshift({
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    actor: "admin",
    action: "settings_updated",
    detail: Object.keys(patch).join(", "),
  });
  saveMemoryStore();
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function adminUpdatePlacement(id: string, patch: Record<string, unknown>) {
  await requireAdmin();
  const def = PLACEMENT_DEFINITIONS.find((p) => p.id === id);
  if (!def) throw new Error("Unknown placement");
  if (typeof patch.minBidCents === "number") def.minBidCents = patch.minBidCents;
  if (typeof patch.locationNote === "string") def.locationNote = patch.locationNote;
  if (typeof patch.name === "string") def.name = patch.name;
  getMemoryStore().audit.unshift({
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    actor: "admin",
    action: "placement_updated",
    detail: id,
  });
  saveMemoryStore();
  revalidatePath("/");
}

export async function adminModerateBrand(brandId: string, status: "approved" | "rejected") {
  await requireAdmin();
  const store = getMemoryStore();
  const brand = store.brands.find((b) => b.id === brandId);
  if (!brand) throw new Error("Unknown brand");
  brand.moderationStatus = status;
  const bid = store.bids.find((b) => b.brandId === brandId && b.status === "leading");
  if (status === "rejected" && bid) {
    bid.status = "rejected";
    queueRefundForBid(store, bid.id);
    const bidder = store.bidders.find((b) => b.id === bid.bidderId);
    if (bidder) await rejectedEmail({ to: bidder.email, placementId: bid.placementId });
  }
  store.audit.unshift({
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    actor: "admin",
    action: `brand_${status}`,
    detail: brandId,
  });
  saveMemoryStore();
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function adminRetryRefund(refundId: string) {
  await requireAdmin();
  const store = getMemoryStore();
  const refund = store.refunds.find((r) => r.id === refundId);
  if (!refund) throw new Error("Unknown refund");
  const payment = store.payments.find((p) => p.id === refund.paymentId);
  const stripe = stripeClient();
  refund.status = "processing";
  if (!stripe || !payment?.stripePaymentIntentId) {
    markRefund(store, refund.id, {
      status: "failed",
      error: "Stripe is not configured or payment intent is missing. Refund was not claimed as succeeded.",
    });
    logStripeFailure("refund_missing_stripe", new Error(refund.error ?? "missing"));
    saveMemoryStore();
    return { ok: false as const, error: refund.error };
  }
  try {
    const created = await stripe.refunds.create(
      {
        payment_intent: payment.stripePaymentIntentId,
        amount: refund.amountCents,
      },
      { idempotencyKey: `refund-${refund.id}` },
    );
    if (created.status === "succeeded" || created.status === "pending") {
      markRefund(store, refund.id, {
        status: created.status === "succeeded" ? "succeeded" : "processing",
        stripeRefundId: created.id,
        error: null,
      });
    } else {
      markRefund(store, refund.id, {
        status: "failed",
        error: `Stripe refund status: ${created.status}`,
        stripeRefundId: created.id,
      });
    }
  } catch (error) {
    markRefund(store, refund.id, {
      status: "failed",
      error: error instanceof Error ? error.message : "Refund failed",
    });
    logStripeFailure("refund_failed", error, { refundId });
  }
  store.audit.unshift({
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    actor: "admin",
    action: "refund_retry",
    detail: refundId,
  });
  saveMemoryStore();
  const latest = store.refunds.find((r) => r.id === refundId);
  return { ok: latest?.status === "succeeded", status: latest?.status };
}

export async function adminMarkWinnerBalance(
  bidId: string,
  status: "requested" | "paid",
  invoiceUrl?: string,
) {
  await requireAdmin();
  const store = getMemoryStore();
  const bid = store.bids.find((b) => b.id === bidId);
  if (!bid) throw new Error("Unknown bid");
  bid.winnerBalanceStatus = status;
  if (invoiceUrl) bid.invoiceUrl = invoiceUrl;
  if (status === "requested") {
    const bidder = store.bidders.find((b) => b.id === bid.bidderId);
    if (bidder && (invoiceUrl || bid.invoiceUrl)) {
      await finalPaymentEmail({
        to: bidder.email,
        placementId: bid.placementId,
        invoiceUrl: invoiceUrl || bid.invoiceUrl || "",
      });
    }
  }
  store.audit.unshift({
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    actor: "admin",
    action: `winner_balance_${status}`,
    detail: bidId,
  });
  saveMemoryStore();
}

export async function adminUpdateFaq(faqs: AppStore["faqs"]) {
  await requireAdmin();
  const store = getMemoryStore();
  store.faqs = faqs;
  saveMemoryStore();
  revalidatePath("/");
}

export async function adminUpdateMilestones(milestones: AppStore["milestones"]) {
  await requireAdmin();
  const store = getMemoryStore();
  store.milestones = milestones;
  saveMemoryStore();
  revalidatePath("/");
}
