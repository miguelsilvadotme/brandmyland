"use client";

import { useMemo, useState } from "react";
import type { PublicBid, PublicPlacement } from "@/lib/types";
import { formatEuroFromCents } from "@/lib/auction/money";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SortKey = "current" | "minimum" | "bids" | "ending" | "tier";

const INITIAL_ROWS = 15;

export function AuctionTable({
  placements,
  bids,
  onSelect,
}: {
  placements: PublicPlacement[];
  bids: PublicBid[];
  onSelect: (id: string) => void;
}) {
  const [sort, setSort] = useState<SortKey>("current");
  const [type, setType] = useState<"all" | "banner" | "flag">("all");
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const rows = useMemo(() => {
    let list = placements.slice();
    if (type !== "all") list = list.filter((p) => p.type === type);
    if (onlyOpen) list = list.filter((p) => p.bidCount === 0);
    list.sort((a, b) => {
      if (sort === "current") {
        const av = a.currentBidCents ?? a.minBidCents;
        const bv = b.currentBidCents ?? b.minBidCents;
        return bv - av;
      }
      if (sort === "minimum") return b.minBidCents - a.minBidCents;
      if (sort === "bids") return b.bidCount - a.bidCount;
      if (sort === "ending") return a.endsAt.localeCompare(b.endsAt);
      return a.tier.localeCompare(b.tier);
    });
    return list;
  }, [placements, sort, type, onlyOpen]);

  const visible = expanded ? rows : rows.slice(0, INITIAL_ROWS);
  const hiddenCount = Math.max(0, rows.length - INITIAL_ROWS);

  return (
    <section id="auction" className="mt-10 scroll-mt-24">
      <Tabs defaultValue="spots">
        <TabsList>
          <TabsTrigger value="spots">Spots</TabsTrigger>
          <TabsTrigger value="history">Bid history</TabsTrigger>
        </TabsList>
        <TabsContent value="spots" className="mt-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {(
              [
                ["current", "Current bid"],
                ["minimum", "Minimum bid"],
                ["bids", "Most bids"],
                ["ending", "Ending soon"],
                ["tier", "Tier"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={cn(
                  "rounded-full border px-3 py-1 text-xs",
                  sort === key ? "bg-foreground text-primary-foreground" : "bg-card",
                )}
                onClick={() => setSort(key)}
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              className="rounded-full border px-3 py-1 text-xs"
              onClick={() => setType(type === "banner" ? "flag" : type === "flag" ? "all" : "banner")}
            >
              {type === "all" ? "Banner or flag" : type}
            </button>
            <button
              type="button"
              className="rounded-full border px-3 py-1 text-xs"
              onClick={() => setOnlyOpen((v) => !v)}
            >
              {onlyOpen ? "Showing available" : "Available / no bids"}
            </button>
          </div>
          {rows.length === 0 ? (
            <p className="rounded-xl border border-dashed p-6 text-sm">No placements match these filters.</p>
          ) : (
            <>
              <div className="hidden overflow-x-auto rounded-xl border md:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/70">
                    <tr>
                      {["Spot", "Type / tier", "Size", "Leading brand", "Current bid", "Bids", "Status", ""].map((h) => (
                        <th key={h} className="px-3 py-2 font-medium">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((p) => (
                      <tr key={p.id} className="border-t">
                        <td className="px-3 py-2 font-medium">{p.id}</td>
                        <td className="px-3 py-2 capitalize">
                          {p.type} · {p.tier}
                        </td>
                        <td className="px-3 py-2">{p.sizeLabel}</td>
                        <td className="px-3 py-2">
                          {p.leadingBrand?.isDemo ? "Sample · " : ""}
                          {p.leadingBrand?.displayName ?? "—"}
                        </td>
                        <td className="px-3 py-2">
                          {formatEuroFromCents(p.currentBidCents ?? p.minBidCents)}
                        </td>
                        <td className="px-3 py-2">{p.bidCount}</td>
                        <td className="px-3 py-2 capitalize">{p.status.replace("_", " ")}</td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            className={cn(buttonVariants({ size: "sm" }))}
                            onClick={() => onSelect(p.id)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="grid gap-3 md:hidden">
                {visible.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onSelect(p.id)}
                    className="rounded-xl border bg-card p-4 text-left"
                  >
                    <p className="font-semibold">
                      {p.id} · {p.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {p.tier} · {p.sizeLabel}
                    </p>
                    <p className="mt-2 text-sm">
                      {formatEuroFromCents(p.currentBidCents ?? p.minBidCents)} · {p.bidCount} bids
                    </p>
                  </button>
                ))}
              </div>
              {hiddenCount > 0 ? (
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    className={cn(buttonVariants({ variant: expanded ? "outline" : "default" }), "h-10 px-5")}
                    onClick={() => setExpanded((v) => !v)}
                  >
                    {expanded ? "Show less" : "Expand more"}
                  </button>
                </div>
              ) : null}
            </>
          )}
        </TabsContent>
        <TabsContent value="history" className="mt-4">
          {bids.length === 0 ? (
            <p className="text-sm text-muted-foreground">No public bid history yet.</p>
          ) : (
            <ul className="divide-y rounded-xl border">
              {bids.slice(0, 40).map((bid) => (
                <li key={bid.id} className="flex flex-wrap justify-between gap-2 px-4 py-3 text-sm">
                  <span>
                    {bid.placementId} · {bid.publicBidderName}
                    {bid.brand?.isDemo ? " (sample)" : ""}
                  </span>
                  <span>{formatEuroFromCents(bid.amountCents)}</span>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
}
