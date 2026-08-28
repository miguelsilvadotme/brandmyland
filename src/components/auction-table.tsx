"use client";

import { useMemo, useState } from "react";
import type { PublicBid, PublicPlacement } from "@/lib/types";
import { formatEuroFromCents } from "@/lib/auction/money";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SortKey = "current" | "minimum" | "bids" | "ending" | "tier";
type ShowKey = "all" | "banner" | "flag" | "available";

const INITIAL_ROWS = 15;

const SORT_OPTIONS: { id: SortKey; label: string }[] = [
  { id: "current", label: "Current bid" },
  { id: "minimum", label: "Minimum bid" },
  { id: "bids", label: "Most bids" },
  { id: "ending", label: "Ending soon" },
  { id: "tier", label: "Tier" },
];

const SHOW_OPTIONS: { id: ShowKey; label: string }[] = [
  { id: "all", label: "All spots" },
  { id: "banner", label: "Banners" },
  { id: "flag", label: "Flags" },
  { id: "available", label: "Available / no bids" },
];

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
  const [show, setShow] = useState<ShowKey>("all");
  const [tab, setTab] = useState("spots");
  const [expanded, setExpanded] = useState(false);

  const rows = useMemo(() => {
    let list = placements.slice();
    if (show === "banner" || show === "flag") list = list.filter((p) => p.type === show);
    if (show === "available") list = list.filter((p) => p.bidCount === 0);
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
  }, [placements, sort, show]);

  const visible = expanded ? rows : rows.slice(0, INITIAL_ROWS);
  const hiddenCount = Math.max(0, rows.length - INITIAL_ROWS);

  return (
    <section id="auction" className="mt-10 scroll-mt-24">
      <Tabs
        value={tab}
        onValueChange={(value) => {
          if (typeof value === "string") setTab(value);
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="spots">Spots</TabsTrigger>
            <TabsTrigger value="history">Bid history</TabsTrigger>
          </TabsList>
          {tab === "spots" ? (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <label className="sr-only" htmlFor="auction-sort">
                Sort spots
              </label>
              <Select
                value={sort}
                onValueChange={(value) => {
                  if (typeof value === "string") setSort(value as SortKey);
                }}
              >
                <SelectTrigger
                  id="auction-sort"
                  size="sm"
                  className="min-w-40 bg-card"
                  aria-label="Sort spots"
                >
                  {SORT_OPTIONS.find((item) => item.id === sort)?.label ?? "Current bid"}
                </SelectTrigger>
                <SelectContent align="end" alignItemWithTrigger={false} className="min-w-40">
                  {SORT_OPTIONS.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <label className="sr-only" htmlFor="auction-show">
                Filter spots
              </label>
              <Select
                value={show}
                onValueChange={(value) => {
                  if (typeof value === "string") setShow(value as ShowKey);
                }}
              >
                <SelectTrigger
                  id="auction-show"
                  size="sm"
                  className="min-w-40 bg-card"
                  aria-label="Filter spots"
                >
                  {SHOW_OPTIONS.find((item) => item.id === show)?.label ?? "All spots"}
                </SelectTrigger>
                <SelectContent align="end" alignItemWithTrigger={false} className="min-w-40">
                  {SHOW_OPTIONS.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </div>
        <TabsContent value="spots" className="mt-4">
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
