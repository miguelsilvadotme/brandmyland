"use client";

import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  { id: "all", label: "All spots" },
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
    <div className="flex flex-wrap items-center gap-2">
      <label className="sr-only" htmlFor="map-filter">
        Placement filter
      </label>
      <Select
        value={filter}
        onValueChange={(value) => {
          if (typeof value === "string") onFilter(value as MapFilter);
        }}
      >
        <SelectTrigger
          id="map-filter"
          size="sm"
          className="min-w-40 bg-card"
          aria-label="Placement filter"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="start" alignItemWithTrigger={false} className="min-w-40">
          {FILTERS.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
