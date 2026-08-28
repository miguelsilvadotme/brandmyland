"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNowStrict, format } from "date-fns";
import type { AuctionSettings, FaqItem, Milestone, PublicBid, PublicPlacement, AuctionMode, AdminSummary } from "@/lib/types";
import { formatEuroFromCents } from "@/lib/auction/money";
import { LandMap } from "@/components/land-map";
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
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
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

  const remaining = useMemo(() => {
    try {
      return formatDistanceToNowStrict(new Date(catalog.settings.endAt), { addSuffix: false });
    } catch {
      return "—";
    }
  }, [catalog.settings.endAt]);

  const modeCopy =
    catalog.settings.mode === "preview"
      ? "Auction not started — exploring a labelled demo map."
      : catalog.settings.mode === "reservations"
        ? "Reservations open — no cards charged yet."
        : catalog.settings.mode === "closed"
          ? "Auction closed — this page is the public archive."
          : "Auction live.";

  return (
    <>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-6 pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:pt-14">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{catalog.settings.heroEyebrow}</p>
          <h1 className="mt-3 max-w-xl text-4xl font-semibold tracking-tight md:text-6xl">
            {catalog.settings.heroHeadline}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {catalog.settings.heroBody}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#the-land" className={cn(buttonVariants(), "h-11 px-5")}>
              Explore the land
            </a>
            <a href="#how-it-works" className={cn(buttonVariants({ variant: "outline" }), "h-11 px-5")}>
              How this works
            </a>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">{modeCopy}</p>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            No guaranteed impressions. Just a very real piece of land, a drone and an
            unnecessarily ambitious idea.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 content-start">
          <Stat label="Total raised" value={formatEuroFromCents(catalog.summary.leadingBidTotalCents, { compact: true })} />
          <Stat label="Number of bids" value={String(catalog.summary.validBidCount)} />
          <Stat
            label="Placements with bids"
            value={`${catalog.summary.placementsWithBids} / ${catalog.summary.placementCount}`}
          />
          <Stat label="Auction time remaining" value={remaining} />
        </div>
      </section>

      <section id="the-land" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">The land is the marketplace</h2>
            <p className="text-sm text-muted-foreground">
              85 independently auctioned positions on one 1,300 m² plot. Server time is
              the authority; your local close is{" "}
              {format(new Date(catalog.settings.endAt), "d MMM, HH:mm")}.
            </p>
          </div>
        </div>
        <LandMap
          placements={catalog.placements}
          selectedId={selected}
          onSelect={select}
          demoLabel={catalog.settings.demoDataLabel}
          mode={catalog.settings.mode}
        />
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
