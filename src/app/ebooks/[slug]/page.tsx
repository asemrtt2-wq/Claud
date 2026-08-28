import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customerSession";
import { hasAccessToEbook } from "@/lib/access";
import { getActiveProfile } from "@/lib/activeProfile";
import { paginateContent } from "@/lib/paginate";
import { getChapters } from "@/lib/chapters";
import { getBestExcerpt } from "@/lib/excerpt";
import { getRecommendations } from "@/lib/recommendations";
import LightHeader from "@/components/LightHeader";
import EbookHero from "@/components/EbookHero";
import FavoriteButton from "@/components/FavoriteButton";
import AddToCollectionButton from "@/components/AddToCollectionButton";
import ExpandableText from "@/components/ExpandableText";
import ShareButton from "@/components/ShareButton";
import BackButton from "@/components/BackButton";
import BookDetailTabs from "@/components/BookDetailTabs";
import BookRow from "@/components/BookRow";
import { dedupeSeries } from "@/lib/series";

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

  const [rawSimilarBooks, recommendations, seriesBooks] = await Promise.all([
    prisma.eBook.findMany({
      where: {
        audience: "adults",
        category: ebook.category,
        id: { not: ebook.id },
        ...(ebook.seriesName ? { seriesName: { not: ebook.seriesName } } : {}),
      },
      take: 8,
    }),
    activeProfile ? getRecommendations(activeProfile.id, [ebook.id]) : null,
    ebook.seriesName
      ? prisma.eBook.findMany({
          where: { seriesName: ebook.seriesName, audience: "adults" },
          orderBy: { seriesOrder: "asc" },
        })
      : Promise.resolve([]),
  ]);

  const similarBooks = dedupeSeries(rawSimilarBooks).slice(0, 4);

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
  const excerpt = isPdf ? null : getBestExcerpt(pages, chapters);
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

  const progressLabel =
    !isPdf && progress
      ? {
          percent,
          text: `Page ${progress.page + 1} sur ${pages.length} · ${percent}% terminé · Temps restant estimé : ${formatDuration(remainingMinutes)}`,
        }
      : null;

  return (
    <>
      <LightHeader />
      <div className="ibook-shell">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 pt-6">
          <BackButton />
          <Link
            href={activeProfile ? `/p/${activeProfile.id}` : "/"}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/[0.04] text-lg text-[#1d1d1f] transition hover:bg-black/[0.08]"
            aria-label="Fermer"
          >
            ✕
          </Link>
        </div>

        <EbookHero
          ebookId={ebook.id}
          title={ebook.title}
          author={ebook.author}
          seriesName={ebook.seriesName}
          seriesOrder={ebook.seriesOrder}
          category={ebook.category}
          publishedYear={ebook.publishedYear}
          isPdf={isPdf}
          pagesCount={pages.length}
          coverEmoji={ebook.coverEmoji}
          coverTheme={ebook.coverTheme}
          coverImageUrl={ebook.coverImageUrl}
          backCoverImageUrl={ebook.backCoverImageUrl}
          price={ebook.price}
          oldPrice={ebook.oldPrice}
          discount={discount}
          hasAccess={hasAccess}
          isLoggedIn={isLoggedIn}
          readHref={readHref}
          progressLabel={progressLabel}
          excerpt={excerpt}
        />

        <div className="mx-auto max-w-3xl px-6 pb-20 pt-10">
          <div className="mb-8">
            <ExpandableText text={ebook.description} light />
          </div>

          <div className="mb-10 flex flex-wrap items-center gap-2">
            <FavoriteButton
              ebookId={ebook.id}
              slug={ebook.slug}
              initialFavorited={Boolean(favorite)}
              profileId={activeProfile?.id ?? null}
              light
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
              light
            />
          </div>

          {recommendedRows.length > 0 && (
            <section className="mb-12">
              <h2 className="mb-5 text-lg font-extrabold text-[#1d1d1f]">Recommandés pour vous</h2>
              <div className="flex flex-col gap-8">
                {recommendedRows.map((row) => (
                  <BookRow key={row.label} label={row.label} books={row.books} light />
                ))}
              </div>
            </section>
          )}

          <section className="ibook-card rounded-[22px] p-6">
            <h2 className="mb-4 text-sm font-extrabold uppercase tracking-wider text-[#6e6e73]">
              Informations
            </h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
              {ebook.author && (
                <div>
                  <dt className="text-[#6e6e73]">Auteur</dt>
                  <dd className="font-semibold text-[#1d1d1f]">{ebook.author}</dd>
                </div>
              )}
              <div>
                <dt className="text-[#6e6e73]">Catégorie</dt>
                <dd className="font-semibold text-[#1d1d1f]">{ebook.category}</dd>
              </div>
              {!isPdf && (
                <div>
                  <dt className="text-[#6e6e73]">Pages</dt>
                  <dd className="font-semibold text-[#1d1d1f]">{pages.length}</dd>
                </div>
              )}
              <div>
                <dt className="text-[#6e6e73]">Langue</dt>
                <dd className="font-semibold text-[#1d1d1f]">Français</dd>
              </div>
              {ebook.publishedYear && (
                <div>
                  <dt className="text-[#6e6e73]">Année</dt>
                  <dd className="font-semibold text-[#1d1d1f]">{ebook.publishedYear}</dd>
                </div>
              )}
              <div>
                <dt className="text-[#6e6e73]">Ajouté au catalogue</dt>
                <dd className="font-semibold text-[#1d1d1f]">
                  {ebook.createdAt.toLocaleDateString("fr-FR", { year: "numeric", month: "long" })}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </>
  );
}
