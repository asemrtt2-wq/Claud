# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Lumina (formerly "EBookstore") — a full-stack Next.js eBook platform. Public catalog of
eBooks, individual eBook pages with one-time Stripe Checkout purchases, a recurring Stripe
Premium subscription (monthly/yearly, unlocks the whole library), customer accounts
(signup/login, favorites, reading progress), a dark "app shell" account dashboard and
in-browser reader modeled on the Lumina product design (dark navy/purple glassmorphism), a
parental-controls layer (child profiles, daily reading-time limits, a kids-only reader with
read-aloud and a parent monitoring dashboard), and a separate password-protected admin panel
for managing the catalog.

The customer-facing brand is "Lumina" (logo: `✦`, purple `#7c5cff` → `#5b3df0` gradient). Every
customer-facing page — marketing pages, `/premium`, `/ebooks/[slug]`, `/login`, `/signup`,
`/account`, `/kids/**` — uses the same dark glassmorphic "app" look (`lumina-shell`/`lumina-card`
utility classes in `globals.css`), so the whole site (not just the logged-in area) now reads as
one dark product. The one deliberate exception is the reader (`/read/[slug]`,
`/kids/[id]/read/[slug]`): it uses each eBook's own `cover-theme-*` gradient as an immersive
background instead of the generic dark shell. The admin panel keeps the original navy/royal-blue
palette — it's an internal tool, not part of the Lumina brand surface.

### Parental controls — what's real vs. simulated

This is a web app, so a few things from the original feature request are approximated rather
than literally implemented, and future work should keep respecting these boundaries:
- **Reading-time limits are in-app, not OS-level.** A website cannot lock a phone's screen.
  `ChildProfile.dailyLimitMinutes` gates the *Lumina reader itself* (see Kids mode below) —
  it does not touch device screen time.
- **Read-aloud voice "characters" (Femme/Homme/Robot/Alien/Loup/Ours) are the browser's
  built-in `SpeechSynthesis` voice with pitch/rate presets per character**, not distinct
  synthesized voice models — output quality depends on the voices the browser/OS ships.
- **The reading mascot is a CSS-animated emoji** (`.mascot-bounce`/`.mascot-idle` in
  `globals.css`), not AI-generated animation.
- **Reminders are in-app banners**, shown when the current page loads within a time window of
  the configured reminder time — not real push notifications (that would need service-worker +
  backend cron infrastructure this app doesn't have).

## Stack

- **Framework**: Next.js 16 (App Router), TypeScript, React 19
- **Styling**: Tailwind CSS v4 (config lives in `src/app/globals.css` via `@theme`, not a
  `tailwind.config.js`)
- **Database**: PostgreSQL via Prisma (`prisma/schema.prisma`). Any Postgres works locally or in
  production (Vercel Postgres, Neon, Supabase, a local `postgresql-16` instance, etc.) — just
  point `DATABASE_URL` at it. (Earlier versions of this project used SQLite; it was dropped
  because Vercel's serverless functions can't write to a local file, which broke every
  write — signup, checkout, favorites — the moment the app left a persistent dev machine.)
- **Auth**: NextAuth (two Credentials providers — `admin-credentials` and
  `customer-credentials` — sharing one JWT session, distinguished by `token.role`)
- **Payments**: Stripe Checkout, both one-time (`mode: "payment"`) and subscription
  (`mode: "subscription"`), test mode by default

## Commands

```bash
npm install          # install deps (also runs `prisma generate` via postinstall)
npm run dev           # start dev server on :3000
npm run build          # runs `prisma migrate deploy` then production build (also type-checks)
npm run start          # run the production build
npm run db:migrate       # create/apply a Prisma migration (prisma migrate dev) — needs a reachable Postgres
npm run db:seed         # seed sample eBooks + the admin account from .env
npm run db:studio        # open Prisma Studio to browse/edit data
```

There is no test suite yet.

`build` running `prisma migrate deploy` first means every deploy (Vercel or otherwise)
auto-applies pending migrations against whatever `DATABASE_URL` is configured for that
environment — convenient for a project this size, but worth knowing if you ever add a
production environment where you'd rather migrate by hand.

## Environment variables

Copy `.env.example` to `.env` before running anything. Required keys:

- `DATABASE_URL` — PostgreSQL connection string (e.g. from Vercel Postgres or Neon's free
  tier, or a local `postgresql://postgres:postgres@localhost:5432/lumina_dev`)
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
- `src/app/account/page.tsx` — the Lumina app dashboard (dark `lumina-shell`): a "continue
  reading" hero card (last book read, progress bar, resume link), a unified "library" grid
  deduplicating eBooks the customer purchased/favorited/has progress on, a favorites grid, and
  a profile section (subscription status, sign out). Renders `AppBottomNav` below the fold for
  mobile in-app navigation (anchors into the same page plus a link back to the catalogue).
- `src/lib/access.ts` — `hasAccessToEbook()`: true if the customer has an active `Subscription`
  or a `paid` `Order` for that eBook.

### Reader
- `src/lib/paginate.ts` — splits an eBook's plain-text `content` into pages (~900 chars,
  paragraph-aware).
- `src/app/read/[slug]/page.tsx` — server component that checks access (redirects to `/login`
  or the eBook page otherwise), then renders the client `Reader` component, passing the
  eBook's `coverTheme` for the immersive background.
- `src/components/Reader.tsx` — "immersive" (default) vs "clair" (light) toggle, plus a
  "pages" (click-through, default) vs "scroll" (continuous, all pages concatenated) mode toggle.
  Immersive mode uses the eBook's `cover-theme-*` gradient as a full-page background with a dark
  overlay and a glassmorphic content card; light mode is a plain white reader. Font size (A-/A+),
  prev/next, and a purple progress bar work in both modes — border/background colors on the
  control buttons branch on the `immersive` boolean so they stay visible in light mode too.
  In scroll mode, progress is derived from scroll position (debounced) instead of button clicks.
  Reading position is saved via the `saveReadingProgress` server action in
  `src/lib/customerActions.ts`.

### Kids mode / parental controls
- `ChildProfile` (`prisma/schema.prisma`) belongs to a `Customer` (the parent) — there is no
  separate login for children; a "profile" is just a scoped view reachable only from the
  parent's own authenticated session (like Netflix profiles, not a second account). Every
  server action and page under `/kids/**` and `/account/kids/**` re-checks
  `childProfile.parentId === customer.id` before returning data — never trust the `id` route
  param alone.
- `EBook.audience` (`"adults"` default, or `"kids"`) splits the catalog: the homepage/`/ebooks`
  flow only ever queries `audience: "adults"`; `/kids/[id]` only ever queries `audience: "kids"`.
  Kids eBooks are free/bundled (no Order/Subscription needed) — access is just "this parent has
  a child profile," not a purchase.
- `src/lib/childActions.ts` (`"use server"`) — CRUD for `ChildProfile`, plus:
  - `saveChildReadingProgress` — upserts `ChildReadingProgress`, marks `completed` when the
    last page is reached, and maintains a running exponential-moving-average
    `avgSecondsPerPage` (used by the parent dashboard to flag "very fast"/"posé" reading pace).
  - `incrementReadingMinutes` — called every 60s from `KidsReader` while a story is open;
    resets `minutesReadToday` on a new calendar day (`limitResetDate`) and reports back whether
    the child just hit `dailyLimitMinutes`.
  - `getReadingStatus` — read-only version of the same limit check, used on page load so a
    child who already hit today's limit sees the lock screen immediately instead of after a
    minute of reading.
- `src/components/ChildProfileManager.tsx` / `ChildSettingsForm.tsx` — parent-facing UI on
  `/account` (create/delete profiles, set daily limit + bedtime reminder) and on the per-child
  dashboard.
- `src/app/account/kids/[id]/page.tsx` — parent dashboard for one child: books started/finished,
  total pages read, per-book progress + pace badge, last-active date.
- `src/app/kids/[id]/page.tsx` + `.../read/[slug]/page.tsx` + `src/components/KidsReader.tsx` —
  the kid-facing home/catalog and reader. `KidsReader` adds on top of the adult `Reader`
  pattern: a bouncing mascot emoji on page turn, a `SpeechSynthesis`-based read-aloud voice
  picker, and the daily-limit lock screen (see "what's real vs. simulated" above).
- `src/components/BedtimeReminder.tsx` — client component, reused on both `/account` (parent,
  keyed off `Customer.readingReminderTime`) and `/kids/[id]` (child, keyed off
  `ChildProfile.reminderTime`); shows a banner if `now` is within ~90 minutes after the
  configured time and there's no reading activity yet today.

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
`EBook` (has a `content` text field used by the reader, and an `audience` field —
`"adults"`/`"kids"`), `Order` (one-time purchases, optional `customerId`), `Admin`, `Customer`
(has an optional `readingReminderTime`), `Subscription` (one-to-one with `Customer`), `Favorite`
and `ReadingProgress` (join tables, unique on `[customerId, ebookId]`), `ChildProfile` (belongs
to a `Customer`; carries `dailyLimitMinutes`/`minutesReadToday`/`limitResetDate` and
`reminderTime`), and `ChildReadingProgress` (join table, unique on `[childProfileId, ebookId]`,
also tracks `completed` and `avgSecondsPerPage`).

- `prisma/seed.ts` — sample adult catalog (with placeholder chapter content for the reader) plus
  three short kids storybooks (`audience: "kids"`, free) + admin account bootstrap. Does not
  seed a demo customer — use `/signup` locally.

## Conventions

- Tailwind v4: custom brand tokens (colors, shadows, radius) are declared once in
  `src/app/globals.css` under `@theme`, then used as normal utility classes (e.g. `bg-navy`,
  `shadow-soft`). Don't add a `tailwind.config.js` — v4 doesn't need one here.
- Cover art has no real images; each eBook has a `coverEmoji` + `coverTheme` (one of `royal`,
  `navy`, `deep`, `dark`, `steel` for adult titles — CSS gradients defined in `globals.css` as
  `.cover-theme-*` — kept within the navy/royal-blue brand palette; `aurora`, `ember`, `forest`
  are additional darker/warmer gradients reserved for kids storybooks).
- Lumina purple accent (`#7c5cff` → `#5b3df0`/`#a78bfa`) is the primary interactive color across
  customer-facing CTAs (buy/subscribe/favorite buttons, links, focus rings) — it replaced the
  old `text-royal`/`from-royal` blue accent on those elements. The `royal`/navy tokens remain
  the base brand shell (header/footer background, body text, admin panel) and are still used
  for structural chrome, not just left over from before the rebrand.
- Lumina dark-app tokens live in `globals.css` under `@theme`: `--color-lumina-bg`,
  `--color-lumina-panel`, `--color-lumina-border`, `--color-lumina-purple`,
  `--color-lumina-purple-light`, `--color-lumina-text-muted`, plus utility classes
  `.lumina-shell` (dark radial-gradient page background), `.lumina-card` (glassmorphic panel),
  and `.lumina-progress-track`/`.lumina-progress-fill`. Use these for any new logged-in "app"
  screen instead of the light navy/white marketing-page styles.
- `next.config.mjs` sets `experimental.useTypeScriptCli: true` — required because the
  installed TypeScript version doesn't expose the compiler API Next's default type-checker
  expects. Don't remove it unless the TypeScript/Next versions change.
- `Header` is an async Server Component (it reads the customer session). It can only be
  rendered from Server Components — see the note under Customer accounts above.
- **JSX whitespace gotcha (SWC/Turbopack):** when a `{expression}` is immediately followed by
  literal text that continues onto a separate line before the closing tag (e.g. an expression
  on its own line, followed by more text, then `</p>` on the next line), the space right after
  the expression can silently get eaten in the compiled output — confirmed empirically in this
  codebase (e.g. `{profile.name} n'a pas...` rendered as `"Timmyn'a pas..."`). It doesn't happen
  in every such shape, so don't rely on visual inspection alone. When a name/value is
  interpolated into a sentence, prefer a single template-literal expression —
  `` {`${name} n'a pas encore commencé de livre.`} `` — over `{name} more text` split across
  lines; it sidesteps the whitespace algorithm entirely.
