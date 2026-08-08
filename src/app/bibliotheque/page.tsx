import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LibraryBookRow from "@/components/LibraryBookRow";
import { getCurrentCustomer } from "@/lib/customerSession";
import { getActiveProfile } from "@/lib/activeProfile";
import { hasAccessToEbook } from "@/lib/access";
import { dedupeSeries } from "@/lib/series";
import { getBestsellerIds, getSurpriseBook } from "@/lib/recommendations";
import { isNewBook } from "@/lib/badges";
import { getCategoryStyle } from "@/lib/categoryStyle";
import { countWords } from "@/lib/paginate";

function categoryAnchor(category: string) {
  return category
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function withBadges<T extends { id: string; createdAt: Date }>(
  books: T[],
  bestsellerIds: Set<string>
): (T & { isNew: boolean; isBestseller: boolean })[] {
  return books.map((b) => ({ ...b, isNew: isNewBook(b.createdAt), isBestseller: bestsellerIds.has(b.id) }));
}

export default async function BibliothequePage() {
  const customer = await getCurrentCustomer();
  const activeProfile = customer ? await getActiveProfile(customer.id) : null;

  const [ebooks, bestsellerIds, surpriseSlug] = await Promise.all([
    prisma.eBook.findMany({ where: { audience: "adults" }, orderBy: { createdAt: "asc" } }),
    getBestsellerIds(),
    getSurpriseBook(activeProfile?.id ?? null),
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

  const categories = Array.from(new Set(ebooks.map((e) => e.category)));
  const categoriesMap = new Map<string, typeof ebooks>();
  for (const book of dedupeSeries(ebooks)) {
    const list = categoriesMap.get(book.category) ?? [];
    list.push(book);
    categoriesMap.set(book.category, list);
  }
  const categoryRows = categories.map((category) => ({
    category,
    books: withBadges(categoriesMap.get(category) ?? [], bestsellerIds).map((b) => {
      const hasAccess = accessibleIds.has(b.id);
      return {
        id: b.id,
        slug: b.slug,
        title: b.title,
        subtitle: b.subtitle,
        category: b.category,
        coverEmoji: b.coverEmoji,
        coverTheme: b.coverTheme,
        coverImageUrl: b.coverImageUrl,
        price: b.price,
        oldPrice: b.oldPrice,
        readingMinutes: b.pdfUrl ? null : Math.max(1, Math.round(countWords(b.content) / 200)),
        isNew: b.isNew,
        isBestseller: b.isBestseller,
        hasAccess,
        href:
          hasAccess && activeProfile ? `/p/${activeProfile.id}/read/${b.slug}` : `/ebooks/${b.slug}`,
      };
    }),
  }));

  const featured = ebooks.find((e) => e.featured) ?? [...ebooks].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0] ?? null;
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
            Bibliothèque
          </h1>
          <p className="mb-8 text-[color:var(--color-lumina-text-muted)]">
            Explorez nos iBooks et trouvez votre prochaine lecture.
          </p>

          <div className="mb-14 flex flex-wrap gap-2.5">
            <a
              href="#"
              className="rounded-full border border-[#7c5cff] bg-[#7c5cff]/15 px-4 py-2 text-sm font-bold text-white"
            >
              Tous
            </a>
            {categories.map((category) => (
              <a
                key={category}
                href={`#${categoryAnchor(category)}`}
                className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/80 transition hover:border-[#a78bfa] hover:text-white"
              >
                {category}
              </a>
            ))}
          </div>

          {featured && featuredHref && (
            <section className="mb-16">
              <h2 className="mb-1 text-lg font-extrabold">À la une</h2>
              <p className="mb-5 text-sm text-[color:var(--color-lumina-text-muted)]">
                Les lectures que nous vous recommandons cette semaine.
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

          <div className="flex flex-col gap-14">
            {categoryRows.map(({ category, books }) => {
              const style = getCategoryStyle(category, categories.indexOf(category));
              return (
                <section key={category} id={categoryAnchor(category)} className="scroll-mt-24">
                  <h2 className="mb-1 flex items-center gap-2 text-lg font-extrabold">
                    <span>{style.emoji}</span>
                    {category}
                  </h2>
                  <p className="mb-5 text-sm text-[color:var(--color-lumina-text-muted)]">
                    {books.length} iBook{books.length > 1 ? "s" : ""} dans cette catégorie.
                  </p>
                  <LibraryBookRow books={books} />
                </section>
              );
            })}
          </div>

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
