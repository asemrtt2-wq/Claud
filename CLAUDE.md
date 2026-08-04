# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

EBookstore — a full-stack Next.js eBook platform. Public catalog of eBooks, individual eBook
pages with one-time Stripe Checkout purchases, a recurring Stripe Premium subscription
(monthly/yearly, unlocks the whole library), customer accounts (signup/login, favorites,
reading progress), a simple in-browser reader, and a separate password-protected admin panel
for managing the catalog.

## Stack

- **Framework**: Next.js 16 (App Router), TypeScript, React 19
- **Styling**: Tailwind CSS v4 (config lives in `src/app/globals.css` via `@theme`, not a
  `tailwind.config.js`)
- **Database**: SQLite via Prisma (`prisma/schema.prisma`, file at `prisma/dev.db`)
- **Auth**: NextAuth (two Credentials providers — `admin-credentials` and
  `customer-credentials` — sharing one JWT session, distinguished by `token.role`)
- **Payments**: Stripe Checkout, both one-time (`mode: "payment"`) and subscription
  (`mode: "subscription"`), test mode by default

## Commands

```bash
npm install          # install deps (also runs `prisma generate` via postinstall)
npm run dev           # start dev server on :3000
npm run build          # production build (also type-checks)
npm run start          # run the production build
npm run db:migrate       # create/apply a Prisma migration (prisma migrate dev)
npm run db:seed         # seed sample eBooks + the admin account from .env
npm run db:studio        # open Prisma Studio to browse/edit data
```

There is no test suite yet.

## Environment variables

Copy `.env.example` to `.env` before running anything. Required keys:

- `DATABASE_URL` — SQLite file path (`file:./dev.db` by default)
- `NEXTAUTH_SECRET` / `NEXTAUTH_URL` — required for admin and customer login sessions
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — used only by `prisma/seed.ts` to create the admin account
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` — Stripe **test mode** keys from
  https://dashboard.stripe.com/test/apikeys. Until real keys are set, the checkout and
  subscribe APIs return a clear 503 error instead of crashing.
- `NEXT_PUBLIC_BASE_URL` — used to build Stripe success/cancel redirect URLs

## Architecture

### Public storefront
- `src/app/page.tsx` — home page (hero + dynamic catalog grid + testimonials), a server
  component that reads eBooks directly from Prisma.
- `src/app/ebooks/[slug]/page.tsx` — eBook detail page. Shows a "Lire maintenant" link to
  `/read/[slug]` if the current customer has access (owns it or has an active subscription),
  otherwise a buy button + a link to `/premium`. Includes a favorite toggle.
- `src/app/premium/page.tsx` — pricing page (free / one-time purchase / Premium monthly-yearly).

### Customer accounts
- `src/lib/auth.ts` — NextAuth config with `admin-credentials` and `customer-credentials`
  providers; `token.role` / `session.user.role` distinguish which one signed in (see
  `src/types/next-auth.d.ts` for the module augmentation).
- `src/app/signup/page.tsx` + `src/app/api/auth/signup/route.ts` — customer signup (creates a
  `Customer` row, then signs in). `src/app/login/page.tsx` — customer login. Both pages are
  server components that render a client form component (`SignupForm`/`LoginForm`) — **never**
  import the async `Header`/`Footer` server components directly into a `"use client"` file,
  Next.js can't render a Server Component inside a Client Component that way.
- `src/lib/customerSession.ts` — `getCurrentCustomer()` helper (server-only) used across pages.
- `src/app/account/page.tsx` — subscription status, "continue reading", favorites.
- `src/lib/access.ts` — `hasAccessToEbook()`: true if the customer has an active `Subscription`
  or a `paid` `Order` for that eBook.

### Reader
- `src/lib/paginate.ts` — splits an eBook's plain-text `content` into pages (~900 chars,
  paragraph-aware).
- `src/app/read/[slug]/page.tsx` — server component that checks access (redirects to `/login`
  or the eBook page otherwise), then renders the client `Reader` component (dark/light, font
  size, prev/next, progress bar). Reading position is saved via the `saveReadingProgress`
  server action in `src/lib/customerActions.ts`.

### Payments
- `src/app/api/checkout/route.ts` — one-time purchase; requires a logged-in customer, creates
  a `pending` Order linked to that customer, then a Stripe Checkout Session (`mode: "payment"`).
- `src/app/api/subscribe/route.ts` — Premium subscription; requires a logged-in customer,
  upserts a `Subscription` row (`status: "incomplete"`), then a Stripe Checkout Session
  (`mode: "subscription"`) with inline `price_data.recurring` (no pre-created Stripe Price
  needed).
- `src/app/api/webhook/stripe/route.ts` — on `checkout.session.completed`, marks the Order
  `paid` (payment mode) or the Subscription `active` (subscription mode, using
  `session.metadata.customerId`); on `customer.subscription.updated/deleted`, syncs status.

### Admin
- `src/app/admin/**` — admin dashboard (list/create/edit/delete eBooks) and `admin/login`.
  Protected by `src/proxy.ts` (Next.js 16 renamed `middleware.ts` to `proxy.ts`; it must live
  under `src/` because the app lives under `src/app`), which redirects to `/admin/login`
  unless `token.role === "admin"` — a logged-in customer is not enough. Admin mutations go
  through Server Actions in `src/lib/actions.ts`, each of which independently re-checks the
  session server-side (defense in depth beyond the proxy).

### Data model (`prisma/schema.prisma`)
`EBook` (has a `content` text field used by the reader), `Order` (one-time purchases, optional
`customerId`), `Admin`, `Customer`, `Subscription` (one-to-one with `Customer`), `Favorite`
and `ReadingProgress` (join tables, unique on `[customerId, ebookId]`).

- `prisma/seed.ts` — sample catalog (with placeholder chapter content for the reader) + admin
  account bootstrap. Does not seed a demo customer — use `/signup` locally.

## Conventions

- Tailwind v4: custom brand tokens (colors, shadows, radius) are declared once in
  `src/app/globals.css` under `@theme`, then used as normal utility classes (e.g. `bg-navy`,
  `shadow-soft`). Don't add a `tailwind.config.js` — v4 doesn't need one here.
- Cover art has no real images; each eBook has a `coverEmoji` + `coverTheme` (one of `royal`,
  `navy`, `deep`, `dark`, `steel` — CSS gradients defined in `globals.css` as
  `.cover-theme-*`). Keep new themes within the navy/royal-blue brand palette.
- `next.config.mjs` sets `experimental.useTypeScriptCli: true` — required because the
  installed TypeScript version doesn't expose the compiler API Next's default type-checker
  expects. Don't remove it unless the TypeScript/Next versions change.
- `Header` is an async Server Component (it reads the customer session). It can only be
  rendered from Server Components — see the note under Customer accounts above.
