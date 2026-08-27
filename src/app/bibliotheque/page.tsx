import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LibraryCatalogClient, {
  type LibraryBook,
  type LibrarySection,
} from "@/components/LibraryCatalogClient";
import { getCurrentCustomer } from "@/lib/customerSession";
import { getActiveProfile } from "@/lib/activeProfile";
import { hasAccessToEbook } from "@/lib/access";
import { dedupeSeries } from "@/lib/series";
import { getBestsellerIds, getSurpriseBook } from "@/lib/recommendations";
import { countWords } from "@/lib/paginate";

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
  const categories = Array.from(new Set(ebooks.map((e) => e.category)));

  const categoriesMap = new Map<string, LibraryBook[]>();
  for (const book of allBooks) {
    const list = categoriesMap.get(book.category) ?? [];
    list.push(book);
    categoriesMap.set(book.category, list);
  }

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
    ...categories.map((category) => ({
      key: category,
      label: category,
      books: categoriesMap.get(category) ?? [],
    })),
  ];

  const featured =
    ebooks.find((e) => e.featured) ??
    [...ebooks].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0] ??
    null;
  const featuredHasAccess =
    featured && customer ? await hasAccessToEbook(customer.id, featured.id) : false;
  const featuredHref = featured
    ? featuredHasAccess && activeProfile
      ? `/p/${activeProfile.id}/read/${featured.slug}`
      : `/ebooks/${featured.slug}`
    : null;
  const featuredMinutes = featured
    ? Math.max(1, Math.round(countWords(featured.content) / 200))
    : null;

  return (
    <>
      <Header />

      <div className="lumina-shell px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-3 text-[2rem] font-extrabold tracking-tight md:text-[2.6rem]">
            Bibliothèque LUMINA
          </h1>
          <p className="mb-2 text-[color:var(--color-lumina-text-muted)]">
            Découvrez notre collection de livres numériques.
          </p>
          <p className="mb-10 text-sm font-bold text-[#a78bfa]">
            {allBooks.length} livre{allBooks.length > 1 ? "s" : ""} disponible
            {allBooks.length > 1 ? "s" : ""}
          </p>

          {featured && featuredHref && (
            <section className="mb-16">
              <h2 className="mb-1 text-lg font-extrabold">À la une</h2>
              <p className="mb-5 text-sm text-[color:var(--color-lumina-text-muted)]">
                La lecture que nous vous recommandons cette semaine.
              </p>
              <div
                className={`${featured.coverImageUrl ? "" : `cover-theme-${featured.coverTheme}`} relative flex h-[280px] flex-col justify-end overflow-hidden rounded-[26px] p-8 shadow-[0_25px_70px_rgba(0,0,0,0.4)] sm:h-[320px]`}
              >
                {featured.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={featured.coverImageUrl}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute right-8 top-8 text-8xl opacity-80">{featured.coverEmoji}</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                <div className="relative z-10 max-w-lg">
                  <h3 className="mb-2 text-2xl font-extrabold leading-tight sm:text-3xl">
                    {featured.title}
                  </h3>
                  <p className="mb-4 line-clamp-2 text-sm text-white/80">{featured.subtitle}</p>
                  <p className="mb-5 text-sm font-semibold text-white/70">
                    {`${featuredMinutes} min · ${featured.price} €`}
                  </p>
                  <Link
                    href={featuredHref}
                    className="inline-block rounded-xl bg-white px-6 py-3 text-sm font-bold text-navy shadow-[0_10px_28px_rgba(0,0,0,0.3)] transition hover:-translate-y-0.5"
                  >
                    {featuredHasAccess ? "Lire →" : "Découvrir →"}
                  </Link>
                </div>
              </div>
            </section>
          )}

          <LibraryCatalogClient sections={sections} allBooks={allBooks} categories={categories} />

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

      <Footer />
    </>
  );
}
