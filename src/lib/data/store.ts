import { randomUUID } from "node:crypto";
import type {
  ActivityItem,
  AdminSummary,
  AuctionSettings,
  BidFormInput,
  FaqItem,
  Milestone,
  PublicBid,
  PublicBrand,
  PublicPlacement,
} from "@/lib/types";
import { PLACEMENT_DEFINITIONS } from "@/lib/auction/inventory";
import {
  assertValidBidAmount,
  BidValidationError,
  depositCents,
  extendedEndTime,
  nextMinimumBidCents,
} from "@/lib/auction/rules";
import {
  DEFAULT_FAQS,
  DEFAULT_MILESTONES,
  buildDefaultSettings,
} from "@/lib/config";
import { SAMPLE_BRANDS, demoLogoDataUri } from "./demo-brands";

export type InternalBidder = {
  id: string;
  fullName: string;
  email: string;
  companyName: string;
  companyWebsite: string;
  twitterHandle: string | null;
  hidePublicName: boolean;
};

export type InternalBrand = PublicBrand & { bidderId: string };

export type InternalBid = {
  id: string;
  placementId: string;
  bidderId: string;
  brandId: string;
  amountCents: number;
  depositCents: number;
  status: PublicBid["status"];
  createdAt: string;
  publicMessage: string | null;
  stripeCheckoutSessionId: string | null;
  stripePaymentIntentId: string | null;
  idempotencyKey: string;
  winnerBalanceStatus:
    | "not_applicable"
    | "pending"
    | "requested"
    | "paid";
  invoiceUrl: string | null;
};

export type InternalPayment = {
  id: string;
  bidId: string;
  amountCents: number;
  currency: "eur";
  status: "requires_payment" | "processing" | "succeeded" | "failed" | "canceled";
  stripeCheckoutSessionId: string | null;
  stripePaymentIntentId: string | null;
  createdAt: string;
};

export type InternalRefund = {
  id: string;
  bidId: string;
  paymentId: string;
  amountCents: number;
  status: "queued" | "processing" | "succeeded" | "failed";
  stripeRefundId: string | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InternalReservation = {
  id: string;
  placementId: string;
  fullName: string;
  email: string;
  companyName: string;
  companyWebsite: string;
  intendedAmountCents: number;
  createdAt: string;
};

export type AuditEvent = {
  id: string;
  createdAt: string;
  actor: string;
  action: string;
  detail: string;
};

export type PlacementEnd = { placementId: string; endsAt: string };

export type AppStore = {
  settings: AuctionSettings;
  faqs: FaqItem[];
  milestones: Milestone[];
  bidders: InternalBidder[];
  brands: InternalBrand[];
  bids: InternalBid[];
  payments: InternalPayment[];
  refunds: InternalRefund[];
  reservations: InternalReservation[];
  placementEnds: PlacementEnd[];
  audit: AuditEvent[];
};

const locks = new Map<string, Promise<unknown>>();

async function withLock<T>(key: string, fn: () => Promise<T> | T): Promise<T> {
  const previous = locks.get(key) ?? Promise.resolve();
  let release!: () => void;
  const current = new Promise<void>((resolve) => {
    release = resolve;
  });
  const chained = previous.then(() => current);
  locks.set(key, chained);
  await previous;
  try {
    return await fn();
  } finally {
    release();
    if (locks.get(key) === chained) locks.delete(key);
  }
}

function nowIso() {
  return new Date().toISOString();
}

function maskName(fullName: string, hide: boolean) {
  if (!hide) return fullName;
  const [first] = fullName.split(" ");
  return `${first ?? "Bidder"} · private`;
}

export function createEmptyStore(settings = buildDefaultSettings()): AppStore {
  return {
    settings,
    faqs: DEFAULT_FAQS.map((f) => ({ ...f })),
    milestones: DEFAULT_MILESTONES.map((m) => ({ ...m })),
    bidders: [],
    brands: [],
    bids: [],
    payments: [],
    refunds: [],
    reservations: [],
    placementEnds: PLACEMENT_DEFINITIONS.map((p) => ({
      placementId: p.id,
      endsAt: settings.endAt,
    })),
    audit: [],
  };
}

export function seedDemoStore(store: AppStore): AppStore {
  const seeded = structuredClone(store) as AppStore;
  const demoSlots = [
    "B-C-01",
    "B-L-01",
    "B-L-03",
    "B-M-02",
    "B-M-07",
    "B-S-04",
    "B-S-11",
    "F-L-01",
    "F-P-08",
    "F-P-20",
  ];
  demoSlots.forEach((placementId, i) => {
    const def = PLACEMENT_DEFINITIONS.find((p) => p.id === placementId)!;
    const sample = SAMPLE_BRANDS[i % SAMPLE_BRANDS.length]!;
    const bidder: InternalBidder = {
      id: `demo-bidder-${i}`,
      fullName: `Demo Contact ${i + 1}`,
      email: `demo${i}@example.com`,
      companyName: sample.name,
      companyWebsite: sample.site,
      twitterHandle: null,
      hidePublicName: i % 3 === 0,
    };
    const brand: InternalBrand = {
      id: `demo-brand-${i}`,
      bidderId: bidder.id,
      displayName: sample.name,
      website: sample.site,
      logoUrl: demoLogoDataUri(sample.name, sample.color),
      publicMessage: "Sample placement for the preview map.",
      moderationStatus: "approved",
      isDemo: true,
    };
    const amount = def.minBidCents + (i + 1) * 25_000;
    const bid: InternalBid = {
      id: `demo-bid-${i}`,
      placementId,
      bidderId: bidder.id,
      brandId: brand.id,
      amountCents: amount,
      depositCents: depositCents(amount),
      status: "leading",
      createdAt: new Date(Date.now() - (i + 2) * 3600_000).toISOString(),
      publicMessage: brand.publicMessage,
      stripeCheckoutSessionId: null,
      stripePaymentIntentId: null,
      idempotencyKey: `demo-${i}`,
      winnerBalanceStatus: "not_applicable",
      invoiceUrl: null,
    };
    seeded.bidders.push(bidder);
    seeded.brands.push(brand);
    seeded.bids.push(bid);
    seeded.payments.push({
      id: `demo-pay-${i}`,
      bidId: bid.id,
      amountCents: bid.depositCents,
      currency: "eur",
      status: "succeeded",
      stripeCheckoutSessionId: null,
      stripePaymentIntentId: null,
      createdAt: bid.createdAt,
    });
  });
  return seeded;
}

function leadingBid(store: AppStore, placementId: string): InternalBid | null {
  const valid = store.bids
    .filter(
      (b) =>
        b.placementId === placementId &&
        (b.status === "leading" || b.status === "valid" || b.status === "won"),
    )
    .sort((a, b) => b.amountCents - a.amountCents || a.createdAt.localeCompare(b.createdAt));
  return valid[0] ?? null;
}

export function toPublicPlacement(
  store: AppStore,
  now = new Date(),
): PublicPlacement[] {
  return PLACEMENT_DEFINITIONS.map((def) => {
    const end =
      store.placementEnds.find((e) => e.placementId === def.id)?.endsAt ??
      store.settings.endAt;
    const leader = leadingBid(store, def.id);
    const bidCount = store.bids.filter(
      (b) =>
        b.placementId === def.id &&
        ["leading", "valid", "outbid", "won", "refunded"].includes(b.status),
    ).length;
    const brand = leader
      ? store.brands.find((br) => br.id === leader.brandId) ?? null
      : null;
    const closed = now.toISOString() >= end || store.settings.mode === "closed";
    return {
      ...def,
      currentBidCents: leader?.amountCents ?? null,
      bidCount,
      leadingBrand:
        brand && brand.moderationStatus === "approved"
          ? brand
          : brand
            ? { ...brand, displayName: "Pending review", logoUrl: null, website: null }
            : null,
      endsAt: end,
      status: closed
        ? leader
          ? "won"
          : "closed"
        : leader
          ? "has_bids"
          : "available",
    };
  });
}

export function toPublicBids(store: AppStore, placementId?: string): PublicBid[] {
  return store.bids
    .filter((b) => (placementId ? b.placementId === placementId : true))
    .filter((b) =>
      ["leading", "valid", "outbid", "won", "refunded", "rejected"].includes(
        b.status,
      ),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((bid) => {
      const bidder = store.bidders.find((x) => x.id === bid.bidderId)!;
      const brand = store.brands.find((x) => x.id === bid.brandId) ?? null;
      const publicBrand =
        brand && brand.moderationStatus === "approved" ? brand : null;
      return {
        id: bid.id,
        placementId: bid.placementId,
        amountCents: bid.amountCents,
        status: bid.status,
        createdAt: bid.createdAt,
        publicBidderName: maskName(bidder.fullName, bidder.hidePublicName),
        brand: publicBrand,
      };
    });
}

export function activityFromStore(store: AppStore): ActivityItem[] {
  return toPublicBids(store)
    .slice(0, 24)
    .map((bid) => ({
      id: bid.id,
      createdAt: bid.createdAt,
      placementId: bid.placementId,
      message: `${bid.publicBidderName} bid ${bid.amountCents}c on ${bid.placementId}`,
    }));
}

export function adminSummary(store: AppStore): AdminSummary {
  const placements = toPublicPlacement(store);
  const leading = store.bids.filter((b) => b.status === "leading" || b.status === "won");
  const held = store.payments
    .filter((p) => p.status === "succeeded")
    .reduce((s, p) => {
      const refunded = store.refunds.some(
        (r) => r.paymentId === p.id && r.status === "succeeded",
      );
      return refunded ? s : s + p.amountCents;
    }, 0);
  const pendingRefund = store.refunds
    .filter((r) => r.status === "queued" || r.status === "processing")
    .reduce((s, r) => s + r.amountCents, 0);
  return {
    leadingBidTotalCents: leading.reduce((s, b) => s + b.amountCents, 0),
    depositHeldCents: held,
    pendingRefundCents: pendingRefund,
    validBidCount: store.bids.filter((b) =>
      ["leading", "valid", "won", "outbid"].includes(b.status),
    ).length,
    placementsWithBids: placements.filter((p) => p.bidCount > 0).length,
    placementCount: placements.length,
  };
}

export type ConfirmBidResult =
  | { ok: true; bid: InternalBid; outbidBidIds: string[] }
  | { ok: false; reason: "stale" | "closed" | "duplicate"; message: string; bid?: InternalBid };

export async function confirmPaidBid(
  store: AppStore,
  input: {
    bidId?: string;
    checkoutSessionId?: string;
    paymentIntentId?: string;
    paidAmountCents: number;
    now?: Date;
  },
): Promise<ConfirmBidResult> {
  const bid = store.bids.find(
    (b) =>
      b.id === input.bidId ||
      b.stripeCheckoutSessionId === input.checkoutSessionId,
  );
  if (!bid) {
    return { ok: false, reason: "duplicate", message: "Unknown bid" };
  }
  return withLock(bid.placementId, () => {
    if (bid.status === "leading" || bid.status === "valid") {
      return { ok: true, bid, outbidBidIds: [] };
    }
    const def = PLACEMENT_DEFINITIONS.find((p) => p.id === bid.placementId)!;
    const now = input.now ?? new Date();
    const end = new Date(
      store.placementEnds.find((e) => e.placementId === bid.placementId)?.endsAt ??
        store.settings.endAt,
    );
    if (now >= end || store.settings.mode === "closed") {
      bid.status = "expired";
      return { ok: false, reason: "closed", message: "Auction already closed", bid };
    }
    const current = leadingBid(store, bid.placementId);
    try {
      assertValidBidAmount(bid.amountCents, current?.amountCents ?? null, def.minBidCents);
    } catch (error) {
      bid.status = "failed";
      if (error instanceof BidValidationError && error.code === "stale") {
        return { ok: false, reason: "stale", message: error.message, bid };
      }
      throw error;
    }
    const expectedDeposit = depositCents(bid.amountCents);
    if (input.paidAmountCents < expectedDeposit) {
      bid.status = "failed";
      return {
        ok: false,
        reason: "stale",
        message: "Paid deposit does not match the required amount.",
        bid,
      };
    }
    const outbidBidIds: string[] = [];
    for (const other of store.bids) {
      if (
        other.placementId === bid.placementId &&
        other.id !== bid.id &&
        other.status === "leading"
      ) {
        other.status = "outbid";
        outbidBidIds.push(other.id);
      }
    }
    bid.status = "leading";
    bid.stripePaymentIntentId = input.paymentIntentId ?? bid.stripePaymentIntentId;
    const payment = store.payments.find((p) => p.bidId === bid.id);
    if (payment) {
      payment.status = "succeeded";
      payment.stripePaymentIntentId = input.paymentIntentId ?? null;
    }
    const nextEnd = extendedEndTime(now, end, {
      enabled: store.settings.antiSnipeEnabled,
      windowSeconds: store.settings.antiSnipeWindowSeconds,
      extensionSeconds: store.settings.antiSnipeExtensionSeconds,
    });
    const slot = store.placementEnds.find((e) => e.placementId === bid.placementId);
    if (slot) slot.endsAt = nextEnd.toISOString();
    return { ok: true, bid, outbidBidIds };
  });
}

export function createPendingBid(
  store: AppStore,
  input: BidFormInput,
  opts: { checkoutSessionId?: string; idempotencyKey: string },
): InternalBid {
  const existing = store.bids.find((b) => b.idempotencyKey === opts.idempotencyKey);
  if (existing) return existing;
  const def = PLACEMENT_DEFINITIONS.find((p) => p.id === input.placementId);
  if (!def) throw new BidValidationError("Unknown placement");
  const current = leadingBid(store, input.placementId);
  assertValidBidAmount(input.amountCents, current?.amountCents ?? null, def.minBidCents);
  const bidder: InternalBidder = {
    id: randomUUID(),
    fullName: input.fullName,
    email: input.workEmail,
    companyName: input.companyName,
    companyWebsite: input.companyWebsite,
    twitterHandle: input.twitterHandle ?? null,
    hidePublicName: Boolean(input.hidePublicName),
  };
  const brand: InternalBrand = {
    id: randomUUID(),
    bidderId: bidder.id,
    displayName: input.companyName,
    website: input.companyWebsite,
    logoUrl: null,
    publicMessage: input.publicMessage ?? null,
    moderationStatus: "pending",
    isDemo: false,
  };
  const bid: InternalBid = {
    id: randomUUID(),
    placementId: input.placementId,
    bidderId: bidder.id,
    brandId: brand.id,
    amountCents: input.amountCents,
    depositCents: depositCents(input.amountCents),
    status: "pending_payment",
    createdAt: nowIso(),
    publicMessage: input.publicMessage ?? null,
    stripeCheckoutSessionId: opts.checkoutSessionId ?? null,
    stripePaymentIntentId: null,
    idempotencyKey: opts.idempotencyKey,
    winnerBalanceStatus: "not_applicable",
    invoiceUrl: null,
  };
  store.bidders.push(bidder);
  store.brands.push(brand);
  store.bids.push(bid);
  store.payments.push({
    id: randomUUID(),
    bidId: bid.id,
    amountCents: bid.depositCents,
    currency: "eur",
    status: "requires_payment",
    stripeCheckoutSessionId: opts.checkoutSessionId ?? null,
    stripePaymentIntentId: null,
    createdAt: bid.createdAt,
  });
  return bid;
}

export function queueRefundForBid(store: AppStore, bidId: string): InternalRefund | null {
  const bid = store.bids.find((b) => b.id === bidId);
  const payment = store.payments.find((p) => p.bidId === bidId && p.status === "succeeded");
  if (!bid || !payment) return null;
  const existing = store.refunds.find(
    (r) => r.bidId === bidId && (r.status === "queued" || r.status === "succeeded"),
  );
  if (existing) return existing;
  const refund: InternalRefund = {
    id: randomUUID(),
    bidId,
    paymentId: payment.id,
    amountCents: payment.amountCents,
    status: "queued",
    stripeRefundId: null,
    error: null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  store.refunds.push(refund);
  return refund;
}

export function markRefund(
  store: AppStore,
  refundId: string,
  update: Partial<InternalRefund>,
) {
  const refund = store.refunds.find((r) => r.id === refundId);
  if (!refund) return;
  Object.assign(refund, update, { updatedAt: nowIso() });
  if (refund.status === "succeeded") {
    const bid = store.bids.find((b) => b.id === refund.bidId);
    if (bid && bid.status === "outbid") bid.status = "refunded";
    if (bid && bid.status === "rejected") bid.status = "refunded";
  }
}

export function addReservation(store: AppStore, input: BidFormInput) {
  const reservation: InternalReservation = {
    id: randomUUID(),
    placementId: input.placementId,
    fullName: input.fullName,
    email: input.workEmail,
    companyName: input.companyName,
    companyWebsite: input.companyWebsite,
    intendedAmountCents: input.amountCents,
    createdAt: nowIso(),
  };
  store.reservations.push(reservation);
  store.audit.push({
    id: randomUUID(),
    createdAt: nowIso(),
    actor: "system",
    action: "reservation_submitted",
    detail: `${input.placementId} ${input.companyName}`,
  });
  return reservation;
}

export function nextBidForPlacement(store: AppStore, placementId: string): number {
  const def = PLACEMENT_DEFINITIONS.find((p) => p.id === placementId)!;
  const current = leadingBid(store, placementId);
  return nextMinimumBidCents(current?.amountCents ?? null, def.minBidCents);
}

export { leadingBid, withLock };
