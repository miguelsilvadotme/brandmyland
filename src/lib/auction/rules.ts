import { EUR_CENTS, roundUpToWholeEuroCents } from "./money";

export const MIN_INCREMENT_CENTS = 10 * EUR_CENTS;
export const INCREMENT_RATE_BPS = 500; // 5%
export const DEPOSIT_RATE_BPS = 2000; // 20%
export const MIN_DEPOSIT_CENTS = 10 * EUR_CENTS;
export const DEFAULT_ANTI_SNIPE_WINDOW_SECONDS = 5 * 60;
export const DEFAULT_ANTI_SNIPE_EXTENSION_SECONDS = 5 * 60;

/** Minimum increment: max(€10, 5% of current bid) rounded up to the nearest euro. */
export function minimumIncrementCents(currentBidCents: number): number {
  const fivePercent = Math.ceil((currentBidCents * INCREMENT_RATE_BPS) / 10_000);
  return Math.max(MIN_INCREMENT_CENTS, roundUpToWholeEuroCents(fivePercent));
}

export function nextMinimumBidCents(
  currentBidCents: number | null,
  openingBidCents: number,
): number {
  if (currentBidCents == null || currentBidCents < openingBidCents) {
    return openingBidCents;
  }
  return currentBidCents + minimumIncrementCents(currentBidCents);
}

/** 20% of the bid, minimum €10, in whole euro cents. */
export function depositCents(bidAmountCents: number): number {
  const raw = Math.ceil((bidAmountCents * DEPOSIT_RATE_BPS) / 10_000);
  return Math.max(MIN_DEPOSIT_CENTS, roundUpToWholeEuroCents(raw));
}

export function remainderAfterDepositCents(bidAmountCents: number): number {
  return bidAmountCents - depositCents(bidAmountCents);
}

export type AntiSnipeConfig = {
  enabled: boolean;
  windowSeconds: number;
  extensionSeconds: number;
};

export function shouldExtendForAntiSnipe(
  bidAt: Date,
  endsAt: Date,
  config: AntiSnipeConfig,
): boolean {
  if (!config.enabled) return false;
  const remainingMs = endsAt.getTime() - bidAt.getTime();
  return remainingMs > 0 && remainingMs <= config.windowSeconds * 1000;
}

export function extendedEndTime(
  bidAt: Date,
  endsAt: Date,
  config: AntiSnipeConfig,
): Date {
  if (!shouldExtendForAntiSnipe(bidAt, endsAt, config)) {
    return endsAt;
  }
  return new Date(bidAt.getTime() + config.extensionSeconds * 1000);
}

export function isBidStale(
  offeredCents: number,
  currentLeadingCents: number | null,
  openingBidCents: number,
): boolean {
  return offeredCents < nextMinimumBidCents(currentLeadingCents, openingBidCents);
}

export function assertValidBidAmount(
  offeredCents: number,
  currentLeadingCents: number | null,
  openingBidCents: number,
): void {
  if (!Number.isInteger(offeredCents) || offeredCents <= 0) {
    throw new BidValidationError("Bid amounts must be whole euro cents.");
  }
  if (isBidStale(offeredCents, currentLeadingCents, openingBidCents)) {
    throw new BidValidationError(
      "This bid is no longer high enough. Refresh the current price and try again.",
      "stale",
    );
  }
}

export class BidValidationError extends Error {
  constructor(
    message: string,
    public readonly code: "stale" | "invalid" = "invalid",
  ) {
    super(message);
    this.name = "BidValidationError";
  }
}

export function inventoryMinimumCents(
  placements: Array<{ minBidCents: number }>,
): number {
  return placements.reduce((sum, p) => sum + p.minBidCents, 0);
}
