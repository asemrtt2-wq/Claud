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
- `src/app/page.tsx` — home page (hero + "Nos dernières parutions" + category tiles +
  testimonials), a server component that reads eBooks directly from Prisma. The hero pitches
  Lumina as short daily-learning reads ("Apprenez quelque chose de nouveau chaque jour"), and the
  "Nos dernières parutions" grid always shows the real 4 newest adult eBooks by `createdAt`
  (`dedupeSeries()`-collapsed so a multi-tome series only takes one slot) — this replaced an
  earlier `pickDailyBooks()` rotation gimmick that showed a deterministic-but-arbitrary daily
  pick under a "populaires" label; showing the true latest releases under a "dernières
  parutions" label is both simpler and more honest about what the section actually is.
  `HomeMarketingSections.tsx`'s `HowItWorksSection` (Créez votre profil → Découvrez vos lectures →
  Lisez à votre rythme) and the reworked `KidsModeSection` copy (now framed around "toute la
  famille" rather than kids specifically, since the account model already supports any number of
  adult *and* kids profiles — see Series/Profiles below) round out the current homepage narrative.
- `src/app/bibliotheque/page.tsx` — a dedicated public catalog page (the header's "Bibliothèque"
  link now points here instead of anchor-scrolling to the homepage's own catalogue section).
  Category filter pills are the real distinct `category` values in the catalog (not a hardcoded
  example list) and are plain anchor links (`#neurosciences`, etc.) down to that category's own
  row — no separate filtered-view state, since the whole catalog is already on the page.
  **"À la une"** picks `EBook.featured` (falling back to the newest book if nothing is flagged
  featured) and links to the reader directly if the visiting customer already has access
  (`hasAccessToEbook()`) via their active profile, or to `/ebooks/[slug]` otherwise — mirroring
  the "Lire"/"Découvrir" wording split. **"Me recommander un livre"** calls
  `getSurpriseBook()` (`src/lib/recommendations.ts`): personalized (same signals as
  `getRecommendations()`) when a profile is active, otherwise a genuinely random pick from the
  adult catalog via `skip: Math.floor(Math.random() * count)` — re-rolled on every page load, not
  a single fixed "recommendation" cached anywhere. There is no "Premium" filter pill like an
  early mockup suggested, since Premium unlocks the *entire* library rather than a distinct
  premium-only book subset — a pill for it would filter to either everything or nothing.
  Category rows use `src/components/LibraryBookRow.tsx` — a richer, taller card (cover, badge,
  title, description, category + real reading-time estimate, price, and a Lire/Découvrir button)
  than the compact `BookRow` tile used elsewhere in the app (dashboard rows, "Ma bibliothèque",
  the reader's end-of-book "Livres similaires"). This is a deliberately separate component rather
  than a variant of `BookRow`, since the two are tuned for different contexts — `BookRow`'s bare
  cover+title suits dense, personal, already-familiar rows, while this page is a first-time
  browsing/discovery surface where more info up front (and a per-book access check, computed once
  per page load from the customer's paid `Order`s and `Subscription` status, not one query per
  book) helps a visitor decide what to read. Reusing `BookRow` here would have meant cramming this
  much text into a tile designed for a plain cover, or bloating `BookRow` with props unused by
  every other caller.
- `src/app/ebooks/[slug]/page.tsx` — eBook detail page: a Netflix/Apple-TV-style layout with a
  large cover hero (back/close buttons), title/author/year/page-count/category
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
  content, so the "preview" is an honest one — `MiniReaderScreen` in particular renders a
  full-bleed light-mode page (no header/footer chrome, just a thin top progress line and a page
  counter) so it reads as an actual open book rather than app UI. `src/components/
  HeroDeviceShowcase.tsx` composes two overlapping `PhoneFrame`s for the hero (replaced the old
  `HeroCarousel.tsx` billboard);
  `src/components/HomeMarketingSections.tsx` holds the rest (`FeatureHighlights`,
  `KidsModeSection`, `ReadingExperienceSection`, `CompatibilitySection`, `FinalCtaBand`). Two
  claims from the source mockup were deliberately **not** copied verbatim because they're false for
  this product: "lis hors ligne" (offline reading is intentionally not implemented — see Reader
  below) and "Compatible iOS / Android / macOS" (this is a responsive web app, not native apps) —
  both were reworded to truthful equivalents ("depuis ton navigateur", a browser list instead of an
  OS list) rather than promising features that don't exist.

### Visual polish / "premium" pass (identity, cards, gamification)

A later pass made the whole app feel more like a finished premium product without inventing data
that doesn't exist. What changed, and — just as importantly — what was deliberately left out and
why, since a couple of the source requests would have meant faking numbers:

- **`.lumina-shell` background** (`globals.css`) is now a richer violet → navy → black vertical
  gradient layered with three soft radial glow blobs instead of the flatter two-blob version —
  applies everywhere the class is used (homepage, `/login`, `/signup`, `/profiles`, `/p/[id]`,
  `/p/[id]/compte`) with a single shared edit. `.lumina-card` picked up a heavier shadow and an
  explicit 20px radius. A new `.lumina-glow` utility (a blurred, slowly-pulsing circle) is used
  for a couple of extra ambient glows on the homepage hero.
- **`EBookCard`/`BookRow` hover polish**: scale-up (1.03–1.1) + a purple glow shadow + (on
  `EBookCard`) a slow image zoom on hover, replacing the flatter lift-only hover. Hovering an
  `EBookCard` also reveals real `📖 {pages} pages` / `⏱ ~{minutes} min` text (computed from
  `paginateContent`/word-count, exactly like the reader's own estimates — not invented) via a
  color transition from transparent to visible, so there's no layout shift. Grid/row items fade
  and slide in on mount (`.animate-fade-in-up`, staggered per index) instead of appearing all at
  once.
- **Real badges, not fake ones**: a "🆕 Nouveau" ribbon (`isNewBook()` in `src/lib/badges.ts` —
  `createdAt` within 14 days) and a "🔥 Bestseller" ribbon (`getBestsellerIds()` in
  `src/lib/recommendations.ts` — real paid-`Order` counts grouped by eBook, the same signal the
  "Les plus populaires" recommendation row already used) show on the homepage's daily grid and on
  `BookRow` tiles across the homepage and `/p/[id]` dashboard. Deliberately **not** built: a star
  rating (⭐ 4.9-style) or a reader/view count (👁 245 000 lecteurs) — this app has no rating
  model and the real customer/profile count is nowhere near "245 000," so displaying either would
  be fabricating a number, not styling one. Same reasoning killed "🎧 Disponible en audio" and
  "⬇ Téléchargement" cover badges — this catalog has no audio narration and offline download is
  explicitly not implemented (see Reader below), so a badge advertising either would be false
  advertising, not polish.
- **"Explorer par catégorie"** (`src/app/page.tsx`, using `src/lib/categoryStyle.ts`): colored
  gradient tiles for every real `category` value actually present in the catalog (Neurosciences,
  Bien-être, Biologie, Histoire & récit, etc. — not a hardcoded example list), each tile linking
  to `/p/{activeProfileId}#parcourir` (the existing "Parcourir par catégorie" section on the
  dashboard) when a profile is active, or `/login` otherwise — reusing the real browse section
  instead of building a second, separate filtered-catalog page.
- **Dashboard billboard** (`/p/[id]`): gained a "🤍/❤️ Ajouter aux favoris" button (the same
  `FavoriteButton` component/action used on `/ebooks/[slug]`) and a thicker progress bar. The
  favorite toggle everywhere (`FavoriteButton.tsx`, and the reader's own favorite button in
  `Reader.tsx`) now plays a `.heart-pop` micro-interaction on click.
- **Gamification-lite** (`/p/[id]/compte`): a "Niveau {n}" card with an XP bar, and a grid of
  milestone badges (first book finished, 10 books, 7-day streak, 10h/50h read, monthly goal hit) —
  locked ones shown dimmed with a 🔒. The XP formula (`computeLevel()` in that page) is arbitrary
  for-fun framing (`totalMinutesRead × 2 + completedBooks × 50 + streak × 5`), but every input is
  a real, already-tracked `Profile` field — nothing is stored or fabricated beyond what
  `/p/[id]/compte`'s stats cards already showed. Deliberately **not** built: a persisted
  achievements/XP/challenges system with its own unlock history, which would need a new Prisma
  model (`Achievement` or similar) — this is a computed-on-read presentation layer over existing
  stats, not a new gamification backend.
- **Loading skeletons**: `src/app/loading.tsx` and `src/app/p/[id]/loading.tsx` use a shared
  `.skeleton` shimmer class instead of a spinner, shown by Next.js automatically while those routes'
  server components are rendering.
- **Deliberately not built in this pass** (production-heavy, dishonest, or blocked on an
  already-documented prerequisite): literal parallax/fog/particle effects on the hero (the ambient
  `.lumina-glow` blobs are the lightweight version of "the hero feels alive"); a full multi-theme
  color picker (Noir/Violet/Bleu Nuit/Or/Rouge/Vert Émeraude) — `Conventions` above already notes
  the purple accent is hardcoded as literal hex values across dozens of components rather than a
  single CSS variable, so a real site-wide theme switcher needs that centralization done first,
  not a half-working picker that only recolors a few elements; "Recommandations IA" — the existing
  `getRecommendations()` engine is honestly documented as rule-based, no ML, so it keeps its
  honest "Recommandé pour toi" label rather than being rebranded "IA."

### "Cinematic" gold/bordeaux pass ("Juste le look")

The project owner asked for a much more premium/cinematic redesign built around a
"warrior/mental/stoicism" repositioning (new nav, fake categories like GUERRIER/SPARTE/STOÏCISME,
a hardcoded author, an invented star rating, invented "livres lus"-style stats as literal example
numbers). Since that conflicted with the real, diverse catalog (Neurosciences, Biologie, Cuisine,
Voyage, Fitness — not just warrior content) and with this codebase's standing rule against
fabricated ratings/stats/authors, the scope was explicitly narrowed via a clarifying question:
**visual language only, real catalog/categories/authors/stats untouched.** What shipped:

- **Expanded palette** (`globals.css` `@theme`): `--color-lumina-wine`/`--color-lumina-wine-light`
  (deep bordeaux-red) and `--color-lumina-gold`/`--color-lumina-gold-light`, layered on top of
  the existing violet/navy tokens rather than replacing them. `.lumina-shell`'s background gained
  a wine-red radial glow and a deeper black tail. Two new utility classes: `.lumina-card-premium`
  (a glass card with a subtle gold border that brightens + glows gold on hover, used for
  higher-emphasis cards) and `.lumina-gold-text` (gold gradient text-clip, used for taglines/
  section labels/stat headers that should read as a premium accent, not the default purple).
- **"Continuer ma lecture"** — a new horizontal row on the adult `/p/[id]` dashboard, right after
  the billboard, showing every in-progress (`ReadingProgress`, not `completed`) book as a
  `.lumina-card-premium` tile with cover, title, a real `{percent}% terminé` (computed from
  `page` / total pages, same math the billboard/ebook page already use) in gold, a progress bar,
  and a "Continuer →" link straight into the reader at the saved page.
- **Real curated collections with taglines**: `Catalog.description` (see "Curated catalogs"
  above) plus a genuine collection ("Collection Guerrier") built from a real book already in the
  catalog — not the fictional 5-collection lineup (Discipline, Pouvoir, etc.) from the original
  spec, since those don't correspond to anything in the real library yet. A second one,
  "Collection Sparte", shipped the same way but was removed later — see "Curated catalogs" below.
- **"Ton parcours" real-stats section** (`/p/[id]/compte`, above the existing Niveau/XP card):
  four `.lumina-card-premium` tiles — Livres lus (`completedBooksTotal`), Pages lues (a new
  `pagesReadTotal`, summing `page + 1` across every tracked `ReadingProgress` row — genuinely
  derived, not stored separately), Temps de lecture (`Profile.totalMinutesRead`), Série actuelle
  (the existing streak calc). This mirrors the shape of the spec's example stat block
  ("Livres lus: 12, Pages lues: 847...") using 100% real per-profile numbers instead of the
  example values.
- **Gold accents elsewhere**: category tiles (`src/app/page.tsx`) get a gold border/glow on
  hover instead of just lifting; the billboard's "Recommandé pour toi" tag and "Continuer la
  lecture" label render in `.lumina-gold-text`; the footer tagline is the requested
  "Lis. Apprends. Transforme-toi." slogan in gold; the header's signed-out primary CTA became
  "⚡ Commencer mon parcours" (only that one button — the hero and `FinalCtaBand`'s own
  "Commencer gratuitement" CTAs were left as-is, this pass didn't do a copy sweep).
- **Deliberately not built** (per the "Juste le look" scope decision): the header nav restructure
  (Accueil/Explorer/Collections/Ma bibliothèque + search/notifications icons) — the existing
  Accueil/Bibliothèque/Premium/Avis Clients nav already covers real site sections and a
  notifications icon with nothing behind it would be a dead affordance; the six fictional
  "CHOISIS TON MENTAL" categories (GUERRIER/MENTAL/SPARTE/POUVOIR/STOÏCISME/MOTIVATION) — real
  `category` values already drive "Explorer par catégorie"/"Parcourir par catégorie", and
  swapping in invented categories would disconnect those tiles from the real catalog they filter
  into; a hardcoded "Auteur : Asem" on the book detail page — `EBook.author` is a real per-book
  field already, overwriting it with one fixed name would be false for every other title; a star
  rating control — no rating storage exists, same reasoning as the earlier "no fake ⭐" decision
  above.

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
  `BookDetailTabs.tsx`) so both pages share one horizontal-row style instead of a grid. Hovering a
  cover scales it up slightly (`z-10` so it isn't clipped by neighbors); rows with more than 3
  books get a `‹`/`›` arrow fixed to each edge (fade in on row hover, no movement of their own)
  that scroll the row by ~80% of its visible width. The cover tile always renders its
  `cover-theme-*` gradient as the tile background (not just as an image-missing fallback) and
  lays a real `coverImageUrl` over it with `object-contain` rather than `object-cover` — a
  portrait cover (~0.56 aspect ratio) inside a wider tile no longer gets its title cropped off;
  the gradient shows as letterbox/pillarbox fill around it instead.
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
  cover image doesn't imply a matching page-background gradient. On the `/ebooks/[slug]` hero, a
  real cover image is shown twice at once rather than once cropped: a blurred, darkened,
  full-bleed copy (`object-cover object-top blur-2xl`) fills the band as a backdrop, and a second,
  un-cropped copy floats centered over it at `object-contain` so the whole cover — including the
  title, which used to get cut off when the hero cropped a portrait cover to a landscape band —
  is always fully visible before a visitor reads the summary or buys.
- `src/components/Reader.tsx` — a premium, Apple-Books-style reading experience. Four **reading
  themes** (Clair `#FAFAFA`, Sépia `#F4ECD8`, Sombre `#161616`, Immersif — the eBook's
  `cover-theme-*` gradient with a dark overlay, the long-standing default) replace the old
  binary immersive/clair toggle; a `dark` boolean derived from the theme drives chrome
  (borders/backdrop) styling for both dark themes at once. A "pages" (click-through, default) vs
  "scroll" (continuous, all pages concatenated with a thin `···` divider between them) mode
  toggle remains. All of these plus font family (sans/serif), text size (17–23px), line-height
  (1.6/1.8/2, "Compact/Confort/Aéré"), and content width (620/720/860px, "Étroit/Confort/Large")
  live in a single "Aa" **Réglages** dropdown instead of cluttering the toolbar (font family
  defaults to **serif** now, since the paged view is meant to read like a printed book) — they're plain
  `useState` UI prefs (not persisted server-side; they reset per session, same tier as the
  existing font-size control that was already client-only).
  - **Content rendering**: page text is split on blank lines and each block is classified —
    a line matching the same `Chapitre N — Title`/`Introduction` heading pattern `chapters.ts`
    uses renders as a large styled heading (not just bigger inline text); a block starting with
    `> ` renders as a purple-accented quote card; a block whose every line starts with `- `
    renders as a bulleted list; anything else is a normal paragraph. This is a convention any
    future book's `content` can opt into from the admin form — existing plain-paragraph books are
    unaffected and just render as before, only with the new width/size/line-height/spacing.
  - **Progress header**: below the icon row, a small info line shows the current chapter title
    (resolved from the `chapters` prop passed down from the read-route page, via
    `getChapters(ebook.content)` — the same chapter list `/ebooks/[slug]`'s "Chapitres" tab
    uses) plus `{percent}% · ~{N} min restantes`. The remaining-time estimate is real, not
    invented: if `ReadingProgress.avgSecondsPerPage` exists for this profile (already tracked by
    `saveReadingProgress`) it's `avgSecondsPerPage × pagesLeft`; otherwise it falls back to a
    200-words-per-minute estimate over the actual remaining page text — never a fabricated
    constant.
  - **Sommaire / Signets panel** (📑): two tabs. "Chapitres" lists the real parsed chapters with
    per-chapter time estimates, jumping straight to that chapter's page. "Signets" is a genuine
    bookmark list (any page, not just chapter starts) — stored in `localStorage` under
    `lumina-bookmarks:{ebookId}:{profileId}`, **not** synced server-side/cross-device (a real
    per-profile DB model would be the next step if that matters; this ships something functional
    today without a schema migration).
  - **Recherche** (🔍): client-side full-text search across the already-loaded `pages` array —
    no new endpoint, matches with a snippet, click jumps to that page.
  - **Favori** (🤍/❤️): the same `toggleFavorite()` action `FavoriteButton` uses on
    `/ebooks/[slug]`, so favoriting works from inside the reader too.
  - **Quote copy/share**: selecting text anywhere in the page content shows a small floating
    "📋 Copier / ↗ Partager" pill using the browser's native text selection (a real highlight
    while reading), `navigator.clipboard`, and `navigator.share` (falls back to clipboard where
    Web Share isn't available). This is **not** a persistent saved-highlights feature — no new
    data is stored — just a quick copy/share of whatever's selected.
  - **End-of-book screen**: appended after the last page (or back cover, if the book has one) —
    "Merci d'avoir lu « Title » !", a real "Tome suivant" link when the eBook has a `seriesName`
    and a next `seriesOrder` exists, a "Livres similaires" `BookRow` (same category-based query
    `/ebooks/[slug]` uses, series-deduped), and "Retour à la bibliothèque". Deliberately has
    **no** star-rating control — this app has no rating storage, and a rating UI that doesn't
    save anywhere would be exactly the kind of fake feature this codebase avoids.
  - Border/background colors on every control branch on `dark` (not raw `immersive` anymore) so
    they stay legible across all four themes. **In paged mode the chrome starts hidden** and the
    reader shows only a running head (current chapter) and a page counter, like a real book;
    tapping the middle of the page toggles the toolbar and the bottom bar back, and a faint ⌄
    button in the corner does the same for mouse users. The toolbar and bottom bar are
    *overlaid* (absolutely positioned) in paged mode rather than taking flex space, because
    otherwise revealing them would shrink the page box and re-flow the text under the reader's
    eyes mid-sentence. Scroll mode keeps both in normal flow and always visible. In scroll mode the
    same two buttons call `scrollStep(±1)` (~85% of visible height via
    `scrollBy({ behavior: "smooth" })`) and are never `disabled`; in "pages" mode they call
    `handleNext()`/`handlePrev()`, which route to a real page-turn (see below) for content pages
    or a simple `goToView()` for the front/back cover, and stay `disabled`-at-the-edges. Reading
    position is saved via `saveReadingProgress(profileId, ebookId, page)` in
    `src/lib/profileActions.ts`; reading time via `incrementReadingMinutes(profileId)` every 60s.
    The top toolbar collapses to nothing via a `max-height` transition when the ⌃ button is
    pressed (also closes any open panel); a small floating ⌄ pill (fixed top-center) brings it
    back. Front/back cover transitions still use the older `page-turn-forward`/`page-turn-backward`
    CSS keyframe (`globals.css`, a slide + slight `rotateY` skew) — a real 3D flip on a full-bleed
    cover image added little over the simpler slide, so it was left as-is; only content-page
    navigation got the full treatment below.
  - **`src/components/BookPager.tsx`** — the paged reading surface, rebuilt to work the way
    Apple Books does: **the text is re-flowed to fit the screen, so a page is never scrollable.**
    The whole book is laid into CSS multi-columns (`column-width` = the measured page box,
    `column-fill: auto`) inside a clipped viewport, and turning a page translates the flow by one
    column. A `ResizeObserver` plus a `layoutKey` (font size, line height, font family, theme)
    re-flows it whenever the shape of the text changes, so the reader can resize a window, rotate
    a tablet or bump the type size and always get whole pages. Screens ≥900px get a real
    **two-page spread** with a centre spine and turn 2 columns at a time; narrower screens show a
    single page. Navigation is unified: swipe/drag, tapping the left/right ~28% of the page, the
    ← Précédent / Suivant → buttons, and the ⬅/➡ arrow keys all funnel through one `goTo()`.
    This replaced `BookFlip.tsx`'s 3D page-curl, which had to be removed rather than kept: it
    rendered one fixed canonical page per sheet, and those 900-character pages overflowed their
    sheet on most screens, leaving the reader scrolling *inside* a page — the specific thing the
    redesign was asked to eliminate. Front/back cover transitions still use the older
    `page-turn-forward`/`page-turn-backward` CSS keyframes.
    - **Canonical vs. rendered pages.** Everything else in the app (progress, highlights,
      bookmarks, chapters, search, TTS) still addresses pages by the canonical index from
      `paginateContent()`, which must stay device-independent — a phone and a desktop have to
      agree on where page 12 is. So each canonical page is rendered inside a `[data-cpage="i"]`
      anchor, and after each layout pass the pager reads every anchor's `offsetLeft` to build an
      exact two-way map between canonical pages and rendered columns. External jumps (a chapter
      link, a search hit, a bookmark, resuming at the saved page) scroll to the mapped column;
      user page-turns report the mapped canonical page back up.
    - Only user-initiated turns report a page change (it happens inside `goTo()`, not in an
      effect on the column index). Doing it in an effect also fired for layout-driven moves —
      including the one on mount, which raced ahead of the measured columns, reported page 0 and
      **wiped the reader's saved position** every time a book was opened.
    - The page's own background is real paper (`#FAFAF7` for Clair/Immersif, a warm cream for
      Sépia, a dark gray with light text for Sombre as a genuine night-reading option) regardless
      of the reader's outer theme, which stays applied to the chrome/backdrop around the book —
      deliberately not stripping dark mode in favor of literal realism, since night reading is
      too established a reader expectation to drop.
    - Book typography lives in `globals.css` under `.reader-justified`: justified text with
      `hyphens: auto`, `break-inside: avoid` on headings/quotes/list items, and a
      `p:last-child` margin override — Tailwind's `last:mb-0` was written for isolated pages and
      swallowed the paragraph gap at every canonical page boundary once pages flow continuously.
  - **Lecture à voix haute avec surlignage mot-par-mot** (🎧): uses the browser's
    `SpeechSynthesis`/`SpeechSynthesisUtterance` on the *current page's* text, with a voice
    picker (French voices preferred, falling back to whatever the browser exposes — real browser
    voices, same honesty convention as `KidsReader`, not distinct synthesized characters) and a
    0.75×–1.5× speed control. Word highlighting comes from the utterance's `onboundary` event
    (`event.charIndex`), mapped to a word index via `wordIndexAtCharIndex()`. The tricky part:
    the *spoken* text and the *rendered* text must tokenize identically or the highlighted word
    drifts from what's actually being read — `getCleanedText()` strips the same "> "/"- "
    markers and reformats the same chapter-heading line that `renderBlock` already strips when
    rendering, so both sides count words the same way. `renderTextWithMarks()` does the actual
    per-word `<span>` wrapping, checking both the active TTS word (purple) and any saved
    highlight range (yellow) in one pass. Finishing a page's utterance auto-advances to the next
    page and keeps reading, matching a continuous audiobook-style flow; changing pages, speed, or
    voice while listening restarts the utterance for the new page. This depends entirely on the
    browser/OS having TTS voices installed — with none available (e.g. a bare Linux container),
    `speechSynthesis` still exists but errors immediately, which the reader handles by silently
    dropping back to "not listening" rather than hanging or crashing.
  - **Surlignages permanents avec notes** (🖍, real `Highlight` Prisma model — `profileId`,
    `ebookId`, `page`, `text`, optional `note`): selecting text now offers "🖍 Surligner" alongside
    the existing copy/share pill, saving the exact selected substring via
    `createHighlight()`. Saved highlights render as a yellow mark wherever their text is found on
    that page (via the same `renderTextWithMarks()` pass used for TTS), persist across
    reloads/devices (unlike the localStorage-only bookmarks), and get their own "Surlignages" tab
    in the 📑 panel alongside Chapitres/Signets — each entry can jump to its page, get a short
    note attached (`updateHighlightNote()`), or be deleted (`deleteHighlight()`). This is the
    real per-profile model previously deferred; bookmarks stayed on localStorage since they don't
    need the same cross-device guarantee.
  - **Deliberately not built in this pass** (would need real new assets, external services, or
    schema work beyond what this reader pass justifies): illustrations/diagrams embedded every
    few pages (needs real per-book image assets — only a front/back cover exists per book today,
    same constraint as "Cover art" above); a species/quick-facts info box
    (taille/poids/habitat/etc.) — would need new structured per-book fields that don't exist and
    wouldn't apply to most of the catalog (fitness/mindset titles, not just the animal ones);
    instant word definitions/translation (needs a real dictionary/translation API, none
    configured — see the Stripe-key pattern for how this app handles "not configured yet"); a
    reading-badges/achievements system beyond the streak and goal tracking that already exists on
    `/p/[id]/compte`; offline download and multi-device sync (see "Downloads" / offline reading
    above — unchanged, still intentionally not implemented).
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
  session server-side (defense in depth beyond the proxy). `EbookForm` exposes every field an
  admin realistically needs to fill by hand — `content` (the full book text — use
  `"Chapitre N — Title"` lines so `src/lib/chapters.ts` picks up chapters), `publishedYear`,
  `audience` (`"adults"`/`"kids"`), the cover image URLs, price, etc. — so a real book with
  working chapters/reader access can be added entirely through `/admin/ebooks/new` without
  touching `prisma/seed.ts`. `coverEmoji`, `coverTheme`, and `author` are still real `EBook`
  columns (the first two remain the fallback/reader-background behavior described under "Cover
  art" and "Real front/back cover images"), but the form no longer surfaces them as inputs — once
  every book gets a real cover image, hand-picking an emoji and gradient theme per book was just
  friction, and `author` wasn't something the project owner was filling in anyway. They're
  submitted as hidden fields instead, preserving whatever value a book already has on edit
  (`"📘"`/`"dark"`/`""` for a new book) rather than exposing a picker. The `Admin` account itself has
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

### Curated catalogs
- `Catalog` — an admin-defined named shelf (e.g. "Coup de cœur", "Best-sellers"), many-to-many
  with `EBook` via Prisma's implicit join table. Managed at `/admin/catalogs` (linked from
  `AdminNav`): create, rename, and delete catalogs there; which books belong to a catalog is set
  from that book's own edit form instead (a checkbox list — a book can be in any number of
  catalogs, or none). `createCatalog`/`renameCatalog`/`deleteCatalog` in `src/lib/actions.ts`
  follow the same admin-session-gated pattern as the rest of that file.
- Any catalog with at least one **adult** book renders as its own `BookRow` — on the homepage
  (`src/app/page.tsx`, right after the feature-highlight row, before the plain "Nos eBooks
  populaires" grid), on the adult `/p/[id]` dashboard, and on `/bibliotheque` — ordered by the
  catalog's `createdAt`. This is deliberately separate from `category` (the existing single
  free-text field every book has, which the homepage grid's implicit grouping is based on):
  `category` is one value per book describing what it's about, while `Catalog` is admin-curated
  editorial placement — a book can be in several catalogs (or none) independent of its category.
  Kids audience books are excluded from catalog rows since catalogs only ever render on
  adult-facing surfaces.
- `Catalog.description` — an optional short tagline (e.g. "Construis un mental que rien ne peut
  briser.") set from the same `/admin/catalogs` create/rename form, rendered as a small gold
  (`.lumina-gold-text`) italic line under the row's label via `BookRow`'s optional `tagline`
  prop. One real catalog ships this way — **"Collection Guerrier"** ("Construis un mental que
  rien ne peut briser.", containing "Le Code du Guerrier") — a genuine, curated grouping of a
  real catalog book, not a themed re-skin of the whole site. It's upserted (idempotently, safe to
  re-run) by `importRealBooks()` in `src/lib/actions.ts` right after it imports the real book
  rows, so re-clicking "Importer mes livres" on `/admin` is what syncs it to a deployed
  environment the same way it syncs everything else `importRealBooks()` seeds. A second catalog,
  **"Collection Sparte"**, shipped the same way (containing the "Sparte" series tomes) but was
  later removed: Prisma's implicit m2m `connect` only ever adds books to a catalog, never removes
  ones that no longer belong, so a book unrelated to the Sparte series that got connected to it
  during earlier iterations stayed stuck there forever across every re-import, and the catalog
  never actually reflected the current 5 real tomes. Rather than special-case a cleanup for that
  one catalog's data, `importRealBooks()` now deletes the "Collection Sparte" row outright on
  every run — its Sparte tomes just show up as regular, uncollected catalog books instead.

### Series ("Épisodes")
- `EBook.seriesName`/`seriesOrder` (both optional) group standalone `EBook` rows into a saga —
  e.g. the 5 "Sparte" tomes each have `seriesName: "Sparte"` and `seriesOrder` 1–5. Set from the
  book's own admin edit form (two plain fields, "Série" + "Numéro de tome"); there is no separate
  `Series` table, a shared `seriesName` string is what groups books together, so renaming it
  consistently across every tome (by hand, in each book's edit form) is how you'd rename a saga.
- `src/app/ebooks/[slug]/page.tsx` looks up every other `EBook` sharing the same `seriesName`
  (ordered by `seriesOrder`) and, when the list is non-empty, passes it to `BookDetailTabs` as an
  `episodes` prop — an extra "Épisodes" tab (shown first, selected by default) alongside
  `Chapitres`/`Livres similaires`, modeled on a streaming-service episode list: each tome's real
  cover, a "Tome N" label, "· Vous êtes ici" on the one currently being viewed, a per-tome
  progress bar for the active profile (from `ReadingProgress`, resolved the same way as the
  main page's own progress bar), and a checkmark once that tome is `completed`. A standalone
  book (no `seriesName`) never shows this tab at all — `chapters`/`similar` stays the default.
  Clicking an episode navigates to that tome's own `/ebooks/[slug]` page (same buy/read CTA logic
  as any other book) rather than jumping straight into the reader, since access/progress is
  still per-book, not shared across a series.
- `src/lib/series.ts` — `dedupeSeries()` collapses a list of books down to one representative per
  `seriesName` (the lowest `seriesOrder`, i.e. "tome 1") so browse rows read like a single show
  tile instead of listing every tome separately — applied to the `/p/[id]` "Parcourir par
  catégorie" rows, the homepage's custom `Catalog` rows and daily-picked grid, and the
  "Livres similaires" row on `/ebooks/[slug]` (which additionally excludes the current book's own
  series outright, since those tomes are already surfaced in the "Épisodes" tab). Deliberately
  **not** applied to "Continuer la lecture" / "Ma bibliothèque" / "Mes favoris" / "Historique",
  where the specific tome the profile favorited, read, or is mid-way through must stay visible.

### Data model (`prisma/schema.prisma`)
`EBook` (has a `content` text field used by the reader, `author`/`publishedYear` fields for the
detail page's metadata, an `audience` field — `"adults"`/`"kids"` — and optional
`seriesName`/`seriesOrder` for the "Épisodes" tab, see "Series" above), `Order` (one-time
purchases, optional `customerId`), `Admin`,
`Customer` (just login/billing: email, passwordHash, name, `Order[]`, `Subscription?`,
`Profile[]`), `Subscription` (one-to-one with `Customer`, account-wide), `Profile` (belongs to a
`Customer`; `name`/`avatarEmoji`/`color`/`type` (`"adult"`/`"kids"`), optional `pinHash`,
`dailyLimitMinutes`/`minutesReadToday`/`limitResetDate` (kids reading-time limit),
`reminderTime`, `monthlyBookGoal`, `totalMinutesRead`, `readingStreak`/`lastReadDate`),
`Favorite` and `ReadingProgress` (profile-scoped join tables, unique on `[profileId, ebookId]`;
`ReadingProgress` also carries `completed`, `lastPageAt`, `avgSecondsPerPage` — the same
pace-tracking fields used to flag "very fast"/"posé" reading pace apply to any profile now, not
just kids), `Collection`/`CollectionItem` (profile-scoped book shelves, unique on
`[collectionId, ebookId]`), `Highlight` (profile-scoped, `page`/`text`/optional `note` — the
reader's persistent surlignages, see Reader above; deliberately not unique-constrained on
`[profileId, ebookId, page]` since a profile can have several distinct highlights on one page),
and `Catalog` (admin-curated shelves, many-to-many with `EBook` — see "Curated catalogs" above;
not to be confused with the profile-scoped `Collection` above).

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
- A later batch added 30 more real books this same way (`src/lib/realBooks.ts`), including two
  new partial series — **"Le Pouvoir en Soi"** (Développement personnel; tomes 1, 2, 4, 5, 6
  supplied — tome 3 was never provided) and **"Mental du Combattant"** (Psychologie & Sport de
  combat; tomes 1–6 and 8 supplied — tome 7 was never provided) — plus 18 standalone titles
  (nature/biologie, philosophie, biographies, développement personnel). **Known issue inherited
  from the source export, not introduced by the extraction:** the front/back covers for every
  "Le Pouvoir en Soi" tome and for "Mental du Combattant" tomes 2–8 are duplicated/mismatched in
  the HTML exports supplied (e.g. all five "Le Pouvoir en Soi" tomes shipped with the identical
  "Devenir la Femme" cover instead of a per-tome one) — published as-is at the project owner's
  explicit instruction rather than blocking on it. If corrected per-tome cover art is supplied
  later, re-extract just the `coverImageUrl`/`backCoverImageUrl` pair for the affected slugs the
  same way (decode the base64 `img-front`/`img-back` payloads from the new HTML export, save over
  the existing `public/covers/{slug}-{front,back}.jpg`) — the chapter text for those books is
  already correct and doesn't need to be touched again.
- A third batch added 26 more (bringing `REAL_BOOKS` to 101): historical portraits (Alexandre,
  Hannibal, Cyrus, Saladin, Baybars, Baudouin IV, Mansa Moussa), Muslim scholars (Ibn al-Haytham,
  Ibn al-Nafis, Al-Biruni), animals/nature (Le Grand Blanc, Le Dos Argenté, Sans Pitié, Il n'est
  pas blanc, Le rose vient de ce qu'il mange), anatomy (L'Oreille, Quatre Tuyaux, C5 à T1, Le Nerf
  Pincé), water (La Molécule Improbable, La Soif du Monde), and practical titles (Moins de 100 €,
  Partir de Zéro, Plus Vite, Reprendre la Main, L'Acquittement). Two things worth knowing for the
  next batch:
  - **The exports carry their own metadata.** Each HTML has a JSON config block with `titre`,
    `sousTitre`, `categorie`, `theme`, `resume` and `serie`/`tome`. Read those instead of guessing
    a category or writing a description — that's where these 26 books' categories come from, and
    why none of them is in a series (every export shipped `"serie": ""`).
  - **Two export layouts exist.** The usual one wraps each chapter in
    `<section class="chapter">` with `<h2>Chapitre N</h2><h3>Titre</h3>`; one older export
    (Ibn al-Haytham) instead uses `<section class="page">` + `<div class="page-inner">` with
    `<h1>PAGE N — TITRE</h1>` and names its covers `frontImage`/`backImage` rather than
    `img-front`/`img-back`. An extractor has to handle both, and must drop the chapter's own
    `<h3>` from the body so the title isn't repeated as an all-caps sub-heading under the
    `Chapitre N — Titre` marker.

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
