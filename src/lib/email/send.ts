import "server-only";
import { siteUrl } from "@/lib/config";

export type EmailKind =
  | "bid_confirmation"
  | "outbid_refund"
  | "winning_bid"
  | "rejected_bid"
  | "final_payment";

export type EmailPayload = {
  to: string;
  kind: EmailKind;
  subject: string;
  text: string;
};

export async function sendTransactionalEmail(payload: EmailPayload) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Brand My Land <hello@brandmyland.com>";
  if (!key) {
    console.info(
      JSON.stringify({
        level: "info",
        source: "email",
        status: "logged_only",
        kind: payload.kind,
        to: payload.to,
        subject: payload.subject,
      }),
    );
    return { delivered: false, logged: true };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
    }),
  });
  if (!res.ok) {
    console.error(
      JSON.stringify({
        level: "error",
        source: "email",
        status: res.status,
        kind: payload.kind,
      }),
    );
    return { delivered: false, logged: false };
  }
  return { delivered: true, logged: false };
}

export function bidConfirmationEmail(args: {
  to: string;
  placementId: string;
  amountLabel: string;
  depositLabel: string;
}) {
  return sendTransactionalEmail({
    to: args.to,
    kind: "bid_confirmation",
    subject: `Bid confirmed on ${args.placementId} — Brand My Land`,
    text: [
      `Your bid of ${args.amountLabel} on ${args.placementId} is now valid.`,
      `A deposit of ${args.depositLabel} was charged. If you lose or this placement cannot proceed after regulatory/safety review, the deposit is refunded in full.`,
      `Physical installation is subject to approval by the relevant authorities.`,
      `Bank and card settlement timing is controlled by the payment provider.`,
      siteUrl(),
    ].join("\n\n"),
  });
}

export function outbidEmail(args: { to: string; placementId: string }) {
  return sendTransactionalEmail({
    to: args.to,
    kind: "outbid_refund",
    subject: `You've been outbid on ${args.placementId}`,
    text: `Someone placed a higher valid bid on ${args.placementId}. We have initiated a full refund of your deposit to the original payment method. Settlement timing is controlled by the payment provider. You can bid again while the placement is open.\n\n${siteUrl()}/?spot=${args.placementId}`,
  });
}

export function winningEmail(args: { to: string; placementId: string }) {
  return sendTransactionalEmail({
    to: args.to,
    kind: "winning_bid",
    subject: `You are the leading winner on ${args.placementId}`,
    text: `Subject to brand review and regulatory approval, ${args.placementId} currently settles with your bid. The remaining balance will be requested after auction settlement. Physical installation is not guaranteed until approvals are in place.`,
  });
}

export function rejectedEmail(args: { to: string; placementId: string }) {
  return sendTransactionalEmail({
    to: args.to,
    kind: "rejected_bid",
    subject: `Bid update for ${args.placementId}`,
    text: `Your bid on ${args.placementId} could not be approved during brand review. A full refund of the deposit has been initiated to the original payment method.`,
  });
}

export function finalPaymentEmail(args: {
  to: string;
  placementId: string;
  invoiceUrl: string;
}) {
  return sendTransactionalEmail({
    to: args.to,
    kind: "final_payment",
    subject: `Remaining balance for ${args.placementId}`,
    text: `Please settle the remaining 80% for ${args.placementId} using this secure link: ${args.invoiceUrl}\n\nYour deposit already counts toward the total. Physical installation remains subject to regulatory and safety approval.`,
  });
}
