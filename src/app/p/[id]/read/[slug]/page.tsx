import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customerSession";
import { hasAccessToEbook } from "@/lib/access";
import { getReadingStatus } from "@/lib/profileActions";
import { paginateContent } from "@/lib/paginate";
import { getChapters } from "@/lib/chapters";
import { dedupeSeries } from "@/lib/series";
import Reader from "@/components/Reader";
import KidsReader from "@/components/KidsReader";

export default async function ProfileReadPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { id, slug } = await params;
  const { page: pageParam } = await searchParams;
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/login");

  const profile = await prisma.profile.findUnique({ where: { id } });
  if (!profile || profile.customerId !== customer.id) redirect("/profiles");

  const ebook = await prisma.eBook.findUnique({ where: { slug } });
  if (!ebook) notFound();

  if (profile.type === "kids") {
    if (ebook.audience !== "kids") notFound();

    const [progress, status] = await Promise.all([
      prisma.readingProgress.findUnique({
        where: { profileId_ebookId: { profileId: id, ebookId: ebook.id } },
      }),
      getReadingStatus(id),
    ]);

    const pages = paginateContent(ebook.content);

    return (
      <KidsReader
        profileId={id}
        ebookId={ebook.id}
        kidsHomeHref={`/p/${id}`}
        title={ebook.title}
        coverTheme={ebook.coverTheme}
        pages={pages}
        initialPage={progress?.page ?? 0}
        initialLimitReached={status.limitReached}
        dailyLimitMinutes={status.dailyLimitMinutes}
      />
    );
  }

  if (ebook.audience !== "adults") notFound();

  const allowed = await hasAccessToEbook(customer.id, ebook.id);
  if (!allowed) redirect(`/ebooks/${slug}`);

  const [progress, favorite] = await Promise.all([
    prisma.readingProgress.findUnique({
      where: { profileId_ebookId: { profileId: id, ebookId: ebook.id } },
    }),
    prisma.favorite.findUnique({
      where: { profileId_ebookId: { profileId: id, ebookId: ebook.id } },
    }),
  ]);

  const pages = ebook.pdfUrl ? [] : paginateContent(ebook.content);
  const chapters = ebook.pdfUrl ? [] : getChapters(ebook.content);
  const requestedPage = pageParam ? Number(pageParam) : null;
  const initialPage =
    requestedPage !== null && !Number.isNaN(requestedPage)
      ? Math.min(Math.max(requestedPage, 0), pages.length - 1)
      : progress?.page ?? 0;

  const [nextTome, rawSimilarBooks] = ebook.pdfUrl
    ? [null, []]
    : await Promise.all([
        ebook.seriesName
          ? prisma.eBook.findFirst({
              where: {
                seriesName: ebook.seriesName,
                audience: "adults",
                seriesOrder: { gt: ebook.seriesOrder ?? 0 },
              },
              orderBy: { seriesOrder: "asc" },
              select: { slug: true, title: true, coverEmoji: true, coverTheme: true, coverImageUrl: true },
            })
          : Promise.resolve(null),
        prisma.eBook.findMany({
          where: {
            audience: "adults",
            category: ebook.category,
            id: { not: ebook.id },
            ...(ebook.seriesName ? { seriesName: { not: ebook.seriesName } } : {}),
          },
          select: { id: true, slug: true, title: true, coverEmoji: true, coverTheme: true, coverImageUrl: true, seriesName: true, seriesOrder: true },
          take: 8,
        }),
      ]);
  const similarBooks = dedupeSeries(rawSimilarBooks).slice(0, 4);

  return (
    <Reader
      profileId={id}
      ebookId={ebook.id}
      slug={ebook.slug}
      title={ebook.title}
      coverTheme={ebook.coverTheme}
      coverImageUrl={ebook.coverImageUrl}
      backCoverImageUrl={ebook.backCoverImageUrl}
      pages={pages}
      initialPage={initialPage}
      pdfUrl={ebook.pdfUrl}
      chapters={chapters}
      avgSecondsPerPage={progress?.avgSecondsPerPage ?? null}
      initialFavorited={!!favorite}
      nextTome={nextTome}
      similarBooks={similarBooks}
    />
  );
}
