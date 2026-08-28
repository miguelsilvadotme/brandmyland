"use client";

import { useEffect, useState } from "react";
import { formatEuroFromCents } from "@/lib/auction/money";
import { MINIMUM_INVENTORY_CENTS } from "@/lib/auction/inventory";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function auctionCountdown(endAt: string) {
  const end = new Date(endAt).getTime();
  const ms = end - Date.now();
  if (ms <= 0) return "Auction closed";
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return `Auction ends in ${d}d ${h}h ${m}m`;
}

export function HeroBanner({
  raisedCents,
  bidCount,
  endAt,
}: {
  raisedCents: number;
  bidCount: number;
  endAt: string;
}) {
  const [countdown, setCountdown] = useState("Auction ending soon");
  useEffect(() => {
    const tick = () => setCountdown(auctionCountdown(endAt));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [endAt]);

  const floor = MINIMUM_INVENTORY_CENTS;
  const pctOfFloor = floor > 0 ? (raisedCents / floor) * 100 : 0;
  const barPct = Math.min(100, Math.max(0, pctOfFloor));
  const passed = raisedCents >= floor;

  return (
    <section className="mx-auto max-w-3xl px-4 pb-8 pt-12 text-center md:pt-16">
      <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
        Your brand. On my land.
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
        Bid on a real banner or flag on my field. If you win, your brand stays on
        the land for a year — and on this website after that.
      </p>

      <div className="mt-10">
        <div className="flex items-end justify-between gap-4 text-left">
          <p className="text-3xl font-semibold tabular-nums text-foreground md:text-4xl">
            <span className="text-[1.05em]">{formatEuroFromCents(raisedCents)}</span>
            <span className="ml-2 text-base font-normal text-muted-foreground">raised</span>
          </p>
          <p className="text-sm text-muted-foreground">
            {passed ? (
              <>
                floor passed ·{" "}
                <span className="font-semibold text-foreground underline decoration-dotted">
                  {Math.round(pctOfFloor)}%
                </span>
              </>
            ) : (
              <>
                {Math.round(pctOfFloor)}% of {formatEuroFromCents(floor, { compact: true })} floor
              </>
            )}
          </p>
        </div>
        <div
          className="mt-3 h-3 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(barPct)}
          aria-label="Progress toward the opening floor"
        >
          <div
            className="h-full rounded-full bg-lime transition-[width] duration-500"
            style={{ width: `${barPct}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{countdown}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {bidCount} {bidCount === 1 ? "bid" : "bids"} · €100k unlocks the build. It covers
          printing, installation, crew and regulatory costs.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a href="#marketplace" className={cn(buttonVariants(), "h-11 px-5")}>
          Choose a spot
        </a>
        <a href="#how-it-works" className={cn(buttonVariants({ variant: "outline" }), "h-11 px-5")}>
          How this works
        </a>
      </div>
    </section>
  );
}
