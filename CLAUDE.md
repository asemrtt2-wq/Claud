# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Lumina (formerly "EBookstore") — a full-stack Next.js eBook platform. Public catalog of
eBooks, individual eBook pages with one-time Stripe Checkout purchases, a recurring Stripe
Premium subscription (monthly/yearly, unlocks the whole library), customer accounts with a
**Netflix-style multi-profile system** (any number of independent profiles per account, each
with its own name/avatar/color/type, favorites, collections, reading history, goals, and an
optional PIN lock), a dark "app shell" profile dashboard and in-browser reader modeled on the
Lumina product design (dark navy/purple glassmorphism), a kids-mode profile type (curated
catalog, daily reading-time limits, a kids-only reader with read-aloud and mascot), and a
separate password-protected admin panel for managing the catalog.

The customer-facing brand is "Lumina" (logo: `✦`, purple `#7c5cff` → `#5b3df0` gradient). Every
customer-facing page — marketing pages, `/premium`, `/ebooks/[slug]`, `/login`, `/signup`,
`/profiles`, `/p/[id]` — uses the same dark glassmorphic "app" look (`lumina-shell`/`lumina-card`
utility classes in `globals.css`), so the whole site (not just the logged-in area) now reads as
one dark product. The one deliberate exception is the reader (`/p/[id]/read/[slug]`): it uses
each eBook's own `cover-theme-*` gradient as an immersive background instead of the generic dark
shell. The admin panel (`/admin/**`) also uses the dark `lumina-shell`/`lumina-card` look now
(nav, stat tiles, tables, forms, login) with the purple accent for buttons/links — it used to keep
a separate light navy/royal-blue palette as "just an internal tool," but that read as visibly
unfinished next to the rest of the app, so it was brought in line. `next.config.mjs`,
Prisma, and every other structural/backend piece are unaffected by this — it was a visual-only
pass over the admin JSX/className strings.

### Parental controls — what's real vs. simulated

This is a web app, so a few things from the original feature request are approximated rather
than literally implemented, and future work should keep respecting these boundaries:
- **Reading-time limits are in-app, not OS-level.** A website cannot lock a phone's screen.
  `Profile.dailyLimitMinutes` gates the *Lumina reader itself* (see Reader below) — it does
  not touch device screen time.
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
- `src/app/ebooks/[slug]/page.tsx` — eBook detail page: a Netflix/Apple-TV-style layout with a
  large cover hero (gradient overlay, back/close buttons), title/author/year/page-count/category
  metadata, a progress-aware CTA ("Commencer" vs "Reprendre" with page/percent/estimated time
  remaining if `ReadingProgress` exists for the active profile), an expandable summary
  (`ExpandableText`), an actions row (favorite, add-to-collection, share via
  `ShareButton`/`navigator.share`), tabbed `Chapitres`/`Livres similaires`
  (`BookDetailTabs` + `src/lib/chapters.ts`, which parses real `"Chapitre N — Title"` markers out
  of `content` into a chapter list with per-chapter time estimates and a page index that lines up
  exactly with `paginateContent`'s grouping — clicking a chapter deep-links to
  `/p/[id]/read/[slug]?page=N`), a personalized "Recommandés pour vous" row, and an "Informations"
  panel (author/category/pages/language/year/date added — deliberately **not** ISBN, publisher,
  file size, or star ratings, since none of that data is real for this catalog and fabricating it
  would be dishonest). Access still goes through a buy button + `/premium` link when the customer
  doesn't have it.
- `src/app/premium/page.tsx` — pricing page (free / one-time purchase / Premium monthly-yearly).
- The homepage hero, feature-highlight row, "Compte enfant", "Une expérience de lecture unique",
  "Compatible partout", and final CTA band sections follow a marketing mockup the project owner
  supplied. Since the app has no real product photography/illustration assets (see "Cover art"
  under Conventions) and no image-generation tool is available, the mockup's painted illustrations
  and character art are approximated with `src/components/DeviceFrame.tsx` (`PhoneFrame`/
  `TabletFrame`/`LaptopFrame`, plain CSS bezels) wrapping `src/components/MiniAppScreens.tsx`
  (`MiniDashboardScreen`/`MiniReaderScreen`/`MiniLibraryScreen`, static illustrative recreations of
  the real in-app UI using the same `lumina-*`/`cover-theme-*` classes as the actual dashboard and
  reader) — populated with real catalog titles/covers and a real book excerpt, not invented
  content, so the "preview" is an honest one. `src/components/HeroDeviceShowcase.tsx` composes two
  overlapping `PhoneFrame`s for the hero (replaced the old `HeroCarousel.tsx` billboard);
  `src/components/HomeMarketingSections.tsx` holds the rest (`FeatureHighlights`,
  `KidsModeSection`, `ReadingExperienceSection`, `CompatibilitySection`, `FinalCtaBand`). Two
  claims from the source mockup were deliberately **not** copied verbatim because they're false for
  this product: "lis hors ligne" (offline reading is intentionally not implemented — see Reader
  below) and "Compatible iOS / Android / macOS" (this is a responsive web app, not native apps) —
  both were reworded to truthful equivalents ("depuis ton navigateur", a browser list instead of an
  OS list) rather than promising features that don't exist.

### Customer accounts & profiles
- `src/lib/auth.ts` — NextAuth config with `admin-credentials` and `customer-credentials`
  providers; `token.role` / `session.user.role` distinguish which one signed in (see
  `src/types/next-auth.d.ts` for the module augmentation).
- `src/app/signup/page.tsx` + `src/app/api/auth/signup/route.ts` — customer signup (creates a
  `Customer` row **plus one default `Profile`** named after the signup name, then signs in).
  `src/app/login/page.tsx` — customer login. Both redirect to `/profiles`, not straight into an
  app screen. Both pages are server components that render a client form component
  (`SignupForm`/`LoginForm`) — **never** import the async `Header`/`Footer` server components
  directly into a `"use client"` file, Next.js can't render a Server Component inside a Client
  Component that way.
- `src/lib/customerSession.ts` — `getCurrentCustomer()` helper (server-only) used across pages.
- **`Customer` vs `Profile`**: `Customer` is the login/billing identity only (email, password,
  Stripe `Order`/`Subscription` — purchases and Premium are account-wide, shared by every
  profile, matching how streaming services bill). `Profile` is "who's reading" — name, avatar,
  color, `type` (`"adult"` or `"kids"`), optional `pinHash`, and **all** per-reader data
  (`Favorite`, `ReadingProgress`, `Collection`, reading goal, reading-time stats, streak). A
  customer can have any number of profiles, including multiple `"adult"` ones — there is no
  cap and no assumption that the first profile is special. Data never crosses between profiles.
- `src/components/BookRow.tsx` — a horizontal, snap-scrolling row of book cards (Netflix-style
  "genre row"), used throughout the adult `/p/[id]` dashboard for "Parcourir par catégorie" (every
  adult eBook grouped by its real `category` field — always shown, so there's something to browse
  even before a profile has any favorites/history/personalization), "Recommandé pour toi", "Ma
  bibliothèque" (via `hrefBase` pointing at the reader instead of the detail page, plus a
  `progressByEbookId` map for the per-card progress bar), and "Mes favoris". Also reused on
  `/ebooks/[slug]` ("Recommandés pour vous" and the "Livres similaires" tab in
  `BookDetailTabs.tsx`) so both pages share one horizontal-row style instead of a grid.
- The `/p/[id]` adult dashboard opens with a full-width "billboard" hero (Netflix-style) instead
  of a small card: the in-progress book if there is one ("Reprendre ▶", with its progress bar),
  otherwise a top pick from recommendations/library ("Découvrir →") — falls back gracefully to
  nothing shown if the profile has no reading history and the catalog query returns nothing.
- `src/app/profiles/page.tsx` + `src/components/ProfilePicker.tsx` — the "Qui lit aujourd'hui ?"
  picker: square rounded avatar cards in a row, click switches into `/p/[id]`. A "Gérer les
  profils" toggle switches every card into edit mode (pencil badge) instead of switching profile;
  clicking a card then opens `src/components/ProfileForm.tsx` (shared create/edit form: name,
  avatar, color, adult/kids type, kids daily limit, PIN). Deleting a profile is blocked if it's
  the account's last one.
- **Active profile**: since the shared catalog pages (`/`, `/ebooks/[slug]`, `/premium`) aren't
  under `/p/[id]`, they can't read the profile id from the URL. `src/lib/activeProfile.ts` sets
  an httpOnly `activeProfileId` cookie whenever `switchProfile()` (`src/lib/profileActions.ts`)
  runs — from the picker or `ProfileSwitcher` — and `getActiveProfile()` reads it back
  (re-verifying ownership) for those shared pages. Cookies can only be set from a Server Action
  or Route Handler, not during a page render, which is why switching profile is always an action
  (`switchProfile.bind(null, id)` or a direct call), never a plain `<Link>`.
- `src/components/ProfileSwitcher.tsx` — the header dropdown (used on `/p/[id]`) listing every
  profile on the account with an avatar/color swatch; picking one calls `switchProfile()`
  directly (locked profiles instead route to `/profiles`, where the PIN gate lives). Below the
  profile list it has "Gérer les profils", "Compte" (links to `/p/[id]/compte`), and
  "Se déconnecter" — modeled after a Netflix-style profile menu, but deliberately without a
  "Transférer un profil" or "Centre d'aide" entry, since neither is a real feature in this app
  and adding either would just be a dead button.
- `src/app/p/[id]/compte/page.tsx` — a standalone "Objectifs & temps de lecture" page (adult
  profiles only, redirects kids-type profiles back to `/p/[id]`): reading goal, time-read/streak
  stats, and the account card (name/email, "Gérer les profils", "Se déconnecter", Premium status,
  daily reminder setting). This used to be an inline `#profil`/`#objectifs` section at the bottom
  of the main `/p/[id]` dashboard; it was split out into its own page so "Compte" in
  `ProfileSwitcher` and "Profil" in `AppBottomNav` (which now takes a `profileId` prop to build
  the link) navigate to a real page instead of scrolling the dashboard, and so account/billing
  info isn't mixed into the browsing experience. The old inline "Téléchargements" section (which
  only ever explained that offline reading isn't implemented) was removed outright rather than
  moved, since it wasn't a feature — just an explanation of a missing one.
- **PIN lock** (`src/lib/profileUnlock.ts`, `src/components/PinGate.tsx`): a profile with
  `pinHash` set requires the PIN before `/p/[id]` renders its dashboard — `verifyProfilePin()`
  checks it and, on success, adds the profile id to an httpOnly `unlockedProfiles` cookie
  (2h expiry) via `markProfileUnlocked()`. This is a "keep a curious kid out of the parent
  profile" gate, not real security against someone editing cookies directly — don't oversell it.
- `src/lib/recommendations.ts` — `getRecommendations()`: a simple rule-based engine (no ML) —
  "because you like X" from the profile's most-common favorited/read `category`, "auteurs
  favoris" from the most-common `author`, "nouveautés" (newest by `createdAt`), and "les plus
  populaires" (most-ordered), each excluding books already in the profile's library. The catalog
  has no series/saga data, so "continuez votre série" style recommendations aren't implemented.
- Collections (`Collection`/`CollectionItem`, profile-scoped) — `src/components/CollectionsManager.tsx`
  (create/delete a collection, remove a book) on `/p/[id]`, and
  `src/components/AddToCollectionButton.tsx` on `/ebooks/[slug]` to add the current book to an
  existing or brand-new collection, using the active-profile cookie. Server actions live in
  `src/lib/profileActions.ts` (this file replaced the old `customerActions.ts`/`childActions.ts`
  split — every action takes a `profileId` and re-verifies `profile.customerId === customer.id`
  server-side before touching data, the same defense-in-depth pattern used everywhere else).
- Reading goals, time tracking, streak: `Profile.monthlyBookGoal`
  (`src/components/ReadingGoalSetting.tsx`, progress from `ReadingProgress.completed` rows this
  month), `Profile.totalMinutesRead`/`minutesReadToday` (incremented every 60s from `Reader.tsx`
  / `KidsReader.tsx` while a book is open), and `Profile.readingStreak`/`lastReadDate`
  (consecutive-day counter, updated in `incrementReadingMinutes()` via `updateStreak()` in
  `src/lib/profiles.ts` — resets to 1 unless the profile also read yesterday).
- **"Downloads" / offline reading is intentionally not implemented.** A plain web app has no
  reliable way to cache a book for offline use without a service-worker/PWA layer, which this
  project doesn't have. There used to be a `/p/[id]` "Téléchargements" section that said so
  plainly instead of showing a button that doesn't work; it was removed outright (not moved) when
  the account/goals section was split into `/p/[id]/compte` (see Profile picker above), since an
  explanation of a missing feature isn't worth a permanent spot in the nav.
- `src/lib/access.ts` — `hasAccessToEbook()`: true if the **customer** (not the profile) has an
  active `Subscription` or a `paid` `Order` for that eBook — access is account-wide by design.

### Reader
- `src/lib/paginate.ts` — splits an eBook's plain-text `content` into pages (~900 chars,
  paragraph-aware).
- `src/app/p/[id]/read/[slug]/page.tsx` — the one reader route for every profile. Verifies the
  profile belongs to the logged-in customer, then branches on `profile.type`: `"kids"` renders
  `KidsReader` (and 404s unless `ebook.audience === "kids"`), `"adult"` checks
  `hasAccessToEbook()` and renders `Reader` (and 404s unless `ebook.audience === "adults"`).
- **PDF-linked books**: `EBook.pdfUrl` is an optional field, settable from the admin ebook form
  (`src/components/EbookForm.tsx`), for a book whose real content is a PDF hosted elsewhere (the
  form's helper text is explicit that this must be a public URL — a local file path like
  `/Users/you/Desktop/book.pdf` is meaningless to a deployed server, since nothing outside that
  person's own machine can reach it). When set, `Reader.tsx` skips the whole paginated
  text-reading UI (font size, pages/scroll toggle, immersive background) and instead renders the
  PDF directly in an `<iframe>` — which shows the first page by default, exactly like opening the
  file in a browser tab, with a "open in new tab" fallback link. This intentionally does **not**
  extend to `KidsReader` (mascot/read-aloud/daily-limit are all built around the plain-text
  `pages` array) or to per-page reading progress/streak/pace tracking on `/ebooks/[slug]`
  (`isPdf` guards hide the page count, resume-percent, and chapters tab there instead of showing
  meaningless numbers) — a PDF book has no chapter markers or page-position concept the rest of
  the app can hook into without embedding a real PDF.js-based viewer, which is a larger lift than
  this covers.
- **Real front/back cover images**: `EBook.coverImageUrl`/`backCoverImageUrl` are optional fields
  (same "must be a reachable path" rule as `pdfUrl` — a path under `public/`, e.g.
  `/covers/my-book-front.jpg`, works since Next serves that statically; an absolute external URL
  works too). When set, they replace the `coverEmoji`+`coverTheme` gradient everywhere a cover
  renders (`EBookCard`, `BookRow`, the `/ebooks/[slug]` hero, the `/p/[id]` billboard/continue
  card/library rows). In `Reader.tsx`, a `coverImageUrl` becomes an actual first page before the
  text starts and `backCoverImageUrl` an actual last page after it — a real front/back cover
  reading experience, not just a thumbnail — via a `view` index that layers the two cover slots
  on top of the real 0-based content `page` (which is what's actually saved to
  `ReadingProgress`, so resuming mid-book still resumes correctly and skips straight past the
  cover; only a fresh read with no progress yet opens on the front cover). `coverTheme` is still
  required and still used for the immersive reading background between the two covers, since a
  cover image doesn't imply a matching page-background gradient.
- `src/components/Reader.tsx` — "immersive" (default) vs "clair" (light) toggle, plus a
  "pages" (click-through, default) vs "scroll" (continuous, all pages concatenated) mode toggle.
  Immersive mode uses the eBook's `cover-theme-*` gradient as a full-page background with a dark
  overlay and a glassmorphic content card; light mode is a plain white reader. Font size (A-/A+),
  prev/next, and a purple progress bar work in both modes — border/background colors on the
  control buttons branch on the `immersive` boolean so they stay visible in light mode too.
  In scroll mode, progress is derived from scroll position (debounced) instead of button clicks.
  Reading position is saved via `saveReadingProgress(profileId, ebookId, page)` in
  `src/lib/profileActions.ts`; reading time via `incrementReadingMinutes(profileId)` every 60s.
- `src/components/KidsReader.tsx` — adds on top of that pattern: a bouncing mascot emoji on page
  turn, a `SpeechSynthesis`-based read-aloud voice picker (Femme/Homme/Robot/Alien/Loup/Ours —
  pitch/rate presets on the browser's built-in voice, not distinct synthesized models), and a
  daily-limit lock screen once `Profile.dailyLimitMinutes` is hit for the day (checked on load
  via `getReadingStatus()` so an already-over-limit kid sees it immediately, not after a minute).
  `Profile.dailyLimitMinutes` gates the *Lumina reader itself* — a website cannot lock a phone's
  screen, so this is in-app only, not OS-level.
- `src/components/BedtimeReminder.tsx` — client component, used on both adult and kids `/p/[id]`
  dashboards, keyed off `Profile.reminderTime`; shows a banner if `now` is within ~90 minutes
  after the configured time and there's no reading activity yet today for that profile. This is
  an in-app banner, not a real push notification (no service-worker/backend cron infra here).

### Password reset
- `PasswordResetToken` (customerId, unique `token`, `expiresAt`, `usedAt`) — a 1-hour, single-use
  token. `src/lib/passwordReset.ts` exports `requestPasswordReset` (always returns a generic
  `{ ok: true }` regardless of whether the email exists, to avoid account enumeration) and
  `resetPassword` (validates the token is unused/unexpired, updates `Customer.passwordHash`,
  marks the token used). **No email provider is configured in this app**, so the reset link is
  `console.log`'d server-side instead of being emailed — it is deliberately never returned in the
  HTTP response, since doing that would let anyone reset any account's password just by
  submitting their email. `/forgot-password` (`ForgotPasswordForm`) and `/reset-password?token=`
  (`ResetPasswordForm`) are real, working pages; wiring up an actual email provider (e.g. Resend)
  is the one piece left to make delivery automatic — swap the `console.log` in
  `requestPasswordReset` for a real send call once an API key is available. A "Mot de passe
  oublié ?" link on `/login` (`LoginForm`) points here. This only covers customer accounts —
  admin credentials are seed/env-managed by design (see Admin below), not self-service.

### Kids-mode catalog
- `EBook.audience` (`"adults"` default, or `"kids"`) splits the catalog: the homepage/catalog
  flow only ever queries `audience: "adults"`; a `"kids"`-type profile's `/p/[id]` only ever
  queries `audience: "kids"`. Kids eBooks are free/bundled (no Order/Subscription needed) —
  access is just "this profile is kids-type," not a purchase.

### Payments
- `src/app/api/checkout/route.ts` — one-time purchase; requires a logged-in customer, creates
  a `pending` Order linked to that customer, then a Stripe Checkout Session (`mode: "payment"`).
  **`PURCHASES_ARE_FREE` (top of the file) is currently `true`**, the same temporary testing
  bypass as `SUBSCRIPTIONS_ARE_FREE` below — the Order is created `paid` immediately, no Stripe.
  Flip both back to `false` together before this app takes real payments.
- `src/app/api/subscribe/route.ts` — Premium subscription; requires a logged-in customer,
  upserts a `Subscription` row (`status: "incomplete"`), then a Stripe Checkout Session
  (`mode: "subscription"`) with inline `price_data.recurring` (no pre-created Stripe Price
  needed). **`SUBSCRIPTIONS_ARE_FREE` (top of the file) is currently `true`** — a deliberate,
  temporary bypass requested by the project owner to test the full catalog/reading experience
  without paying, while more books were still being added. While it's on, subscribing skips
  Stripe entirely and activates the `Subscription` immediately (`status: "active"`). Flip it back
  to `false` to restore real Stripe billing before this app is actually used by paying customers
  — nothing else needs to change, the normal Stripe Checkout code path right below it is untouched.
- `src/app/api/webhook/stripe/route.ts` — on `checkout.session.completed`, marks the Order
  `paid` (payment mode) or the Subscription `active` (subscription mode, using
  `session.metadata.customerId`); on `customer.subscription.updated/deleted`, syncs status.

### Admin
- `src/app/admin/**` — admin dashboard (list/create/edit/delete eBooks) and `admin/login`.
  Protected by `src/proxy.ts` (Next.js 16 renamed `middleware.ts` to `proxy.ts`; it must live
  under `src/` because the app lives under `src/app`), which redirects to `/admin/login`
  unless `token.role === "admin"` — a logged-in customer is not enough. Admin mutations go
  through Server Actions in `src/lib/actions.ts`, each of which independently re-checks the
  session server-side (defense in depth beyond the proxy). `EbookForm` covers every real field
  on `EBook`, including `content` (the full book text — use `"Chapitre N — Title"` lines so
  `src/lib/chapters.ts` picks up chapters), `author`, `publishedYear`, and `audience`
  (`"adults"`/`"kids"`), so a real book with working chapters/reader access can be added entirely
  through `/admin/ebooks/new` without touching `prisma/seed.ts`. The `Admin` account itself has
  no self-service signup — `scripts/ensure-admin.ts` runs on every `build` (right after
  `prisma migrate deploy`, before `next build`) and upserts (by email) an `Admin` row from
  `ADMIN_EMAIL`/`ADMIN_PASSWORD`, so a redeploy always makes those exact env vars a working
  login, even if they're changed later or an `Admin` row already exists under a different email.
  This isn't a public account-creation path (nothing end-user-facing triggers it, only the
  project owner's own env vars on their own deploy) — it just means setting those two env vars in
  Vercel and redeploying is enough to get (or reset) a working admin login, no manual
  `npm run db:seed` against production needed. `prisma/seed.ts` does the same upsert for local dev
  seeding. Env var names are case-sensitive on Vercel — they must be exactly `ADMIN_EMAIL` and
  `ADMIN_PASSWORD` (uppercase with underscore), not `admin_email`/`admin_password`.

### Site settings
- `SiteSettings` — a singleton row (`id: 1`, upserted) holding `heroTitle`/`heroSubtitle` overrides
  for the homepage hero. `src/lib/siteSettings.ts` exports `getSiteSettings()` and the
  `updateSiteSettings` server action (admin-session-gated, like everything in `actions.ts`).
  `/admin/settings` (linked from `AdminNav`) is the only editor. When a field is empty/unset,
  `src/app/page.tsx` falls back to the original hardcoded hero copy (including its two-tone
  gradient styling on the title) — a custom title loses that gradient split since it's rendered
  as one plain string. This intentionally does not extend to colors/theme: the purple accent is
  hardcoded as literal hex values across dozens of components rather than only the `--color-
  lumina-purple` CSS variable, so a real site-wide color picker would need that centralized first.

### Data model (`prisma/schema.prisma`)
`EBook` (has a `content` text field used by the reader, `author`/`publishedYear` fields for the
detail page's metadata, and an `audience` field — `"adults"`/`"kids"`), `Order` (one-time
purchases, optional `customerId`), `Admin`,
`Customer` (just login/billing: email, passwordHash, name, `Order[]`, `Subscription?`,
`Profile[]`), `Subscription` (one-to-one with `Customer`, account-wide), `Profile` (belongs to a
`Customer`; `name`/`avatarEmoji`/`color`/`type` (`"adult"`/`"kids"`), optional `pinHash`,
`dailyLimitMinutes`/`minutesReadToday`/`limitResetDate` (kids reading-time limit),
`reminderTime`, `monthlyBookGoal`, `totalMinutesRead`, `readingStreak`/`lastReadDate`),
`Favorite` and `ReadingProgress` (profile-scoped join tables, unique on `[profileId, ebookId]`;
`ReadingProgress` also carries `completed`, `lastPageAt`, `avgSecondsPerPage` — the same
pace-tracking fields used to flag "very fast"/"posé" reading pace apply to any profile now, not
just kids), and `Collection`/`CollectionItem` (profile-scoped book shelves, unique on
`[collectionId, ebookId]`).

There used to be a separate `ChildProfile`/`ChildReadingProgress` pair and `Customer` doubled as
the implicit single "adult profile" — that was replaced by the unified `Profile` model above so
an account can hold any number of independent adult *and* kids profiles with fully isolated data,
matching a real streaming-service profile switcher. If you see references to `ChildProfile`,
`customerActions.ts`, `childActions.ts`, `/account`, or `/kids/[id]` in old notes/PRs, they're
stale — the current routes are `/profiles` (picker) and `/p/[id]` (dashboard, both profile
types) / `/p/[id]/read/[slug]` (reader, both profile types).

- `prisma/seed.ts` — sample adult catalog (with placeholder chapter content for the reader,
  and an `author` per title) plus three short kids storybooks (`audience: "kids"`, free) +
  admin account bootstrap. Does not seed a demo customer — use `/signup` locally, which
  auto-creates that account's first `Profile`. Also includes "Le Code du Guerrier", a real book
  supplied by the project owner (source: a self-contained HTML export from the `ebook` skill,
  with both covers embedded as base64 images) — the chapter text was extracted from that HTML
  into `content` (its 14 `<h3>` chapters converted to `"Chapitre N — Title"` markers so
  `chapters.ts` picks them up) and its two embedded cover images were decoded, resized, and
  committed as `public/covers/le-code-du-guerrier-{front,back}.jpg`, referenced from
  `coverImageUrl`/`backCoverImageUrl`. This is the reference example for adding another book the
  same way: extract clean chapter text + save the two cover images under `public/covers/`, no
  file-upload storage needed since these ship as static files with the deployment itself.

## Conventions

- Tailwind v4: custom brand tokens (colors, shadows, radius) are declared once in
  `src/app/globals.css` under `@theme`, then used as normal utility classes (e.g. `bg-navy`,
  `shadow-soft`). Don't add a `tailwind.config.js` — v4 doesn't need one here.
- Cover art has no real images by default; every eBook has a `coverEmoji` + `coverTheme` (one of
  `royal`, `navy`, `deep`, `dark`, `steel` for adult titles — CSS gradients defined in
  `globals.css` as `.cover-theme-*` — kept within the navy/royal-blue brand palette; `aurora`,
  `ember`, `forest` are additional darker/warmer gradients reserved for kids storybooks). A book
  can optionally override this with a real `coverImageUrl`/`backCoverImageUrl` (see "Real
  front/back cover images" under Reader) — `coverEmoji`+`coverTheme` remain required either way
  since `coverTheme` still drives the reader's background and both act as the fallback anywhere
  an image fails to load or isn't set.
- `src/lib/profileColors.ts` — `PROFILE_COLORS` (4-color palette: `yellow`/`blue`/`green`/`purple`)
  and `PROFILE_AVATARS` (the emoji picker list) used by `Profile.color`/`avatarEmoji`;
  `profileGradient(color)` returns a CSS gradient string for inline `style` use (avatar
  backgrounds in `ProfileForm`, `ProfilePicker`, `ProfileSwitcher`, `/p/[id]` headers) — not
  Tailwind classes, since the color is dynamic/user-chosen.
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
