import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ApprovalNotice } from "@/components/approval-notice";
import { buildDefaultSettings } from "@/lib/config";

export const metadata: Metadata = {
  title: "Refund policy",
  description: "How Brand My Land refunds deposits.",
};

export default function RefundPolicyPage() {
  const settings = buildDefaultSettings();
  return (
    <>
      <SiteHeader settings={settings} />
      <ApprovalNotice />
      <article className="mx-auto max-w-3xl px-4 py-12 text-muted-foreground">
        <p className="rounded-lg bg-warning/20 px-3 py-2 text-sm text-foreground">
          Draft only — policy version {settings.policyVersion}. Final legal review is required
          before accepting real money.
        </p>
        <h1 className="mt-6 text-3xl font-semibold text-foreground">Refund policy</h1>
        <p className="mt-4">
          Deposits are refunded in full if you are outbid, if a brand is rejected, or if a
          placement cannot proceed after regulatory or safety review. No project administration
          fee is deducted. We do not mark a refund as successful until Stripe confirms it.
        </p>
        <p className="mt-4">
          The payment provider controls how long a refund takes to appear on a bank statement or
          card. Contact {settings.contactEmail}.
        </p>
      </article>
      <SiteFooter settings={settings} />
    </>
  );
}
