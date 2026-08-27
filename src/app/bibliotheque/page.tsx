import Link from "next/link";
import { prisma } from "@/lib/prisma";
import LightHeader from "@/components/LightHeader";
import LibraryCatalogClient, {
  type LibraryBook,
  type LibrarySection,
} from "@/components/LibraryCatalogClient";
import { getCurrentCustomer } from "@/lib/customerSession";
import { getActiveProfile } from "@/lib/activeProfile";
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

  return (
    <>
      <LightHeader />

      <div className="ibook-shell px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-1 text-[2rem] font-extrabold tracking-tight md:text-[2.6rem]">
            Bibliothèque
          </h1>
          <p className="mb-10 text-sm font-semibold text-[#6e6e73]">
            {allBooks.length} livre{allBooks.length > 1 ? "s" : ""} disponible
            {allBooks.length > 1 ? "s" : ""}
          </p>

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
