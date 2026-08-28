"use client";

import type { PublicPlacement } from "@/lib/types";
import { formatEuroFromCents } from "@/lib/auction/money";
import type { MapView } from "@/components/map-filters";

function isLimeCard(tier: string, selected: boolean) {
  return selected || tier === "central" || tier === "large" || tier === "landmark";
}

export function PlacementShape({
  placement,
  selected,
  view,
  onHover,
  onSelect,
}: {
  placement: PublicPlacement;
  selected: boolean;
  view: MapView;
  onHover: (id: string | null) => void;
  onSelect: () => void;
}) {
  const lime = isLimeCard(placement.tier, selected);
  const active = Boolean(placement.leadingBrand) || view === "final";
  const label =
    active && placement.leadingBrand
      ? `${placement.leadingBrand.displayName}`
      : `${placement.id}`;
  const price = placement.currentBidCents ?? placement.minBidCents;
  const fill = lime ? "#c7ff35" : "rgba(17,18,15,0.72)";
  const ink = lime ? "#11120f" : "#f5f3ec";

  if (placement.geometry.kind === "pin") {
    const { x, y } = placement.geometry.point;
    const size = placement.tier === "landmark" ? 2.4 : 1.7;
    return (
      <g
        tabIndex={0}
        role="button"
        aria-label={`${placement.id} ${placement.name}, ${formatEuroFromCents(price)}`}
        onFocus={() => onHover(placement.id)}
        onBlur={() => onHover(null)}
        onMouseEnter={() => onHover(placement.id)}
        onMouseLeave={() => onHover(null)}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect();
          }
        }}
        className="cursor-pointer outline-none"
      >
        <polygon
          points={`${x},${y - size} ${x + size * 0.55},${y} ${x},${y + size * 0.2} ${x - size * 0.55},${y}`}
          fill={placement.tier === "landmark" ? "#c7ff35" : "#f5f3ec"}
          stroke="#11120f"
          strokeWidth={selected ? 0.45 : 0.22}
        />
        <circle cx={x} cy={y + size * 0.35} r={0.35} fill="#11120f" />
        <title>{`${placement.id} · ${formatEuroFromCents(price)}`}</title>
      </g>
    );
  }

  const points = placement.geometry.points.map((p) => `${p.x},${p.y}`).join(" ");
  const cx = placement.geometry.points.reduce((s, p) => s + p.x, 0) / 4;
  const cy = placement.geometry.points.reduce((s, p) => s + p.y, 0) / 4;

  return (
    <g
      tabIndex={0}
      role="button"
      aria-label={`${placement.id} ${placement.name}, ${formatEuroFromCents(price)}`}
      onFocus={() => onHover(placement.id)}
      onBlur={() => onHover(null)}
      onMouseEnter={() => onHover(placement.id)}
      onMouseLeave={() => onHover(null)}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className="cursor-pointer outline-none"
    >
      <polygon
        points={points}
        fill={fill}
        stroke={lime ? "#11120f" : "rgba(245,243,236,0.35)"}
        strokeWidth={selected ? 0.45 : 0.18}
        opacity={active ? 0.97 : 0.94}
      />
      <text
        x={cx}
        y={cy - 0.45}
        textAnchor="middle"
        fontSize={placement.tier === "central" ? 1.65 : 1.1}
        fill={ink}
        fontFamily="ui-sans-serif, system-ui"
        fontWeight={600}
      >
        {view === "final" && placement.leadingBrand
          ? placement.leadingBrand.displayName.slice(0, 12)
          : label.length > 14
            ? placement.id
            : label}
      </text>
      <text
        x={cx}
        y={cy + 1.25}
        textAnchor="middle"
        fontSize={1}
        fill={ink}
        fontFamily="ui-sans-serif, system-ui"
      >
        {formatEuroFromCents(price, { compact: true })}
        {placement.bidCount ? ` · ${placement.bidCount}` : ""}
      </text>
      <title>{`${placement.id} · ${placement.tier} · ${formatEuroFromCents(price)}`}</title>
    </g>
  );
}
