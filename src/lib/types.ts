export const PLACEMENT_TYPES = ["banner", "flag"] as const;
export type PlacementType = (typeof PLACEMENT_TYPES)[number];

export const BANNER_TIERS = ["central", "large", "medium", "small"] as const;
export const FLAG_TIERS = ["landmark", "perimeter"] as const;
export type BannerTier = (typeof BANNER_TIERS)[number];
export type FlagTier = (typeof FLAG_TIERS)[number];
export type PlacementTier = BannerTier | FlagTier;

export const AUCTION_MODES = [
  "preview",
  "reservations",
  "live",
  "closed",
] as const;
export type AuctionMode = (typeof AUCTION_MODES)[number];

export const BID_STATUSES = [
  "pending_payment",
  "pending_reservation",
  "valid",
  "leading",
  "outbid",
  "rejected",
  "refunded",
  "won",
  "expired",
  "failed",
] as const;
export type BidStatus = (typeof BID_STATUSES)[number];

export const PAYMENT_STATUSES = [
  "requires_payment",
  "processing",
  "succeeded",
  "failed",
  "canceled",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const REFUND_STATUSES = [
  "queued",
  "processing",
  "succeeded",
  "failed",
] as const;
export type RefundStatus = (typeof REFUND_STATUSES)[number];

export const MODERATION_STATUSES = [
  "pending",
  "approved",
  "rejected",
] as const;
export type ModerationStatus = (typeof MODERATION_STATUSES)[number];

export const WINNER_BALANCE_STATUSES = [
  "not_applicable",
  "pending",
  "requested",
  "paid",
] as const;
export type WinnerBalanceStatus = (typeof WINNER_BALANCE_STATUSES)[number];

export type Point = { x: number; y: number };

export type PlacementGeometry =
  | { kind: "rect"; points: [Point, Point, Point, Point] }
  | { kind: "pin"; point: Point };

export type PlacementDefinition = {
  id: string;
  type: PlacementType;
  tier: PlacementTier;
  name: string;
  sizeLabel: string;
  widthM: number;
  heightM: number;
  minBidCents: number;
  locationNote: string;
  geometry: PlacementGeometry;
};

export type PublicBrand = {
  id: string;
  displayName: string;
  website: string | null;
  logoUrl: string | null;
  publicMessage: string | null;
  moderationStatus: ModerationStatus;
  isDemo: boolean;
};

export type PublicBid = {
  id: string;
  placementId: string;
  amountCents: number;
  status: BidStatus;
  createdAt: string;
  publicBidderName: string;
  brand: PublicBrand | null;
};

export type PublicPlacement = PlacementDefinition & {
  currentBidCents: number | null;
  bidCount: number;
  leadingBrand: PublicBrand | null;
  endsAt: string;
  status: "available" | "has_bids" | "closed" | "won";
};

export type AuctionSettings = {
  mode: AuctionMode;
  statusLabel: string;
  startAt: string;
  endAt: string;
  antiSnipeEnabled: boolean;
  antiSnipeWindowSeconds: number;
  antiSnipeExtensionSeconds: number;
  landImagePath: string;
  siteName: string;
  heroEyebrow: string;
  heroHeadline: string;
  heroBody: string;
  storyHeading: string;
  storyBody: string;
  founderName: string;
  founderBio: string;
  founderPortraitPath: string;
  founderXUrl: string;
  founderYoutubeUrl: string;
  founderEmail: string;
  legalEntityName: string;
  businessAddress: string;
  contactEmail: string;
  vatNumber: string;
  policyVersion: string;
  demoDataLabel: string;
};

export type Milestone = {
  id: string;
  amountCents: number;
  label: string;
  description: string;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type ActivityItem = {
  id: string;
  createdAt: string;
  placementId: string;
  message: string;
};

export type BidFormInput = {
  placementId: string;
  amountCents: number;
  fullName: string;
  workEmail: string;
  companyName: string;
  companyWebsite: string;
  twitterHandle?: string;
  publicMessage?: string;
  hidePublicName?: boolean;
  acceptTerms: boolean;
  acceptRegulatory: boolean;
};

export type AdminSummary = {
  leadingBidTotalCents: number;
  depositHeldCents: number;
  pendingRefundCents: number;
  validBidCount: number;
  placementsWithBids: number;
  placementCount: number;
};
