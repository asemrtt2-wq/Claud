import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customerSession";
import { paginateContent } from "@/lib/paginate";
import { isProfileUnlocked } from "@/lib/profileUnlock";
import { getRecommendations, getBestsellerIds } from "@/lib/recommendations";
import { getRatingSummaries } from "@/lib/reviews";
import AppBottomNav from "@/components/AppBottomNav";
import BookRow from "@/components/BookRow";
import ProfileSwitcher from "@/components/ProfileSwitcher";
import CollectionsManager from "@/components/CollectionsManager";
import BedtimeReminder from "@/components/BedtimeReminder";
import PinGate from "@/components/PinGate";
import FavoriteButton from "@/components/FavoriteButton";
import ContinueReadingRow from "@/components/ContinueReadingRow";
import BookCoverShelf from "@/components/BookCoverShelf";
import DashboardSearch from "@/components/DashboardSearch";
import LogoMark from "@/components/Logo";
import { profileGradient } from "@/lib/profileColors";
import { collapseSeries, dedupeSeries } from "@/lib/series";
import { isNewBook } from "@/lib/badges";
import { chunk } from "@/lib/chunk";

function withBadges<T extends { id: string; createdAt: Date }>(
  books: T[],
  bestsellerIds: Set<string>,
  ratings: Map<string, { average: number; count: number }>
): (T & { isNew: boolean; isBestseller: boolean; rating: number | null; ratingCount: number })[] {
  return books.map((b) => ({
    ...b,
    isNew: isNewBook(b.createdAt),
    isBestseller: bestsellerIds.has(b.id),
    rating: ratings.get(b.id)?.average ?? null,
    ratingCount: ratings.get(b.id)?.count ?? 0,
  }));
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/login");

  const profile = await prisma.profile.findUnique({ where: { id } });
  if (!profile || profile.customerId !== customer.id) redirect("/profiles");

  if (profile.pinHash) {
    const unlocked = await isProfileUnlocked(id);
    if (!unlocked) {
      return (
        <PinGate
          profileId={id}
          name={profile.name}
          avatarEmoji={profile.avatarEmoji}
          color={profile.color}
        />
      );
    }
  }

  const allProfiles = await prisma.profile.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: "asc" },
  });
  const switcherProfiles = allProfiles.map((p) => ({
    id: p.id,
    name: p.name,
    avatarEmoji: p.avatarEmoji,
    color: p.color,
    hasPin: Boolean(p.pinHash),
  }));

  const todayStr = new Date().toISOString().slice(0, 10);

  if (profile.type === "kids") {
    const [kidsBooks, progress] = await Promise.all([
      prisma.eBook.findMany({ where: { audience: "kids" }, orderBy: { createdAt: "asc" } }),
      prisma.readingProgress.findMany({
        where: { profileId: id },
        include: { ebook: true },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    const progressByEbookId = new Map(progress.map((p) => [p.ebookId, p]));
    const continueReading = progress.find((p) => !p.completed) ?? null;
    const hasReadToday = progress.some(
      (p) => p.updatedAt.toISOString().slice(0, 10) === todayStr
    );

    return (
      <div className="lumia-shell pb-16">
        <header className="flex items-center justify-between px-6 py-6 sm:px-10">
          <div className="flex items-center gap-3">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-full text-2xl"
              style={{ background: profileGradient(profile.color) }}
            >
              {profile.avatarEmoji}
            </span>
            <h1 className="text-xl font-extrabold tracking-tight">Salut, {profile.name} !</h1>
          </div>
          <ProfileSwitcher profiles={switcherProfiles} activeProfileId={id} />
        </header>

        <main className="mx-auto max-w-5xl px-6 sm:px-10">
          <BedtimeReminder
            reminderTime={profile.reminderTime}
            hasReadToday={hasReadToday}
            name={profile.name}
          />

          {continueReading && (
            <Link
              href={`/p/${id}/read/${continueReading.ebook.slug}`}
              className={`lumia-card ${continueReading.ebook.coverImageUrl ? "" : `cover-theme-${continueReading.ebook.coverTheme}`} relative mb-10 flex h-52 flex-col justify-end overflow-hidden rounded-[26px] p-7 transition hover:-translate-y-1`}
            >
              {continueReading.ebook.coverImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={continueReading.ebook.coverImageUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />
              <div className="relative z-10">
                <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                  Continue ton histoire
                </span>
                <h2 className="mb-3 text-2xl font-extrabold">{continueReading.ebook.title}</h2>
                <span className="inline-block rounded-2xl bg-white px-5 py-2.5 text-sm font-bold text-navy">
                  Reprendre ▶
                </span>
              </div>
            </Link>
          )}

          <h2 className="mb-5 text-lg font-extrabold">Toutes les histoires</h2>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
            {kidsBooks.map((book) => {
              const totalPages = paginateContent(book.content).length;
              const p = progressByEbookId.get(book.id);
              const percent = p ? Math.round(((p.page + 1) / totalPages) * 100) : 0;
              return (
                <Link key={book.id} href={`/p/${id}/read/${book.slug}`} className="group">
                  <div
                    className={`${book.coverImageUrl ? "" : `cover-theme-${book.coverTheme}`} mascot-idle relative mb-3 flex h-44 items-center justify-center overflow-hidden rounded-3xl text-5xl shadow-lg transition group-hover:-translate-y-1.5`}
                  >
                    {book.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={book.coverImageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      book.coverEmoji
                    )}
                  </div>
                  <p className="mb-1 text-sm font-bold">{book.title}</p>
                  {p && (
                    <div className="h-1.5 w-full overflow-hidden rounded-full lumia-progress-track">
                      <div className="h-full lumia-progress-fill" style={{ width: `${percent}%` }} />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  // Adult profile dashboard
  const [orders, favorites, progressEntries, collections, catalogs, bestsellerIds, allAdultBooks] =
    await Promise.all([
      prisma.order.findMany({
        where: { customerId: customer.id, status: "paid" },
        include: { ebook: true },
      }),
      prisma.favorite.findMany({
        where: { profileId: id },
        include: { ebook: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.readingProgress.findMany({
        where: { profileId: id },
        include: { ebook: true },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.collection.findMany({
        where: { profileId: id },
        include: { items: { include: { ebook: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.catalog.findMany({
        include: { ebooks: { where: { audience: "adults" } } },
        orderBy: { createdAt: "asc" },
      }),
      getBestsellerIds(),
      prisma.eBook.findMany({ where: { audience: "adults" }, orderBy: { category: "asc" } }),
    ]);
  const ratings = await getRatingSummaries(allAdultBooks.map((b) => b.id));
  const catalogsWithBooks = catalogs
    .filter((c) => c.ebooks.length > 0)
    .map((c) => ({ ...c, ebooks: withBadges(collapseSeries(c.ebooks), bestsellerIds, ratings) }));

  const searchBooks = allAdultBooks.map((b) => ({
    id: b.id,
    slug: b.slug,
    title: b.title,
    category: b.category,
    author: b.author,
    coverEmoji: b.coverEmoji,
    coverTheme: b.coverTheme,
    coverImageUrl: b.coverImageUrl,
  }));

  const progressByEbookId = new Map(progressEntries.map((p) => [p.ebookId, p]));
  const libraryMap = new Map<
    string,
    { ebook: (typeof orders)[number]["ebook"]; page: number; totalPages: number }
  >();

  for (const entry of [...orders, ...favorites, ...progressEntries]) {
    const ebook = entry.ebook;
    if (!libraryMap.has(ebook.id)) {
      const progress = progressByEbookId.get(ebook.id);
      libraryMap.set(ebook.id, {
        ebook,
        page: progress?.page ?? 0,
        totalPages: paginateContent(ebook.content).length,
      });
    }
  }

  const library = Array.from(libraryMap.values());
  const continueReading = progressEntries[0] ? libraryMap.get(progressEntries[0].ebookId) : null;
  const inProgressBooks = progressEntries
    .filter((p) => !p.completed)
    .map((p) => {
      const totalPages = paginateContent(p.ebook.content).length;
      return { ebook: p.ebook, percent: Math.round(((p.page + 1) / totalPages) * 100) };
    });
  const recommendations = await getRecommendations(id, Array.from(libraryMap.keys()));

  const billboardBook = continueReading?.ebook ?? recommendations.newest[0] ?? library[0]?.ebook ?? null;
  const billboardHref = continueReading
    ? `/p/${id}/read/${continueReading.ebook.slug}`
    : billboardBook
      ? `/ebooks/${billboardBook.slug}`
      : null;
  const billboardPercent = continueReading
    ? Math.round(((continueReading.page + 1) / continueReading.totalPages) * 100)
    : null;
  const billboardIsFavorited = billboardBook
    ? favorites.some((f) => f.ebookId === billboardBook.id)
    : false;

  const hasReadToday = progressEntries.some(
    (p) => p.updatedAt.toISOString().slice(0, 10) === todayStr
  );

  /* "Tous les livres" shows one tile per series — tome 2, 3, 4 are reachable from the
     series' own "Épisodes" tab, so listing each of them here just buried the standalone
     titles under repeated covers. */
  const catalogueBooks = collapseSeries(allAdultBooks).map((b) => ({
    ...b,
    rating: ratings.get(b.id)?.average ?? null,
    ratingCount: ratings.get(b.id)?.count ?? 0,
  }));

  return (
    <div className="ibook-shell pb-24">
      {/* Sticky so the search, the section links and the profile switcher stay reachable
          down a long dashboard instead of scrolling away with the greeting. */}
      <header
        id="accueil"
        className="sticky top-0 z-40 mb-2 border-b border-black/[0.06] bg-[#f7f6fb]/85 backdrop-blur-xl"
      >
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-4 sm:px-10">
          {/* Inside the app the logo is "home" for the app, not for the marketing site. */}
          <Link
            href={`/p/${id}`}
            className="-my-1 flex shrink-0 items-center gap-2.5 py-1 text-lg font-extrabold tracking-tight text-[#1d1d1f]"
          >
            <LogoMark className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] text-white shadow-[0_6px_16px_rgba(124,92,255,0.35)]" />
            LUMIA
          </Link>
          <nav className="hidden flex-1 items-center gap-6 lg:flex">
            {[
              { href: "#recommandations", label: "Pour toi" },
              { href: "#bibliotheque", label: "Ma bibliothèque" },
              { href: "#favoris", label: "Favoris" },
              { href: "/bibliotheque", label: "Tout le catalogue" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-semibold text-[#6e6e73] transition hover:text-[#1d1d1f]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <DashboardSearch books={searchBooks} />
            <ProfileSwitcher profiles={switcherProfiles} activeProfileId={id} light />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pt-6 sm:px-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#1d1d1f]">
              {`Bonsoir, ${profile.name} 👋`}
            </h1>
            <p className="mt-1 text-sm text-[#6e6e73]">Prêt pour une nouvelle aventure ?</p>
          </div>
          {/* Real per-profile numbers, the same ones /p/[id]/compte shows in full. */}
          <div className="flex gap-2">
            {[
              { value: library.length, label: "livres" },
              { value: inProgressBooks.length, label: "en cours" },
              { value: profile.readingStreak, label: "jours" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-black/[0.06] bg-white/70 px-4 py-2 text-center backdrop-blur-sm"
              >
                <p className="text-lg font-extrabold leading-tight text-[#1d1d1f]">{stat.value}</p>
                <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-[#6e6e73]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <BedtimeReminder
          reminderTime={profile.reminderTime}
          hasReadToday={hasReadToday}
          name={profile.name}
          light
        />

        {billboardBook && billboardHref && (
          /* The cover fills the band as a blurred backdrop and a second, un-cropped copy
             stands beside the text. The old version stretched one `object-cover` copy edge
             to edge with only a bottom scrim, so a bright cover swallowed the title whole —
             which is exactly what it did to "Le Code du Guerrier" and "IBN AL-NAFIS". */
          <div
            className={`${billboardBook.coverImageUrl ? "bg-[#12101f]" : `cover-theme-${billboardBook.coverTheme}`} group relative mb-12 overflow-hidden rounded-[26px] shadow-[0_25px_70px_rgba(0,0,0,0.35)] transition hover:-translate-y-1`}
          >
            {billboardBook.coverImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={billboardBook.coverImageUrl}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full scale-110 object-cover object-top opacity-95 blur-2xl transition-transform duration-700 group-hover:scale-125"
              />
            )}
            {/* Two scrims: a light one over the whole band so the art still reads, and a
                heavier left-to-right one only where the copy sits. */}
            <div className="absolute inset-0 bg-black/25" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent" />

            <div className="relative z-10 flex items-center gap-6 p-7 sm:gap-10 sm:p-10">
              <div className="min-w-0 flex-1 text-white">
                <span className="lumia-gold-text mb-2 inline-block text-xs font-bold uppercase tracking-wider">
                  {continueReading ? "Continuer la lecture" : "✨ Recommandé pour toi"}
                </span>
                <h2 className="mb-2 text-2xl font-extrabold leading-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] sm:text-4xl">
                  {billboardBook.title}
                </h2>
                <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-white/60">
                  {[
                    billboardBook.category,
                    billboardPercent !== null ? `${billboardPercent}% terminé` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {!continueReading && billboardBook.subtitle && (
                  <p className="mb-4 line-clamp-2 max-w-lg text-sm text-white/80">
                    {billboardBook.subtitle}
                  </p>
                )}
                {billboardPercent !== null && (
                  <div className="mb-5 h-2 w-56 max-w-full overflow-hidden rounded-full bg-white/25">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#7c5cff] to-[#a78bfa]"
                      style={{ width: `${billboardPercent}%` }}
                    />
                  </div>
                )}
                {/* The favourite button used to float at the top-right corner, where on a
                    phone it landed straight on top of the "Continuer la lecture" label. It
                    lives in the action row now, so it can never collide with the copy. */}
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={billboardHref}
                    className="rounded-xl bg-white px-6 py-3 text-base font-bold text-[#1d1d1f] shadow-[0_10px_28px_rgba(0,0,0,0.3)] transition hover:-translate-y-0.5"
                  >
                    {continueReading ? "▶ Reprendre" : "Découvrir →"}
                  </Link>
                  <Link
                    href={`/ebooks/${billboardBook.slug}`}
                    className="rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-base font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
                  >
                    Plus d&apos;infos
                  </Link>
                  <FavoriteButton
                    ebookId={billboardBook.id}
                    slug={billboardBook.slug}
                    initialFavorited={billboardIsFavorited}
                    profileId={id}
                  />
                </div>
              </div>

              {billboardBook.coverImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={billboardBook.coverImageUrl}
                  alt={`Couverture de ${billboardBook.title}`}
                  className="w-24 shrink-0 self-start rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.55)] transition duration-500 group-hover:-translate-y-1 sm:w-40 sm:self-auto lg:w-48"
                />
              )}
              {!billboardBook.coverImageUrl && (
                <span className="text-5xl sm:text-8xl">{billboardBook.coverEmoji}</span>
              )}
            </div>
          </div>
        )}

        {inProgressBooks.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-5 text-lg font-extrabold">📖 Continuer ma lecture</h2>
            <ContinueReadingRow profileId={id} books={inProgressBooks} />
          </section>
        )}

        {catalogsWithBooks.length > 0 && (
          <section className="mb-12">
            <div className="flex flex-col gap-8">
              {catalogsWithBooks.map((cat) => (
                <BookRow key={cat.id} label={cat.name} tagline={cat.description} books={cat.ebooks} light />
              ))}
            </div>
          </section>
        )}

        {(recommendations.byCategory.length > 0 ||
          recommendations.byAuthor.length > 0 ||
          recommendations.newest.length > 0 ||
          recommendations.popular.length > 0) && (
          <section id="recommandations" className="mb-12 scroll-mt-24">
            <h2 className="mb-5 text-lg font-extrabold">Recommandé pour toi</h2>
            <div className="flex flex-col gap-8">
              {[
                {
                  label: recommendations.topCategory
                    ? `Parce que tu aimes ${recommendations.topCategory}`
                    : "",
                  books: recommendations.byCategory,
                },
                {
                  label: recommendations.topAuthor ? `Auteurs favoris : ${recommendations.topAuthor}` : "",
                  books: recommendations.byAuthor,
                },
                { label: "Nouveautés", books: recommendations.newest },
                { label: "Les plus populaires", books: recommendations.popular },
              ]
                .filter((row) => row.books.length > 0)
                .map((row) => (
                  <BookRow key={row.label} label={row.label} books={row.books} light />
                ))}
            </div>
          </section>
        )}

        <section id="bibliotheque" className="mb-12 scroll-mt-24">
          <h2 className="mb-5 text-lg font-extrabold">Ma bibliothèque</h2>
          {library.length === 0 ? (
            <p className="text-sm text-[#6e6e73]">
              Ta bibliothèque est vide.{" "}
              <Link href="/bibliotheque" className="font-semibold text-[#5b3df0] hover:underline">
                Découvrir des eBooks
              </Link>
            </p>
          ) : (
            <BookRow
              label=""
              books={library.map(({ ebook }) => ebook)}
              hrefBase={`/p/${id}/read`}
              light
              progressByEbookId={
                new Map(
                  library.map(({ ebook, page, totalPages }) => [
                    ebook.id,
                    Math.round(((page + 1) / totalPages) * 100),
                  ])
                )
              }
            />
          )}
        </section>

        <section id="favoris" className="mb-12 scroll-mt-24">
          <h2 className="mb-5 text-lg font-extrabold">Mes favoris</h2>
          {favorites.length === 0 ? (
            <p className="text-sm text-[#6e6e73]">Tu n&apos;as pas encore de favoris.</p>
          ) : (
            <BookRow label="" books={favorites.map((f) => f.ebook)} light />
          )}
        </section>

        <section id="collections" className="mb-12 scroll-mt-24">
          <h2 className="mb-5 text-lg font-extrabold">Mes collections</h2>
          <CollectionsManager profileId={id} collections={collections} />
        </section>

        {catalogueBooks.length > 0 && (
          <section id="catalogue" className="mb-12 scroll-mt-24">
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-extrabold">Tous les livres</h2>
              <Link href="/bibliotheque" className="-mx-2 rounded-lg px-2 py-2 text-sm font-bold text-[#5b3df0] hover:underline">
                Voir la bibliothèque →
              </Link>
            </div>
            <div className="flex flex-col gap-8">
              {chunk(catalogueBooks, 20).map((group, i) => (
                <BookCoverShelf key={i} books={group} light />
              ))}
            </div>
          </section>
        )}

      </main>

      <AppBottomNav profileId={id} />
    </div>
  );
}
