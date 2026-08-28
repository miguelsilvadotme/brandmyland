export const ANALYTICS_EVENTS = [
  "map_viewed",
  "placement_selected",
  "bid_started",
  "checkout_started",
  "bid_confirmed",
  "bid_outbid",
  "reservation_submitted",
  "faq_opened",
  "share_clicked",
] as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];

const PERSONAL_KEYS = /email|phone|card|stripe|payment|name|address/i;

export function trackClientEvent(
  event: AnalyticsEvent,
  props?: Record<string, string | number | boolean>,
) {
  if (typeof window === "undefined") return;
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== "true") return;
  if (document.cookie.includes("bml_consent=necessary")) return;
  const consent = document.cookie.includes("bml_consent=all");
  if (!consent && needsConsent()) return;
  const safe = Object.fromEntries(
    Object.entries(props ?? {}).filter(([key]) => !PERSONAL_KEYS.test(key)),
  );
  window.dispatchEvent(new CustomEvent("bml-analytics", { detail: { event, props: safe } }));
  if ("gtag" in window && typeof (window as { gtag?: (...a: unknown[]) => void }).gtag === "function") {
    (window as { gtag: (...a: unknown[]) => void }).gtag("event", event, safe);
  }
}

function needsConsent() {
  return process.env.NEXT_PUBLIC_REQUIRE_ANALYTICS_CONSENT !== "false";
}

export function serverLog(event: string, extra?: Record<string, unknown>) {
  console.info(JSON.stringify({ source: "bml", event, extra, ts: new Date().toISOString() }));
}
