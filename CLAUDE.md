# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

EBookstore — a full-stack Next.js eBook storefront. Public catalog of eBooks (fitness,
development, cooking, etc.), individual eBook pages with Stripe Checkout, and a
password-protected admin panel for managing the catalog.

## Stack

- **Framework**: Next.js 16 (App Router), TypeScript, React 19
- **Styling**: Tailwind CSS v4 (config lives in `src/app/globals.css` via `@theme`, not a
  `tailwind.config.js`)
- **Database**: SQLite via Prisma (`prisma/schema.prisma`, file at `prisma/dev.db`)
- **Auth**: NextAuth (Credentials provider) for the admin panel only — no customer accounts
- **Payments**: Stripe Checkout (test mode by default)

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
- `NEXTAUTH_SECRET` / `NEXTAUTH_URL` — required for admin login sessions
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — used only by `prisma/seed.ts` to create the admin account
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` — Stripe **test mode** keys from
  https://dashboard.stripe.com/test/apikeys. Until real keys are set, the checkout API
  returns a clear 503 error instead of crashing.
- `NEXT_PUBLIC_BASE_URL` — used to build Stripe success/cancel redirect URLs

## Architecture

- `src/app/page.tsx` — home page (hero + dynamic catalog grid + testimonials), a server
  component that reads eBooks directly from Prisma.
- `src/app/ebooks/[slug]/page.tsx` — eBook detail page with the buy form.
- `src/app/api/checkout/route.ts` — creates a `pending` Order row, then a Stripe Checkout
  Session; redirects the client to Stripe.
- `src/app/api/webhook/stripe/route.ts` — Stripe webhook that flips an Order to `paid` on
  `checkout.session.completed`.
- `src/app/admin/**` — admin dashboard (list/create/edit/delete eBooks) and `admin/login`.
  Protected by `src/proxy.ts` (Next.js 16 renamed `middleware.ts` to `proxy.ts`; it must live
  under `src/` because the app lives under `src/app`), which redirects unauthenticated
  requests to `/admin/login`. Admin mutations go through Server Actions in `src/lib/actions.ts`,
  each of which independently re-checks the session server-side (defense in depth beyond the
  proxy).
- `prisma/schema.prisma` — `EBook`, `Order`, `Admin` models.
- `prisma/seed.ts` — sample catalog + admin account bootstrap.

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
