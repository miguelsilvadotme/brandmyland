"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import type { PublicPlacement } from "@/lib/types";
import { formatEuroFromCents } from "@/lib/auction/money";
import { PlacementShape } from "@/components/placement-shape";
import { MapControls } from "@/components/map-controls";
import { MapFilters, type MapFilter, type MapView } from "@/components/map-filters";
import { PLOT_OUTLINE } from "@/lib/auction/inventory";
import { trackClientEvent } from "@/lib/analytics";

export function LandMap({
  placements,
  selectedId,
  onSelect,
  landImagePath = "/images/land-aerial.jpg",
  heading,
}: {
  placements: PublicPlacement[];
  selectedId?: string | null;
  onSelect: (id: string | null) => void;
  landImagePath?: string;
  heading?: ReactNode;
}) {
  const [filter, setFilter] = useState<MapFilter>("all");
  const [view, setView] = useState<MapView>("live");
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const drag = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const viewed = useRef(false);
  useEffect(() => {
    if (!viewed.current) {
      viewed.current = true;
      trackClientEvent("map_viewed");
    }
  }, []);

  const visible = useMemo(() => {
    return placements.filter((p) => {
      if (filter === "banners") return p.type === "banner";
      if (filter === "flags") return p.type === "flag";
      if (filter === "available") return p.bidCount === 0;
      if (filter === "has_bids") return p.bidCount > 0;
      if (["central", "large", "medium", "small", "landmark", "perimeter"].includes(filter)) {
        return p.tier === filter;
      }
      return true;
    });
  }, [placements, filter]);

  function onPointerDown(e: React.PointerEvent) {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current) return;
    setPan({
      x: drag.current.panX + (e.clientX - drag.current.x),
      y: drag.current.panY + (e.clientY - drag.current.y),
    });
  }
  function onPointerUp() {
    drag.current = null;
  }

  const hover = placements.find((p) => p.id === hoverId);
  const plotPoints = PLOT_OUTLINE.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-6">
        {heading ? <div className="min-w-0">{heading}</div> : null}
        <MapFilters filter={filter} onFilter={setFilter} view={view} onView={setView} />
      </div>
      <div
        className={`relative overflow-hidden rounded-2xl border border-border bg-[#11120f] shadow-[0_20px_60px_-30px_rgba(17,18,15,0.45)] ${view === "final" ? "aspect-[1672/940]" : "aspect-[3/2]"}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <div
          className="absolute inset-0 origin-center touch-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          }}
        >
          {view === "final" ? (
            <Image
              src="/images/land-final-vision.jpg"
              alt="Final vision of Brand My Land with banners and flags laid out on the plot"
              fill
              className="object-contain"
              draggable={false}
              priority
              unoptimized
            />
          ) : (
            <>
              <Image
                src={failedSrc ?? "/images/sao-vicente.jpg"}
                alt="São Vicente, Madeira — the mountains and coast behind the plot"
                fill
                className="scale-110 object-cover blur-[6px]"
                onError={() => setFailedSrc(landImagePath)}
                draggable={false}
                priority
                unoptimized
              />
              <div className="absolute inset-0 bg-[#11120f]/20" />
            </>
          )}
          {view === "live" ? (
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 size-full"
            role="img"
            aria-label="Interactive auction map of 85 placements"
          >
            <polygon
              points={plotPoints}
              fill="none"
              stroke="#c7ff35"
              strokeWidth={0.45}
              strokeLinejoin="round"
            />
            {visible.map((placement) => (
              <PlacementShape
                key={placement.id}
                placement={placement}
                selected={selectedId === placement.id}
                view={view}
                onHover={setHoverId}
                onSelect={() => onSelect(placement.id)}
              />
            ))}
          </svg>
          ) : null}
        </div>
        <div
          className="absolute top-3 right-3 z-10"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <MapControls
            onZoomIn={() => setScale((s) => Math.min(3, s + 0.2))}
            onZoomOut={() => setScale((s) => Math.max(0.7, s - 0.2))}
            onReset={() => {
              setScale(1);
              setPan({ x: 0, y: 0 });
            }}
          />
        </div>
        {hover ? (
          <div className="pointer-events-none absolute bottom-3 left-3 max-w-xs rounded-xl border border-border bg-card/95 px-3 py-2 text-xs shadow-md">
            <p className="font-semibold">
              {hover.id} · {hover.name}
            </p>
            <p className="text-muted-foreground">
              {hover.tier} · {hover.sizeLabel} ·{" "}
              {hover.currentBidCents
                ? formatEuroFromCents(hover.currentBidCents)
                : `from ${formatEuroFromCents(hover.minBidCents)}`}
            </p>
          </div>
        ) : null}
        {view === "live" ? (
        <p className="pointer-events-none absolute top-3 left-3 rounded-lg border border-white/30 bg-black/55 px-2.5 py-1 text-[11px] text-white/90">
          The lime line is the plot
        </p>
        ) : (
        <p className="pointer-events-none absolute top-3 left-3 rounded-lg border border-white/30 bg-black/55 px-2.5 py-1 text-[11px] text-white/90">
          Final vision — how the land could look
        </p>
        )}
        {view === "live" && visible.length === 0 ? (
          <p className="absolute inset-0 flex items-center justify-center bg-background/70 text-sm">
            No placements match this filter.
          </p>
        ) : null}
      </div>
    </div>
  );
}
