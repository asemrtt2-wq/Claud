import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customerSession";
import { hasAccessToEbook } from "@/lib/access";
import { getActiveProfile } from "@/lib/activeProfile";
import { paginateContent } from "@/lib/paginate";
import { getChapters } from "@/lib/chapters";
import { getRecommendations } from "@/lib/recommendations";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BuyButton from "@/components/BuyButton";
import FavoriteButton from "@/components/FavoriteButton";
import AddToCollectionButton from "@/components/AddToCollectionButton";
import ExpandableText from "@/components/ExpandableText";
import ShareButton from "@/components/ShareButton";
import BackButton from "@/components/BackButton";
import BookDetailTabs from "@/components/BookDetailTabs";

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

export default async function EBookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ebook = await prisma.eBook.findUnique({ where: { slug } });

  if (!ebook || ebook.audience === "kids") notFound();

  const customer = await getCurrentCustomer();
  const isLoggedIn = Boolean(customer);
  const activeProfile = customer ? await getActiveProfile(customer.id) : null;

  const [hasAccess, favorite, collections] = customer
    ? await Promise.all([
        hasAccessToEbook(customer.id, ebook.id),
        activeProfile
          ? prisma.favorite.findUnique({
              where: { profileId_ebookId: { profileId: activeProfile.id, ebookId: ebook.id } },
            })
          : Promise.resolve(null),
        activeProfile
          ? prisma.collection.findMany({
              where: { profileId: activeProfile.id },
              include: { items: { where: { ebookId: ebook.id } } },
              orderBy: { createdAt: "desc" },
            })
          : Promise.resolve([]),
      ])
    : [false, null, []];

  const progress =
    activeProfile && hasAccess
      ? await prisma.readingProgress.findUnique({
          where: { profileId_ebookId: { profileId: activeProfile.id, ebookId: ebook.id } },
        })
      : null;

  const [similarBooks, recommendations] = await Promise.all([
    prisma.eBook.findMany({
      where: { audience: "adults", category: ebook.category, id: { not: ebook.id } },
      take: 4,
    }),
    activeProfile ? getRecommendations(activeProfile.id, [ebook.id]) : null,
  ]);

  const collectionOptions = collections.map((c) => ({
    id: c.id,
    name: c.name,
    hasBook: c.items.length > 0,
  }));

  const discount = ebook.oldPrice
    ? Math.round(100 - (ebook.price / ebook.oldPrice) * 100)
    : null;

  const pages = paginateContent(ebook.content);
  const chapters = getChapters(ebook.content);
  const readHref = activeProfile ? `/p/${activeProfile.id}/read/${ebook.slug}` : null;

  const percent = progress ? Math.round(((progress.page + 1) / pages.length) * 100) : 0;
  const remainingPages = pages.length - (progress ? progress.page + 1 : 0);
  const secPerPage = progress?.avgSecondsPerPage ?? 90;
  const remainingMinutes = Math.max(1, Math.round((remainingPages * secPerPage) / 60));

  const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/ebooks/${ebook.slug}`;

  const recommendedRows = recommendations
    ? [
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
        { label: "Les plus populaires", books: recommendations.popular },
      ].filter((row) => row.books.length > 0)
    : [];

  return (
    <>
      <Header />
      <div className="lumina-shell">
        <div
          className={`cover-theme-${ebook.coverTheme} relative flex h-[38vh] min-h-[280px] flex-col justify-between p-6`}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0918] via-black/10 to-black/20" />
          <div className="relative z-10 flex items-center justify-between">
            <BackButton />
            <Link
              href={activeProfile ? `/p/${activeProfile.id}` : "/"}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-lg text-white backdrop-blur-sm transition hover:bg-black/60"
              aria-label="Fermer"
            >
              ✕
            </Link>
          </div>
          <div className="relative z-10 flex flex-1 items-center justify-center text-8xl">
            {ebook.coverEmoji}
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-6 pb-20 pt-8">
          <h1 className="mb-1 text-3xl font-extrabold tracking-tight text-white">
            {ebook.title}
          </h1>
          {ebook.author && (
            <p className="mb-2 text-lg font-semibold text-[#a78bfa]">{ebook.author}</p>
          )}
          <p className="mb-6 text-sm text-[color:var(--color-lumina-text-muted)]">
            {[
              ebook.publishedYear,
              `${pages.length} page${pages.length > 1 ? "s" : ""}`,
              ebook.category,
              "Français",
            ]
              .filter(Boolean)
              .join(" • ")}
          </p>

          {hasAccess ? (
            <div className="mb-6">
              <Link
                href={readHref ?? "/profiles"}
                className="block rounded-2xl bg-white px-7 py-3.5 text-center text-sm font-bold text-navy shadow-[0_12px_30px_rgba(255,255,255,0.15)] transition hover:-translate-y-0.5"
              >
                {progress && progress.page > 0
                  ? "▶ Reprendre la lecture"
                  : "📖 Commencer la lecture"}
              </Link>
              {progress && (
                <div className="mt-4">
                  <div className="mb-1.5 h-1.5 w-full overflow-hidden rounded-full lumina-progress-track">
                    <div className="h-full lumina-progress-fill" style={{ width: `${percent}%` }} />
                  </div>
                  <p className="text-xs text-[color:var(--color-lumina-text-muted)]">
                    {`Page ${progress.page + 1} sur ${pages.length} · ${percent}% terminé · Temps restant estimé : ${formatDuration(remainingMinutes)}`}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="lumina-card mb-6 max-w-sm rounded-[22px] p-6">
              <div className="mb-3 flex items-baseline gap-3">
                {ebook.oldPrice && (
                  <span className="text-lg font-bold text-white/40 line-through">
                    {ebook.oldPrice} €
                  </span>
                )}
                <span className="text-3xl font-extrabold tracking-tight text-white">
                  {ebook.price} €
                </span>
                {discount && (
                  <span className="rounded-full bg-gradient-to-br from-[#ff3b3b] to-[#c9192a] px-3 py-1 text-xs font-extrabold text-white">
                    -{discount}%
                  </span>
                )}
              </div>
              <BuyButton ebookId={ebook.id} isLoggedIn={isLoggedIn} />
              <Link
                href="/premium"
                className="mt-3 block rounded-2xl border border-white/15 px-7 py-3 text-center text-sm font-bold text-white transition hover:border-[#7c5cff]"
              >
                ✨ Lire gratuitement avec Premium
              </Link>
              <p className="mt-4 text-xs text-[color:var(--color-lumina-text-muted)]">
                🔒 Paiement sécurisé via Stripe — accès immédiat après paiement.
              </p>
            </div>
          )}

          <div className="mb-8">
            <ExpandableText text={ebook.description} />
          </div>

          <div className="mb-10 flex flex-wrap items-center gap-2">
            <FavoriteButton
              ebookId={ebook.id}
              slug={ebook.slug}
              initialFavorited={Boolean(favorite)}
              profileId={activeProfile?.id ?? null}
            />
            <AddToCollectionButton
              ebookId={ebook.id}
              collections={collectionOptions}
              profileId={activeProfile?.id ?? null}
            />
            <ShareButton title={ebook.title} url={shareUrl} />
          </div>

          <div className="mb-12">
            <BookDetailTabs chapters={chapters} readHref={readHref} similarBooks={similarBooks} />
          </div>

          {recommendedRows.length > 0 && (
            <section className="mb-12">
              <h2 className="mb-5 text-lg font-extrabold text-white">Recommandés pour vous</h2>
              <div className="flex flex-col gap-8">
                {recommendedRows.map((row) => (
                  <div key={row.label}>
                    <p className="mb-3 text-sm font-semibold text-[color:var(--color-lumina-text-muted)]">
                      {row.label}
                    </p>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      {row.books.map((book) => (
                        <Link key={book.id} href={`/ebooks/${book.slug}`} className="group">
                          <div
                            className={`cover-theme-${book.coverTheme} mb-2 flex h-28 items-center justify-center rounded-2xl text-2xl shadow-lg transition group-hover:-translate-y-1`}
                          >
                            {book.coverEmoji}
                          </div>
                          <p className="truncate text-xs font-bold text-white">{book.title}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="lumina-card rounded-[22px] p-6">
            <h2 className="mb-4 text-sm font-extrabold uppercase tracking-wider text-[color:var(--color-lumina-text-muted)]">
              Informations
            </h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
              {ebook.author && (
                <div>
                  <dt className="text-[color:var(--color-lumina-text-muted)]">Auteur</dt>
                  <dd className="font-semibold text-white">{ebook.author}</dd>
                </div>
              )}
              <div>
                <dt className="text-[color:var(--color-lumina-text-muted)]">Catégorie</dt>
                <dd className="font-semibold text-white">{ebook.category}</dd>
              </div>
              <div>
                <dt className="text-[color:var(--color-lumina-text-muted)]">Pages</dt>
                <dd className="font-semibold text-white">{pages.length}</dd>
              </div>
              <div>
                <dt className="text-[color:var(--color-lumina-text-muted)]">Langue</dt>
                <dd className="font-semibold text-white">Français</dd>
              </div>
              {ebook.publishedYear && (
                <div>
                  <dt className="text-[color:var(--color-lumina-text-muted)]">Année</dt>
                  <dd className="font-semibold text-white">{ebook.publishedYear}</dd>
                </div>
              )}
              <div>
                <dt className="text-[color:var(--color-lumina-text-muted)]">Ajouté au catalogue</dt>
                <dd className="font-semibold text-white">
                  {ebook.createdAt.toLocaleDateString("fr-FR", { year: "numeric", month: "long" })}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
