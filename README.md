# Brand My Land

Next.js App Router auction for 85 physical banners and flags on 1,300 m² of land in São Vicente, Madeira.

## Local setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Without Stripe or Supabase credentials the site runs in **preview** with a labelled demo dataset. Submissions are disabled until `NEXT_PUBLIC_AUCTION_MODE` is `reservations` or `live`.

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Environment

See `.env.example`. Important switches:

| Variable | Effect |
| --- | --- |
| `NEXT_PUBLIC_AUCTION_MODE` | `preview` · `reservations` · `live` · `closed` |
| `STRIPE_SECRET_KEY` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Required for live checkout. If missing, live mode safely falls back to reservations. |
| `STRIPE_WEBHOOK_SECRET` | Required to confirm bids. A bid is valid only after the webhook. |
| `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | Production database. Without them, a typed local store is used (`.data/store.json`). |
| `ADMIN_PASSWORD` | Placeholder admin gate at `/admin` |

## Stripe webhooks (test mode)

1. `stripe listen --forward-to localhost:3000/api/stripe/webhook`
2. Copy the webhook secret into `STRIPE_WEBHOOK_SECRET`
3. Set mode to `live` and use Stripe test cards
4. Never treat a client redirect as payment success

Checkout charges a **20% deposit (minimum €10)**. Outbid deposits are refunded to the original method after Stripe confirms the refund.

## Supabase

Run `supabase/migrations/001_init.sql` in the SQL editor, then seed placements from `src/lib/auction/inventory.ts`. The app currently uses the local adapter unless you wire the service role into a production store; the schema is ready for that cutover.

## Assets you should replace

- `/public/images/land-aerial.jpg` — overhead drone photograph (SVG placeholder ships until then)
- `/public/images/founder.jpg` — founder portrait
- Legal entity, VAT, address, contact, policy version
- Social URLs

## Notes

- All money is integer euro cents on the server.
- Physical installation is subject to approval; copy never treats approval as a formality.
- Terms, privacy and refund pages are drafts until legal review.
