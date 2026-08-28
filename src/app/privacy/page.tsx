import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ApprovalNotice } from "@/components/approval-notice";
import { buildDefaultSettings } from "@/lib/config";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Draft privacy notice for Brand My Land.",
};

export default function PrivacyPage() {
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
        <h1 className="mt-6 text-3xl font-semibold text-foreground">Privacy</h1>
        <p className="mt-4">
          We collect contact, company and payment identifiers needed to run the auction, moderate
          brands and issue refunds. Emails, payment data and private bidder information are never
          shown on the public map.
        </p>
        <p className="mt-4">
          Analytics run only after consent where required, and never include payment or personal
          data. Controller: {settings.legalEntityName}, {settings.businessAddress}. Contact:{" "}
          {settings.contactEmail}.
        </p>
      </article>
      <SiteFooter settings={settings} />
    </>
  );
}
