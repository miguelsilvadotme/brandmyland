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

/** Axis-aligned plot in 0–100 map space — a clean rectangle of cards. */
export const PLOT = {
  tl: { x: 16, y: 14 },
  tr: { x: 84, y: 14 },
  br: { x: 84, y: 86 },
  bl: { x: 16, y: 86 },
};

export const PLOT_OUTLINE = [PLOT.tl, PLOT.tr, PLOT.br, PLOT.bl];

function plotPoint(u: number, v: number): Point {
  const { tl, tr, br, bl } = PLOT;
  const x =
    (1 - v) * ((1 - u) * tl.x + u * tr.x) + v * ((1 - u) * bl.x + u * br.x);
  const y =
    (1 - v) * ((1 - u) * tl.y + u * tr.y) + v * ((1 - u) * bl.y + u * br.y);
  return pt(x, y);
}

function dist(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function alongEdge(a: Point, b: Point, t: number): Point {
  return pt(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
}

type Cell = { r: number; c: number; u: number; v: number; d: number };

function bannerCells(): Cell[] {
  const cols = 7;
  const rows = 7;
  const cells: Cell[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({
        r,
        c,
        u: (c + 0.5) / cols,
        v: (r + 0.5) / rows,
        d: Math.hypot(c - 3, r - 3),
      });
    }
  }
  cells.sort((a, b) => a.d - b.d || a.r - b.r || a.c - b.c);
  return cells;
}

function bannerAt(
  cell: Cell,
  args: {
    id: string;
    tier: PlacementDefinition["tier"];
    name: string;
    notes: string;
    minBidCents: number;
    widthM: number;
    heightM: number;
    sizeFrac: number;
  },
): PlacementDefinition {
  const center = plotPoint(cell.u, cell.v);
  const east = plotPoint(Math.min(1, cell.u + 0.5 / 7), cell.v);
  const south = plotPoint(cell.u, Math.min(1, cell.v + 0.5 / 7));
  const w = dist(center, east) * 2 * args.sizeFrac;
  const h = dist(center, south) * 2 * args.sizeFrac * 0.72;
  return {
    id: args.id,
    type: "banner",
    tier: args.tier,
    name: args.name,
    sizeLabel: `${args.widthM} × ${args.heightM} m`,
    widthM: args.widthM,
    heightM: args.heightM,
    minBidCents: args.minBidCents,
    locationNote: args.notes,
    geometry: {
      kind: "rect",
      points: rotatedRect(center.x, center.y, w, h, 0),
    },
  };
}

function perimeterFlags(count: number): Point[] {
  const corners = [PLOT.tl, PLOT.tr, PLOT.br, PLOT.bl, PLOT.tl].map((p) =>
    pt(p.x, p.y),
  );
  const edges: Array<{ a: Point; b: Point; len: number }> = [];
  for (let i = 0; i < 4; i++) {
    const a = corners[i]!;
    const b = corners[i + 1]!;
    edges.push({ a, b, len: dist(a, b) });
  }
  const total = edges.reduce((s, e) => s + e.len, 0);
  const points: Point[] = [];
  const inset = 0.035;
  const mid = plotPoint(0.5, 0.5);
  for (let i = 0; i < count; i++) {
    const t = ((i + 0.5) / count) * total;
    let acc = 0;
    for (const edge of edges) {
      if (acc + edge.len >= t || edge === edges[edges.length - 1]) {
        const local = (t - acc) / edge.len;
        const p = alongEdge(edge.a, edge.b, Math.min(1, Math.max(0, local)));
        points.push(
          pt(p.x + (mid.x - p.x) * inset, p.y + (mid.y - p.y) * inset),
        );
        break;
      }
      acc += edge.len;
    }
  }
  return points;
}

export function buildPlacementDefinitions(): PlacementDefinition[] {
  const cells = bannerCells();
  const centralCell = cells[0]!;
  const largeCells = cells.slice(1, 7);
  const mediumCells = cells.slice(7, 21);
  const smallCells = cells.slice(21, 49);

  const central = bannerAt(centralCell, {
    id: "B-C-01",
    tier: "central",
    name: "Central field banner",
    notes:
      "The dominant ground banner at the centre of the plot — the piece every overhead shot will find first.",
    minBidCents: 2_500_000,
    widthM: 15,
    heightM: 5,
    sizeFrac: 0.92,
  });

  const large = largeCells.map((cell, i) =>
    bannerAt(cell, {
      id: `B-L-${pad(i + 1)}`,
      tier: "large",
      name: `Large field banner ${pad(i + 1)}`,
      notes: `Large banner ${pad(i + 1)} on the inner field grid, still close to the centre of the plot.`,
      minBidCents: 350_000,
      widthM: 10,
      heightM: 4,
      sizeFrac: 0.84,
    }),
  );

  const medium = mediumCells.map((cell, i) =>
    bannerAt(cell, {
      id: `B-M-${pad(i + 1)}`,
      tier: "medium",
      name: `Medium field banner ${pad(i + 1)}`,
      notes: `Medium banner ${pad(i + 1)} in the working grid between the centre and the plot edge.`,
      minBidCents: 125_000,
      widthM: 7,
      heightM: 3,
      sizeFrac: 0.8,
    }),
  );

  const small = smallCells.map((cell, i) =>
    bannerAt(cell, {
      id: `B-S-${pad(i + 1)}`,
      tier: "small",
      name: `Small field banner ${pad(i + 1)}`,
      notes: `Small banner ${pad(i + 1)} filling the remaining ground inside the plot rectangle.`,
      minBidCents: 60_000,
      widthM: 5,
      heightM: 2,
      sizeFrac: 0.76,
    }),
  );

  const landmarkNotes = [
    "Northwest corner — first flag off the access track.",
    "Northeast corner — along the upper terrace edge.",
    "Southeast corner — toward the neighbouring houses.",
    "Southwest corner — where the plot meets the road.",
  ];
  const landmarkPoints: Point[] = [
    plotPoint(0.06, 0.06),
    plotPoint(0.94, 0.06),
    plotPoint(0.94, 0.94),
    plotPoint(0.06, 0.94),
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

  const perimeter: PlacementDefinition[] = perimeterFlags(32).map(
    (point, i) => ({
      id: `F-P-${pad(i + 1)}`,
      type: "flag",
      tier: "perimeter",
      name: `Perimeter flag ${pad(i + 1)}`,
      sizeLabel: "2.8 m high",
      widthM: 0.9,
      heightM: 2.8,
      minBidCents: 50_000,
      locationNote: `Boundary flag ${pad(i + 1)} of 32, standing on the outline of the plot.`,
      geometry: { kind: "pin", point },
    }),
  );

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
