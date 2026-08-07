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
import BookRow from "@/components/BookRow";

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

  const [similarBooks, recommendations, seriesBooks] = await Promise.all([
    prisma.eBook.findMany({
      where: { audience: "adults", category: ebook.category, id: { not: ebook.id } },
      take: 4,
    }),
    activeProfile ? getRecommendations(activeProfile.id, [ebook.id]) : null,
    ebook.seriesName
      ? prisma.eBook.findMany({
          where: { seriesName: ebook.seriesName, audience: "adults" },
          orderBy: { seriesOrder: "asc" },
        })
      : Promise.resolve([]),
  ]);

  const seriesProgress = activeProfile
    ? await prisma.readingProgress.findMany({
        where: { profileId: activeProfile.id, ebookId: { in: seriesBooks.map((b) => b.id) } },
      })
    : [];
  const seriesProgressByEbookId = new Map(seriesProgress.map((p) => [p.ebookId, p]));

  const episodes = seriesBooks.map((book) => {
    const bookProgress = seriesProgressByEbookId.get(book.id);
    const bookPages = book.pdfUrl ? [] : paginateContent(book.content);
    return {
      id: book.id,
      slug: book.slug,
      title: book.title,
      seriesOrder: book.seriesOrder,
      coverEmoji: book.coverEmoji,
      coverTheme: book.coverTheme,
      coverImageUrl: book.coverImageUrl,
      isCurrent: book.id === ebook.id,
      progressPercent:
        bookProgress && bookPages.length > 0
          ? Math.round(((bookProgress.page + 1) / bookPages.length) * 100)
          : null,
      completed: bookProgress?.completed ?? false,
    };
  });

  const collectionOptions = collections.map((c) => ({
    id: c.id,
    name: c.name,
    hasBook: c.items.length > 0,
  }));

  const discount = ebook.oldPrice
    ? Math.round(100 - (ebook.price / ebook.oldPrice) * 100)
    : null;

  const isPdf = Boolean(ebook.pdfUrl);
  const pages = isPdf ? [] : paginateContent(ebook.content);
  const chapters = isPdf ? [] : getChapters(ebook.content);
  const readHref = activeProfile ? `/p/${activeProfile.id}/read/${ebook.slug}` : null;

  const percent =
    progress && !isPdf ? Math.round(((progress.page + 1) / pages.length) * 100) : 0;
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
          className={`${ebook.coverImageUrl ? "" : `cover-theme-${ebook.coverTheme}`} relative flex h-[38vh] min-h-[280px] flex-col justify-between overflow-hidden p-6`}
        >
          {ebook.coverImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={ebook.coverImageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
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
          {!ebook.coverImageUrl && (
            <div className="relative z-10 flex flex-1 items-center justify-center text-8xl">
              {ebook.coverEmoji}
            </div>
          )}
        </div>

        <div className="mx-auto max-w-3xl px-6 pb-20 pt-8">
          <h1 className="mb-1 text-3xl font-extrabold tracking-tight text-white">
            {ebook.title}
          </h1>
          {ebook.author && (
            <p className="mb-2 text-lg font-semibold text-[#a78bfa]">{ebook.author}</p>
          )}
          {ebook.seriesName && (
            <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#a78bfa]">
              {ebook.seriesName}
              {ebook.seriesOrder ? ` · Tome ${ebook.seriesOrder}` : ""}
            </p>
          )}
          <p className="mb-6 text-sm text-[color:var(--color-lumina-text-muted)]">
            {[
              ebook.publishedYear,
              isPdf ? "PDF" : `${pages.length} page${pages.length > 1 ? "s" : ""}`,
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
                {!isPdf && progress && progress.page > 0
                  ? "▶ Reprendre la lecture"
                  : "📖 Commencer la lecture"}
              </Link>
              {!isPdf && progress && (
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
            <BookDetailTabs
              chapters={chapters}
              readHref={readHref}
              similarBooks={similarBooks}
              episodes={episodes}
            />
          </div>

          {recommendedRows.length > 0 && (
            <section className="mb-12">
              <h2 className="mb-5 text-lg font-extrabold text-white">Recommandés pour vous</h2>
              <div className="flex flex-col gap-8">
                {recommendedRows.map((row) => (
                  <BookRow key={row.label} label={row.label} books={row.books} />
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
              {!isPdf && (
                <div>
                  <dt className="text-[color:var(--color-lumina-text-muted)]">Pages</dt>
                  <dd className="font-semibold text-white">{pages.length}</dd>
                </div>
              )}
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
