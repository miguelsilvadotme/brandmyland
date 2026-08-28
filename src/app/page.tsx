import { cookies } from "next/headers";
import { JsonLd } from "@/components/json-ld";
import { SiteHeader } from "@/components/site-header";
import { ApprovalNotice } from "@/components/approval-notice";
import { SiteFooter } from "@/components/site-footer";
import { AuctionExperience } from "@/components/auction-experience";
import { getPublicCatalog } from "@/app/actions";
import { ConsentBanner } from "@/components/consent-banner";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ spot?: string; bid?: string }>;
}) {
  const catalog = await getPublicCatalog();
  const params = await searchParams;
  const jar = await cookies();
  return (
    <>
      <JsonLd settings={catalog.settings} />
      <SiteHeader settings={catalog.settings} />
      <ApprovalNotice />
      <main>
        <AuctionExperience catalog={catalog} initialSpot={params.spot} bidFlash={params.bid} />
      </main>
      <SiteFooter settings={catalog.settings} />
      <ConsentBanner hasConsent={Boolean(jar.get("bml_consent"))} />
    </>
  );
}
