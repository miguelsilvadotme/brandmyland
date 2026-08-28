"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AuctionSettings, FaqItem, Milestone, PublicBid, PublicPlacement, AuctionMode, AdminSummary } from "@/lib/types";
import { LandMap } from "@/components/land-map";
import { LandLocation } from "@/components/land-location";
import { LandPhotos } from "@/components/land-photos";
import { HeroBanner } from "@/components/hero-banner";
import { PlacementDialog } from "@/components/placement-dialog";
import { AuctionTable } from "@/components/auction-table";
import { ActivityFeed } from "@/components/activity-feed";
import { MilestoneProgress } from "@/components/milestone-progress";
import { HowItWorks } from "@/components/how-it-works";
import { SponsorBenefits } from "@/components/sponsor-benefits";
import { FAQ } from "@/components/faq";
import { FounderSection } from "@/components/founder-section";
import { FinalCTA } from "@/components/final-cta";
import { StorySection } from "@/components/story-section";
import { trackClientEvent } from "@/lib/analytics";
import { toast } from "sonner";

export type Catalog = {
  settings: AuctionSettings;
  faqs: FaqItem[];
  milestones: Milestone[];
  placements: PublicPlacement[];
  bids: PublicBid[];
  activity: { id: string; createdAt: string; placementId: string; message: string }[];
  summary: AdminSummary;
  mode: AuctionMode;
  paymentsSafe: boolean;
};

function formatUtc(iso: string) {
  return `${new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso))} UTC`;
}

export function AuctionExperience({
  catalog,
  initialSpot,
  bidFlash,
}: {
  catalog: Catalog;
  initialSpot?: string;
  bidFlash?: string;
}) {
  const router = useRouter();
  const [override, setOverride] = useState<string | null | undefined>(undefined);
  const selected = override === undefined ? (initialSpot ?? null) : override;

  useEffect(() => {
    if (bidFlash === "confirmed") toast.success("Payment received. Your bid becomes valid after Stripe confirms it on the server.");
    if (bidFlash === "cancelled") toast.message("Checkout cancelled. No charge was completed.");
  }, [bidFlash]);

  const placement = catalog.placements.find((p) => p.id === selected) ?? null;
  const placementBids = catalog.bids.filter((b) => b.placementId === selected);

  function select(id: string | null) {
    setOverride(id);
    const url = id ? `/?spot=${id}` : "/";
    router.replace(url, { scroll: false });
    if (id) trackClientEvent("placement_selected", { placementId: id });
  }

  return (
    <>
      <HeroBanner
        raisedCents={catalog.summary.leadingBidTotalCents}
        bidCount={catalog.summary.validBidCount}
        endAt={catalog.settings.endAt}
        mode={catalog.settings.mode}
      />

      <section id="the-land" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-6">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold">The land is the marketplace</h2>
          <p className="text-sm text-muted-foreground">
            85 spots on one 1,300 m² plot. Click a banner or flag to bid. Auction
            ends {formatUtc(catalog.settings.endAt)}.
          </p>
        </div>
        <LandMap
          placements={catalog.placements}
          selectedId={selected}
          onSelect={select}
          mode={catalog.settings.mode}
          landImagePath={catalog.settings.landImagePath}
        />
        <LandLocation />
        <LandPhotos />
        <AuctionTable placements={catalog.placements} bids={catalog.bids} onSelect={select} />
        <ActivityFeed items={catalog.activity} />
      </section>

      <StorySection heading={catalog.settings.storyHeading} body={catalog.settings.storyBody} />
      <HowItWorks />
      <SponsorBenefits />
      <MilestoneProgress
        currentCents={catalog.summary.leadingBidTotalCents}
        milestones={catalog.milestones}
      />
      <FAQ items={catalog.faqs} />
      <FounderSection settings={catalog.settings} />
      <FinalCTA />
      <PlacementDialog
        placement={placement}
        bids={placementBids}
        mode={catalog.mode}
        onClose={() => select(null)}
      />
    </>
  );
}
