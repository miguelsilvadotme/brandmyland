-- Brand My Land schema. Apply with the Supabase SQL editor or CLI.

create type placement_type as enum ('banner', 'flag');
create type placement_tier as enum ('central', 'large', 'medium', 'small', 'landmark', 'perimeter');
create type bid_status as enum (
  'pending_payment', 'pending_reservation', 'valid', 'leading', 'outbid',
  'rejected', 'refunded', 'won', 'expired', 'failed'
);
create type payment_status as enum ('requires_payment', 'processing', 'succeeded', 'failed', 'canceled');
create type refund_status as enum ('queued', 'processing', 'succeeded', 'failed');
create type moderation_status as enum ('pending', 'approved', 'rejected');
create type auction_mode as enum ('preview', 'reservations', 'live', 'closed');
create type winner_balance_status as enum ('not_applicable', 'pending', 'requested', 'paid');

create table if not exists auction_settings (
  id uuid primary key default gen_random_uuid(),
  mode auction_mode not null default 'preview',
  start_at timestamptz not null,
  end_at timestamptz not null,
  anti_snipe_enabled boolean not null default true,
  anti_snipe_window_seconds integer not null default 300,
  anti_snipe_extension_seconds integer not null default 300,
  land_image_path text not null default '/images/land-aerial.jpg',
  copy jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists placements (
  id text primary key,
  type placement_type not null,
  tier placement_tier not null,
  name text not null,
  size_label text not null,
  width_m numeric not null,
  height_m numeric not null,
  min_bid_cents integer not null check (min_bid_cents > 0),
  location_note text not null,
  geometry jsonb not null,
  ends_at timestamptz not null
);

create table if not exists bidders (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  company_name text not null,
  company_website text not null,
  twitter_handle text,
  hide_public_name boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists brands (
  id uuid primary key default gen_random_uuid(),
  bidder_id uuid not null references bidders(id),
  display_name text not null,
  website text,
  logo_url text,
  public_message text,
  moderation_status moderation_status not null default 'pending',
  is_demo boolean not null default false
);

create table if not exists bids (
  id uuid primary key default gen_random_uuid(),
  placement_id text not null references placements(id),
  bidder_id uuid not null references bidders(id),
  brand_id uuid not null references brands(id),
  amount_cents integer not null check (amount_cents > 0),
  deposit_cents integer not null check (deposit_cents > 0),
  status bid_status not null,
  created_at timestamptz not null default now(),
  public_message text,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  idempotency_key text unique not null,
  winner_balance_status winner_balance_status not null default 'not_applicable',
  invoice_url text
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  bid_id uuid not null references bids(id),
  amount_cents integer not null,
  currency text not null default 'eur',
  status payment_status not null,
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  created_at timestamptz not null default now()
);

create table if not exists refunds (
  id uuid primary key default gen_random_uuid(),
  bid_id uuid not null references bids(id),
  payment_id uuid not null references payments(id),
  amount_cents integer not null,
  status refund_status not null,
  stripe_refund_id text,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists moderation_events (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id),
  actor text not null,
  from_status moderation_status,
  to_status moderation_status not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  actor text not null,
  action text not null,
  detail text
);

create index if not exists bids_placement_status_idx on bids (placement_id, status, amount_cents desc);
create index if not exists bids_created_idx on bids (created_at desc);
create unique index if not exists payments_intent_idx on payments (stripe_payment_intent_id) where stripe_payment_intent_id is not null;
create unique index if not exists payments_session_idx on payments (stripe_checkout_session_id) where stripe_checkout_session_id is not null;
create index if not exists refunds_status_idx on refunds (status);

-- Leading bid is the highest valid/leading/won row per placement.
create or replace view placement_leaders as
select distinct on (placement_id)
  placement_id, id as bid_id, amount_cents, status
from bids
where status in ('leading', 'valid', 'won')
order by placement_id, amount_cents desc, created_at asc;
