/** All money is integer euro cents. Never use floating-point euros in business logic. */

export const EUR_CENTS = 100;

export function eurosToCents(euros: number): number {
  if (!Number.isFinite(euros)) {
    throw new Error("Invalid euro amount");
  }
  return Math.round(euros * EUR_CENTS);
}

export function centsToEuros(cents: number): number {
  return cents / EUR_CENTS;
}

export function formatEuroFromCents(
  cents: number,
  options: { compact?: boolean } = {},
): string {
  const euros = centsToEuros(cents);
  if (options.compact && Math.abs(euros) >= 1_000_000) {
    return `€${(euros / 1_000_000).toLocaleString("en-IE", {
      maximumFractionDigits: 1,
    })}M`;
  }
  if (options.compact && Math.abs(euros) >= 10_000) {
    return `€${Math.round(euros / 1000)}k`;
  }
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(euros);
}

export function parseEuroInputToCents(raw: string): number | null {
  const cleaned = raw.replace(/[€\s]/g, "").replace(",", ".");
  if (!cleaned) return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * EUR_CENTS);
}

export function roundUpToWholeEuroCents(cents: number): number {
  return Math.ceil(cents / EUR_CENTS) * EUR_CENTS;
}
