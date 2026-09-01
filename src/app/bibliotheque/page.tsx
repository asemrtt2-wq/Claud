import Link from "next/link";
import { prisma } from "@/lib/prisma";
import LightHeader from "@/components/LightHeader";
import LibraryCatalogClient, {
  type LibraryBook,
  type LibrarySection,
} from "@/components/LibraryCatalogClient";
import BookRow from "@/components/BookRow";
import ContinueReadingRow from "@/components/ContinueReadingRow";
import CollectionsManager from "@/components/CollectionsManager";
import { getCurrentCustomer } from "@/lib/customerSession";
import { getActiveProfile } from "@/lib/activeProfile";
import { dedupeSeries } from "@/lib/series";
import { getBestsellerIds, getSurpriseBook, getRecommendations } from "@/lib/recommendations";
import { countWords, paginateContent } from "@/lib/paginate";

export default async function BibliothequePage() {
  const customer = await getCurrentCustomer();
  const activeProfile = customer ? await getActiveProfile(customer.id) : null;

  const [ebooks, bestsellerIds, surpriseSlug, catalogs] = await Promise.all([
    prisma.eBook.findMany({ where: { audience: "adults" }, orderBy: { createdAt: "asc" } }),
    getBestsellerIds(),
    getSurpriseBook(activeProfile?.id ?? null),
    prisma.catalog.findMany({
      include: { ebooks: { where: { audience: "adults" } } },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  let accessibleIds = new Set<string>();
  if (customer) {
    const subscription = await prisma.subscription.findUnique({ where: { customerId: customer.id } });
    if (subscription?.status === "active") {
      accessibleIds = new Set(ebooks.map((e) => e.id));
    } else {
      const paidOrders = await prisma.order.findMany({
        where: { customerId: customer.id, status: "paid" },
        select: { ebookId: true },
      });
      accessibleIds = new Set(paidOrders.map((o) => o.ebookId));
    }
  }

  function toLibraryBook(b: (typeof ebooks)[number]): LibraryBook {
    const hasAccess = accessibleIds.has(b.id);
    return {
      id: b.id,
      slug: b.slug,
      title: b.title,
      subtitle: b.subtitle,
      author: b.author,
      category: b.category,
      coverEmoji: b.coverEmoji,
      coverTheme: b.coverTheme,
      coverImageUrl: b.coverImageUrl,
      backCoverImageUrl: b.backCoverImageUrl,
      price: b.price,
      oldPrice: b.oldPrice,
      readingMinutes: b.pdfUrl ? null : Math.max(1, Math.round(countWords(b.content) / 200)),
      isBestseller: bestsellerIds.has(b.id),
      hasAccess,
      href:
        hasAccess && activeProfile ? `/p/${activeProfile.id}/read/${b.slug}` : `/ebooks/${b.slug}`,
    };
  }

  const allBooks = dedupeSeries(ebooks).map(toLibraryBook);
  const popularBooks = allBooks.filter((b) => b.isBestseller);

  const sections: LibrarySection[] = [
    ...(popularBooks.length > 0
      ? [{ key: "popular", label: "🔥 Les plus populaires", books: popularBooks }]
      : []),
    ...catalogs
      .filter((c) => c.ebooks.length > 0)
      .map((c) => ({
        key: `catalog:${c.name}`,
        label: c.name,
        tagline: c.description,
        books: dedupeSeries(c.ebooks).map(toLibraryBook),
      })),
  ];

  // For a logged-in member with an active profile, the library also surfaces the
  // same personalized rows as the /p/[id] dashboard (recommendations, favorites,
  // collections, owned library, in-progress reads) so members see everything —
  // the full catalog and "their" books — in one place instead of two separate pages.
  let personalized: {
    continueReading: { ebook: (typeof ebooks)[number]; percent: number }[];
    recommendedRows: { label: string; books: LibraryBook[] }[];
    favorites: LibraryBook[];
    library: LibraryBook[];
    collections: {
      id: string;
      name: string;
      items: { ebook: { id: string; slug: string; title: string; coverEmoji: string; coverTheme: string } }[];
    }[];
  } | null = null;

  if (customer && activeProfile) {
    const [orders, favoriteRows, collectionRows, progressEntries] = await Promise.all([
      prisma.order.findMany({
        where: { customerId: customer.id, status: "paid" },
        include: { ebook: true },
      }),
      prisma.favorite.findMany({
        where: { profileId: activeProfile.id },
        include: { ebook: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.collection.findMany({
        where: { profileId: activeProfile.id },
        include: { items: { include: { ebook: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.readingProgress.findMany({
        where: { profileId: activeProfile.id },
        include: { ebook: true },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    // "Ma bibliothèque" mirrors the /p/[id] dashboard's own definition: books this
    // profile actually bought/favorited/read — not every book a Premium subscription
    // unlocks, which for a subscriber is the entire catalog and would otherwise
    // exclude every book from "Recommandé pour toi" (nothing left to recommend).
    const libraryMap = new Map<string, (typeof ebooks)[number]>();
    for (const entry of [...orders, ...favoriteRows, ...progressEntries]) {
      if (!libraryMap.has(entry.ebook.id)) libraryMap.set(entry.ebook.id, entry.ebook);
    }
    const libraryEbooks = Array.from(libraryMap.values());
    const recommendations = await getRecommendations(activeProfile.id, Array.from(libraryMap.keys()));

    const continueReading = progressEntries
      .filter((p) => !p.completed)
      .map((p) => {
        const totalPages = paginateContent(p.ebook.content).length;
        return { ebook: p.ebook, percent: Math.round(((p.page + 1) / totalPages) * 100) };
      });

    const recommendedRows = [
      {
        label: recommendations.topCategory ? `Parce que tu aimes ${recommendations.topCategory}` : "",
        books: dedupeSeries(recommendations.byCategory).map(toLibraryBook),
      },
      {
        label: recommendations.topAuthor ? `Auteurs favoris : ${recommendations.topAuthor}` : "",
        books: dedupeSeries(recommendations.byAuthor).map(toLibraryBook),
      },
      { label: "Nouveautés", books: dedupeSeries(recommendations.newest).map(toLibraryBook) },
      { label: "Les plus populaires", books: dedupeSeries(recommendations.popular).map(toLibraryBook) },
    ].filter((row) => row.books.length > 0);

    personalized = {
      continueReading,
      recommendedRows,
      favorites: favoriteRows.map((f) => toLibraryBook(f.ebook)),
      library: libraryEbooks.map(toLibraryBook),
      collections: collectionRows,
    };
  }

  return (
    <>
      <LightHeader />

      <div className="ibook-shell px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-1 text-[2rem] font-extrabold tracking-tight md:text-[2.6rem]">
            Bibliothèque
          </h1>
          <p className="mb-10 text-sm font-semibold text-[#6e6e73]">
            {/* The real catalog total — the rows below collapse a series to its tome 1,
                so allBooks.length would under-count what the admin panel lists. */}
            {ebooks.length} livre{ebooks.length > 1 ? "s" : ""} disponible
            {ebooks.length > 1 ? "s" : ""}
          </p>

          {personalized && (
            <div className="mb-14 flex flex-col gap-12">
              {personalized.continueReading.length > 0 && (
                <section>
                  <h2 className="mb-5 text-lg font-extrabold text-[#1d1d1f]">
                    📖 Continuer ma lecture
                  </h2>
                  <ContinueReadingRow
                    profileId={activeProfile!.id}
                    books={personalized.continueReading}
                  />
                </section>
              )}

              {personalized.recommendedRows.length > 0 && (
                <section>
                  <h2 className="mb-5 text-lg font-extrabold text-[#1d1d1f]">
                    ✨ Recommandé pour toi
                  </h2>
                  <div className="flex flex-col gap-8">
                    {personalized.recommendedRows.map((row) => (
                      <BookRow key={row.label} label={row.label} books={row.books} light />
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h2 className="mb-5 text-lg font-extrabold text-[#1d1d1f]">Mes favoris</h2>
                {personalized.favorites.length === 0 ? (
                  <p className="text-sm text-[#6e6e73]">Tu n&apos;as pas encore de favoris.</p>
                ) : (
                  <BookRow label="" books={personalized.favorites} light />
                )}
              </section>

              <section>
                <h2 className="mb-5 text-lg font-extrabold text-[#1d1d1f]">Mes collections</h2>
                <CollectionsManager profileId={activeProfile!.id} collections={personalized.collections} />
              </section>

              <section>
                <h2 className="mb-5 text-lg font-extrabold text-[#1d1d1f]">Ma bibliothèque</h2>
                {personalized.library.length === 0 ? (
                  <p className="text-sm text-[#6e6e73]">
                    Ta bibliothèque est vide.{" "}
                    <Link href="/premium" className="font-semibold text-[#5b3df0] hover:underline">
                      Découvrir Premium
                    </Link>
                  </p>
                ) : (
                  <BookRow label="" books={personalized.library} light />
                )}
              </section>
            </div>
          )}

          <LibraryCatalogClient sections={sections} allBooks={allBooks} light />

          {surpriseSlug && (
            <section className="mt-20 rounded-[26px] bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] p-10 text-center text-white shadow-strong">
              <h2 className="mb-2 text-xl font-extrabold tracking-tight sm:text-2xl">
                Vous ne savez pas quoi lire ?
              </h2>
              <p className="mb-6 text-sm text-[#e4defc]">
                Laissez Lumina vous recommander une lecture adaptée à vos intérêts.
              </p>
              <Link
                href={`/ebooks/${surpriseSlug}`}
                className="inline-block rounded-2xl bg-white px-7 py-3.5 text-sm font-bold text-navy shadow-[0_12px_28px_rgba(0,0,0,0.2)] transition hover:-translate-y-0.5"
              >
                Me recommander un livre
              </Link>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
