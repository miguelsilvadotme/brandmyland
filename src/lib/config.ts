import {
  AUCTION_MODES,
  type AuctionMode,
  type AuctionSettings,
  type FaqItem,
  type Milestone,
} from "@/lib/types";

function env(name: string, fallback = ""): string {
  return process.env[name]?.trim() || fallback;
}

function parseMode(raw: string | undefined): AuctionMode {
  if (raw && (AUCTION_MODES as readonly string[]).includes(raw)) {
    return raw as AuctionMode;
  }
  return "preview";
}

export function resolveAuctionMode(): AuctionMode {
  const requested = parseMode(process.env.NEXT_PUBLIC_AUCTION_MODE);
  const hasStripe =
    Boolean(process.env.STRIPE_SECRET_KEY) &&
    Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  if (requested === "live" && !hasStripe) {
    return "reservations";
  }
  return requested;
}

export function siteUrl(): string {
  return env("NEXT_PUBLIC_SITE_URL", "http://localhost:3000").replace(/\/$/, "");
}

export function defaultAuctionWindow(): { startAt: string; endAt: string } {
  const start =
    env("AUCTION_START_AT") ||
    new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
  const end =
    env("AUCTION_END_AT") ||
    new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString();
  return { startAt: start, endAt: end };
}

export function buildDefaultSettings(): AuctionSettings {
  const { startAt, endAt } = defaultAuctionWindow();
  const mode = resolveAuctionMode();
  const statusLabel =
    mode === "live"
      ? "Auction live"
      : mode === "reservations"
        ? "Reservations open"
        : mode === "closed"
          ? "Auction closed"
          : "Preview";
  return {
    mode,
    statusLabel,
    startAt,
    endAt,
    antiSnipeEnabled: env("ANTI_SNIPE_ENABLED", "true") !== "false",
    antiSnipeWindowSeconds: Number(env("ANTI_SNIPE_WINDOW_SECONDS", "300")),
    antiSnipeExtensionSeconds: Number(
      env("ANTI_SNIPE_EXTENSION_SECONDS", "300"),
    ),
    landImagePath: "/images/land-aerial.jpg",
    siteName: "Brand My Land",
    heroEyebrow: "São Vicente, Madeira · 1,300 m²",
    heroHeadline: "Your brand. On my land.",
    heroBody:
      "Bid on a real banner or flag on my field. If you win, your brand stays on the land for a year — and on this website after that.",
    storyHeading:
      "The internet has advertised on laptops, phones and cars. So I gave it 1,300 m² of Madeira.",
    storyBody:
      "This started with one ridiculous question: if a laptop lid can become advertising inventory, why can’t an entire field? The result is Brand My Land—a live auction where the map is the marketplace and the winning brands become part of one enormous physical composition.",
    founderName: "Miguel",
    founderBio:
      "I’m a product designer and creator from Madeira. I like building ideas that are just plausible enough to become real and ridiculous enough for the internet to care. Brand My Land is the biggest one yet.",
    founderPortraitPath: "/images/founder-placeholder.svg",
    founderXUrl: env("FOUNDER_X_URL", "https://x.com"),
    founderYoutubeUrl: env("FOUNDER_YOUTUBE_URL", "https://youtube.com"),
    founderEmail: env("FOUNDER_EMAIL", env("CONTACT_EMAIL", "hello@brandmyland.com")),
    legalEntityName: env("LEGAL_ENTITY_NAME", "[Legal entity name — draft]"),
    businessAddress: env(
      "BUSINESS_ADDRESS",
      "São Vicente, Madeira, Portugal",
    ),
    contactEmail: env("CONTACT_EMAIL", "hello@brandmyland.com"),
    vatNumber: env("VAT_NUMBER", "[VAT number — draft]"),
    policyVersion: env("POLICY_VERSION", "0.1-draft"),
    demoDataLabel: "Sample / demo activity",
  };
}

export const LAND_LATITUDE = Number(env("NEXT_PUBLIC_LAND_LAT", "32.781712"));
export const LAND_LONGITUDE = Number(env("NEXT_PUBLIC_LAND_LNG", "-17.044360"));

export function landCoordinateLabel() {
  return `${LAND_LATITUDE.toFixed(6)}, ${LAND_LONGITUDE.toFixed(6)}`;
}

export function googleEarthUrl() {
  return `https://earth.google.com/web/@${LAND_LATITUDE},${LAND_LONGITUDE},480a,900d,35y,0h,55t,0r`;
}

export function googleMapsSatelliteUrl() {
  return `https://www.google.com/maps/@${LAND_LATITUDE},${LAND_LONGITUDE},18z/data=!3m1!1e3`;
}

export function googleMapsEmbedUrl() {
  const q = encodeURIComponent(`${LAND_LATITUDE},${LAND_LONGITUDE}`);
  return `https://maps.google.com/maps?q=${q}&z=18&t=k&output=embed`;
}

export const DEFAULT_MILESTONES: Milestone[] = [
  {
    id: "min-inventory",
    amountCents: 10_030_000,
    label: "€100k — minimum inventory value",
    description:
      "The combined opening bids of all 85 placements — the floor to cover prints, crew and municipality licences. Reaching it means the map is fully priced, not that the project is approved.",
  },
  {
    id: "viability",
    amountCents: 25_000_000,
    label: "€250k — project viability target",
    description:
      "A working target for production, filming and a year of land stewardship. Not a profit figure and not a regulatory guarantee.",
  },
  {
    id: "expanded",
    amountCents: 50_000_000,
    label: "€500k — expanded launch production",
    description:
      "Room for a more ambitious install, additional filming days and a thicker archive. Still subject to approvals and safety.",
  },
  {
    id: "impossible",
    amountCents: 100_000_000,
    label: "€1M — the impossible internet goal",
    description:
      "The number that would make this an internet-scale composition. Reaching it would not waive engineering, weather or municipal requirements.",
  },
];

export const DEFAULT_FAQS: FaqItem[] = [
  {
    id: "is-this-real",
    question: "Is this real?",
    answer:
      "Yes. This is my land in São Vicente, Madeira — the photos and the Google Earth pin are the real plot. The auction is real. I launched this page simply so the project could exist; I’ll add drone footage and polish if it gets traction. Physical banners and flags still need regulatory, engineering and safety approval before anything is installed.",
  },
  {
    id: "approval",
    question: "Has the physical installation been approved?",
    answer:
      "The physical installation is subject to approval by the Câmara Municipal de São Vicente and any other competent authorities. The final layout, number of placements, dimensions, materials and installation period may be adjusted to comply with their requirements.",
  },
  {
    id: "if-not-approved",
    question: "What happens if the project is not approved?",
    answer:
      "If the required approvals cannot be obtained, or official requirements make a placement materially different from what was offered, affected bidders receive a full refund to their original payment method. No project administration fee is deducted, although the payment provider controls how long a refund takes to appear.",
  },
  {
    id: "layout-change",
    question: "Can the layout or my position change?",
    answer:
      "Minor adjustments to placement, orientation, dimensions, materials or installation method may be necessary for engineering, safety or regulatory reasons. If a change materially reduces the value or visibility of a winning placement, the winner can accept the revised placement or receive a full refund.",
  },
  {
    id: "bidding",
    question: "How does bidding work?",
    answer:
      "Each position has its own auction and minimum opening bid. A new bid must exceed the current bid by the displayed minimum increment. The highest valid bid when that position closes wins, subject to brand review and the auction terms. If a valid bid arrives in the final five minutes, that placement’s clock extends by five minutes to reduce sniping.",
  },
  {
    id: "deposit",
    question: "How does the deposit work?",
    answer:
      "Placing a live bid charges a 20% deposit, with a €10 minimum. If you are outbid, rejected during moderation or the placement cannot proceed, the deposit is refunded in full automatically. If you win, the deposit is credited toward the final price and you receive a secure request for the remainder. Bank and card settlement timing is controlled by the payment provider.",
  },
  {
    id: "outbid",
    question: "What happens if someone outbids me?",
    answer:
      "We notify you and initiate a full refund of your deposit. You can return and bid again while the placement remains open.",
  },
  {
    id: "duration",
    question: "How long will my brand stay on the land?",
    answer:
      "The intended physical campaign period is one year after installation. Exact dates depend on approvals, production, weather and safety conditions. The winning placement remains archived on the website after the physical campaign ends.",
  },
  {
    id: "who-can-participate",
    question: "Can any company participate?",
    answer:
      "Almost, but every sponsor and artwork submission is reviewed. The project may reject illegal, deceptive, hateful, explicit, politically sensitive, environmentally harmful or otherwise inappropriate advertising. Rejected bids are refunded.",
  },
  {
    id: "what-am-i-buying",
    question: "What exactly am I buying?",
    answer:
      "You are bidding for an experimental sponsorship package tied to a specific physical and digital position. You are not buying the land, acquiring an interest in the property or receiving guaranteed impressions, clicks, media coverage or financial return.",
  },
  {
    id: "production",
    question: "Who produces the banner or flag?",
    answer:
      "Brand My Land coordinates production using artwork supplied by the winning sponsor. Final specifications, safe areas, colours and deadlines are provided after settlement. Artwork that cannot be produced safely or legally must be revised.",
  },
  {
    id: "currency",
    question: "What currency is used?",
    answer:
      "All bids and payments are settled in euros.",
  },
  {
    id: "anonymous",
    question: "Can I bid anonymously?",
    answer:
      "The public display name can be hidden during the auction, but verified contact and billing information are required privately to place a bid.",
  },
];

export const REGULATORY_ACKNOWLEDGEMENT =
  "I understand that the physical installation is subject to regulatory and safety approval and may require reasonable changes. If this placement cannot proceed as described, my deposit will be refunded in full.";

export const APPROVAL_NOTICE =
  "Physical installation is subject to approval by the relevant authorities. Deposits are fully refunded if a placement cannot proceed.";
