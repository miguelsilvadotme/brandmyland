"use client";

import { cn } from "@/lib/utils";

export type MapFilter =
  | "all"
  | "banners"
  | "flags"
  | "available"
  | "has_bids"
  | "central"
  | "large"
  | "medium"
  | "small"
  | "landmark"
  | "perimeter";

export type MapView = "live" | "final";

const FILTERS: { id: MapFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "banners", label: "Banners" },
  { id: "flags", label: "Flags" },
  { id: "available", label: "Available" },
  { id: "has_bids", label: "Has bids" },
  { id: "central", label: "Central" },
  { id: "large", label: "Large" },
  { id: "medium", label: "Medium" },
  { id: "small", label: "Small" },
  { id: "landmark", label: "Landmark" },
  { id: "perimeter", label: "Perimeter" },
];

export function MapFilters({
  filter,
  onFilter,
  view,
  onView,
}: {
  filter: MapFilter;
  onFilter: (f: MapFilter) => void;
  view: MapView;
  onView: (v: MapView) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Placement filters">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onFilter(item.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs",
              filter === item.id
                ? "border-foreground bg-foreground text-primary-foreground"
                : "border-border bg-card hover:bg-muted",
            )}
            aria-pressed={filter === item.id}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="flex gap-1.5" role="group" aria-label="Map view">
        {(["live", "final"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onView(v)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs capitalize",
              view === v
                ? "border-lime bg-lime text-foreground"
                : "border-border bg-card",
            )}
            aria-pressed={view === v}
          >
            {v === "live" ? "Live auction" : "Final vision"}
          </button>
        ))}
      </div>
    </div>
  );
}
