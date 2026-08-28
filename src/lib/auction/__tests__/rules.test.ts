import { describe, expect, it } from "vitest";
import { PLACEMENT_DEFINITIONS, MINIMUM_INVENTORY_CENTS } from "@/lib/auction/inventory";
import {
  depositCents,
  inventoryMinimumCents,
  isBidStale,
  minimumIncrementCents,
  nextMinimumBidCents,
  shouldExtendForAntiSnipe,
  extendedEndTime,
} from "@/lib/auction/rules";
import {
  confirmPaidBid,
  createEmptyStore,
  createPendingBid,
} from "@/lib/data/store";
import type { BidFormInput } from "@/lib/types";

const anti = {
  enabled: true,
  windowSeconds: 300,
  extensionSeconds: 300,
};

function form(over: Partial<BidFormInput> = {}): BidFormInput {
  return {
    placementId: "B-S-01",
    amountCents: 60_000,
    fullName: "Ana Silva",
    workEmail: "ana@example.com",
    companyName: "Example Co",
    companyWebsite: "https://example.com",
    acceptTerms: true,
    acceptRegulatory: true,
    ...over,
  };
}

describe("inventory", () => {
  it("seeds 85 unique placements", () => {
    const ids = PLACEMENT_DEFINITIONS.map((p) => p.id);
    expect(PLACEMENT_DEFINITIONS).toHaveLength(85);
    expect(new Set(ids).size).toBe(85);
    expect(ids).toContain("B-C-01");
    expect(ids).toContain("B-L-06");
    expect(ids).toContain("B-M-14");
    expect(ids).toContain("B-S-28");
    expect(ids).toContain("F-L-04");
    expect(ids).toContain("F-P-32");
  });

  it("derives minimum inventory from placements (€100,300)", () => {
    expect(inventoryMinimumCents(PLACEMENT_DEFINITIONS)).toBe(10_030_000);
    expect(MINIMUM_INVENTORY_CENTS).toBe(10_030_000);
    expect(MINIMUM_INVENTORY_CENTS).toBe(
      1 * 2_500_000 +
        6 * 350_000 +
        14 * 125_000 +
        28 * 60_000 +
        4 * 100_000 +
        32 * 50_000,
    );
  });
});

describe("increments and deposits", () => {
  it("uses max(€10, 5%) rounded up to a whole euro", () => {
    expect(minimumIncrementCents(60_000)).toBe(3_000);
    expect(minimumIncrementCents(100_000)).toBe(5_000);
    expect(minimumIncrementCents(125_000)).toBe(6_300);
    expect(minimumIncrementCents(10_000)).toBe(1_000);
    expect(nextMinimumBidCents(null, 60_000)).toBe(60_000);
    expect(nextMinimumBidCents(60_000, 60_000)).toBe(63_000);
  });

  it("charges 20% deposit with a €10 minimum", () => {
    expect(depositCents(60_000)).toBe(12_000);
    expect(depositCents(2_500_000)).toBe(500_000);
    expect(depositCents(4_000)).toBe(1_000);
  });
});

describe("anti-snipe", () => {
  it("extends a placement when a bid lands in the final five minutes", () => {
    const endsAt = new Date("2026-09-30T12:00:00.000Z");
    const bidAt = new Date("2026-09-30T11:56:00.000Z");
    expect(shouldExtendForAntiSnipe(bidAt, endsAt, anti)).toBe(true);
    expect(extendedEndTime(bidAt, endsAt, anti).toISOString()).toBe(
      "2026-09-30T12:01:00.000Z",
    );
    const early = new Date("2026-09-30T10:00:00.000Z");
    expect(shouldExtendForAntiSnipe(early, endsAt, anti)).toBe(false);
    expect(extendedEndTime(early, endsAt, { ...anti, enabled: false }).toISOString()).toBe(
      endsAt.toISOString(),
    );
  });
});

describe("stale and simultaneous bids", () => {
  it("rejects a stale amount against the current leader", () => {
    expect(isBidStale(60_000, 60_000, 60_000)).toBe(true);
    expect(isBidStale(63_000, 60_000, 60_000)).toBe(false);
  });

  it("only the first confirmed payment becomes leader when two race", async () => {
    const store = createEmptyStore();
    store.settings.mode = "live";
    const a = createPendingBid(store, form({ amountCents: 60_000 }), {
      idempotencyKey: "a",
      checkoutSessionId: "cs_a",
    });
    const b = createPendingBid(store, form({ amountCents: 60_000, workEmail: "b@example.com" }), {
      idempotencyKey: "b",
      checkoutSessionId: "cs_b",
    });
    const first = await confirmPaidBid(store, {
      bidId: a.id,
      paidAmountCents: depositCents(60_000),
      now: new Date("2026-09-01T12:00:00.000Z"),
    });
    expect(first.ok).toBe(true);
    const second = await confirmPaidBid(store, {
      bidId: b.id,
      paidAmountCents: depositCents(60_000),
      now: new Date("2026-09-01T12:00:01.000Z"),
    });
    expect(second.ok).toBe(false);
    if (!second.ok) expect(second.reason).toBe("stale");
    expect(store.bids.filter((x) => x.status === "leading")).toHaveLength(1);
  });

  it("confirms a higher bid and marks the previous leader outbid", async () => {
    const store = createEmptyStore();
    const a = createPendingBid(store, form({ amountCents: 60_000 }), {
      idempotencyKey: "a2",
    });
    await confirmPaidBid(store, {
      bidId: a.id,
      paidAmountCents: depositCents(60_000),
      now: new Date("2026-09-01T12:00:00.000Z"),
    });
    const b = createPendingBid(
      store,
      form({ amountCents: 63_000, workEmail: "c@example.com" }),
      { idempotencyKey: "c2" },
    );
    const result = await confirmPaidBid(store, {
      bidId: b.id,
      paidAmountCents: depositCents(63_000),
      now: new Date("2026-09-01T12:00:02.000Z"),
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.outbidBidIds).toContain(a.id);
    expect(store.bids.find((x) => x.id === a.id)?.status).toBe("outbid");
    expect(store.bids.find((x) => x.id === b.id)?.status).toBe("leading");
  });
});

describe("empty public store", () => {
  it("starts with no bids on the map", () => {
    const store = createEmptyStore();
    expect(store.bids).toHaveLength(0);
    expect(store.brands).toHaveLength(0);
  });
});
