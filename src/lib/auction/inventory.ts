import type { PlacementDefinition, Point } from "@/lib/types";
import { inventoryMinimumCents } from "./rules";

function pt(x: number, y: number): Point {
  return { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) };
}

function rotatedRect(
  cx: number,
  cy: number,
  w: number,
  h: number,
  rotationDeg: number,
): [Point, Point, Point, Point] {
  const rad = (rotationDeg * Math.PI) / 180;
  const hw = w / 2;
  const hh = h / 2;
  const corners: Array<[number, number]> = [
    [-hw, -hh],
    [hw, -hh],
    [hw, hh],
    [-hw, hh],
  ];
  return corners.map(([x, y]) =>
    pt(
      cx + x * Math.cos(rad) - y * Math.sin(rad),
      cy + x * Math.sin(rad) + y * Math.cos(rad),
    ),
  ) as [Point, Point, Point, Point];
}

function pad(n: number, width = 2) {
  return String(n).padStart(width, "0");
}

/** Percent coords on /images/land-aerial.jpg, inside the white-outlined plot. */
const PLOT_CX = 47;
const PLOT_CY = 43;
const PLOT_Y_SQUASH = 0.62;

function ringBanners(args: {
  count: number;
  radius: number;
  w: number;
  h: number;
  prefix: string;
  names: (i: number) => string;
  notes: (i: number) => string;
  minBidCents: number;
  widthM: number;
  heightM: number;
  tier: PlacementDefinition["tier"];
  startAngle?: number;
}): PlacementDefinition[] {
  const { count, radius, w, h, prefix, startAngle = -90 } = args;
  return Array.from({ length: count }, (_, i) => {
    const angle = startAngle + (360 / count) * i;
    const rad = (angle * Math.PI) / 180;
    const cx = PLOT_CX + radius * Math.cos(rad);
    const cy = PLOT_CY + radius * Math.sin(rad) * PLOT_Y_SQUASH;
    const id = `${prefix}-${pad(i + 1)}`;
    return {
      id,
      type: "banner" as const,
      tier: args.tier,
      name: args.names(i + 1),
      sizeLabel: `${args.widthM} × ${args.heightM} m`,
      widthM: args.widthM,
      heightM: args.heightM,
      minBidCents: args.minBidCents,
      locationNote: args.notes(i + 1),
      geometry: {
        kind: "rect" as const,
        points: rotatedRect(cx, cy, w, h, angle + 90),
      },
    };
  });
}

function ellipsePins(
  count: number,
  rx: number,
  ry: number,
  startAngle: number,
): Point[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = ((startAngle + (360 / count) * i) * Math.PI) / 180;
    return pt(PLOT_CX + rx * Math.cos(angle), PLOT_CY + ry * Math.sin(angle));
  });
}

export function buildPlacementDefinitions(): PlacementDefinition[] {
  const central: PlacementDefinition = {
    id: "B-C-01",
    type: "banner",
    tier: "central",
    name: "Central field banner",
    sizeLabel: "15 × 5 m",
    widthM: 15,
    heightM: 5,
    minBidCents: 2_500_000,
    locationNote:
      "The dominant ground banner at the centre of the plot — the piece every overhead shot will find first.",
    geometry: {
      kind: "rect",
      points: rotatedRect(PLOT_CX, PLOT_CY, 13.2, 4.4, -4),
    },
  };

  const large = ringBanners({
    count: 6,
    radius: 11.2,
    w: 9.4,
    h: 3.6,
    prefix: "B-L",
    tier: "large",
    widthM: 10,
    heightM: 4,
    minBidCents: 350_000,
    names: (i) => `Large ring banner ${pad(i)}`,
    notes: (i) =>
      `One of six large banners ringing the centre. Position ${pad(i)} sits in the inner composition belt.`,
  });

  const medium = ringBanners({
    count: 14,
    radius: 18.6,
    w: 6.8,
    h: 2.8,
    prefix: "B-M",
    tier: "medium",
    widthM: 7,
    heightM: 3,
    minBidCents: 125_000,
    startAngle: -78,
    names: (i) => `Medium field banner ${pad(i)}`,
    notes: (i) =>
      `Second ring, position ${pad(i)}. Visible from the terrace edge and in mid-altitude drone passes.`,
  });

  const small = ringBanners({
    count: 28,
    radius: 25.4,
    w: 5.1,
    h: 2.0,
    prefix: "B-S",
    tier: "small",
    widthM: 5,
    heightM: 2,
    minBidCents: 60_000,
    startAngle: -84,
    names: (i) => `Small outer banner ${pad(i)}`,
    notes: (i) =>
      `Outer field position ${pad(i)}. Completes the composition along the plot’s working edge.`,
  });

  const landmarkNotes = [
    "Northwest entrance — the first flag you meet coming off the access track.",
    "Northeast ridge — catches the Atlantic light late in the afternoon.",
    "Southeast corner — frames the valley drop toward São Vicente.",
    "Southwest terrace — sits against the darker laurel edge.",
  ];
  const landmarkPoints: Point[] = [
    pt(18.5, 18.5),
    pt(76.5, 19.2),
    pt(80.2, 66.4),
    pt(17.8, 68.1),
  ];
  const landmark: PlacementDefinition[] = landmarkPoints.map((point, i) => ({
    id: `F-L-${pad(i + 1)}`,
    type: "flag",
    tier: "landmark",
    name: `Landmark flag ${pad(i + 1)}`,
    sizeLabel: "4.5 m high",
    widthM: 1.4,
    heightM: 4.5,
    minBidCents: 100_000,
    locationNote: landmarkNotes[i]!,
    geometry: { kind: "pin", point },
  }));

  const perimeterPoints = ellipsePins(32, 33.5, 24.8, -90);
  const perimeter: PlacementDefinition[] = perimeterPoints.map((point, i) => ({
    id: `F-P-${pad(i + 1)}`,
    type: "flag",
    tier: "perimeter",
    name: `Perimeter flag ${pad(i + 1)}`,
    sizeLabel: "2.8 m high",
    widthM: 0.9,
    heightM: 2.8,
    minBidCents: 50_000,
    locationNote: `Boundary flag ${pad(i + 1)} of 32, distributed around the plot edge.`,
    geometry: { kind: "pin", point },
  }));

  const all = [
    central,
    ...large,
    ...medium,
    ...small,
    ...landmark,
    ...perimeter,
  ];

  const ids = new Set(all.map((p) => p.id));
  if (all.length !== 85 || ids.size !== 85) {
    throw new Error(
      `Inventory must contain 85 unique placements, got ${all.length}/${ids.size}`,
    );
  }
  return all;
}

export const PLACEMENT_DEFINITIONS = buildPlacementDefinitions();

export const MINIMUM_INVENTORY_CENTS = inventoryMinimumCents(
  PLACEMENT_DEFINITIONS,
);

export const PLACEMENT_COUNT = PLACEMENT_DEFINITIONS.length;
