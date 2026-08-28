import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ApprovalNotice } from "@/components/approval-notice";
import { buildDefaultSettings } from "@/lib/config";

export const metadata: Metadata = {
  title: "Terms",
  description: "Draft auction terms for Brand My Land. Final legal review is required before accepting real money.",
};

export default function TermsPage() {
  const settings = buildDefaultSettings();
  return (
    <>
      <SiteHeader settings={settings} />
      <ApprovalNotice />
      <article className="prose mx-auto max-w-3xl px-4 py-12 prose-p:text-muted-foreground">
        <p className="rounded-lg bg-warning/20 px-3 py-2 text-sm text-foreground">
          Draft only — policy version {settings.policyVersion}. Final legal review is required
          before accepting real money.
        </p>
        <h1 className="text-3xl font-semibold text-foreground">Auction terms</h1>
        <p>
          Legal entity: {settings.legalEntityName}. Address: {settings.businessAddress}. VAT:{" "}
          {settings.vatNumber}. Contact: {settings.contactEmail}.
        </p>
        <p>
          A bid is an offer to purchase an experimental sponsorship package tied to a specific
          physical and digital position. You are not buying land or any property interest.
        </p>
        <p>
          Physical installation is subject to approval by the Câmara Municipal de São Vicente and
          other competent authorities. Approval is not a formality and installation is not
          guaranteed.
        </p>
        <p>
          Live bids charge a 20% deposit (minimum €10) in euros. Losing, rejected or
          non-proceeding placements are refunded in full to the original payment method. Settlement
          timing is controlled by the payment provider.
        </p>
        <p>
          Each placement is an independent auction. A valid bid in the final five minutes may
          extend that placement by five minutes if anti-snipe is enabled.
        </p>
      </article>
      <SiteFooter settings={settings} />
    </>
  );
}
