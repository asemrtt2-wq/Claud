import { prisma } from "@/lib/prisma";

/**
 * Real "bestseller" signal: eBook ids with the most paid orders, most-read
 * first. No fabricated rating/reader-count data — just actual purchases.
 */
export async function getBestsellerIds(limit = 10): Promise<Set<string>> {
  const orders = await prisma.order.groupBy({
    by: ["ebookId"],
    where: { status: "paid" },
    _count: { ebookId: true },
    orderBy: { _count: { ebookId: "desc" } },
    take: limit,
  });
  return new Set(orders.map((o) => o.ebookId));
}

export async function getRecommendations(profileId: string, excludeIds: string[]) {
  const [favorites, progress] = await Promise.all([
    prisma.favorite.findMany({ where: { profileId }, include: { ebook: true } }),
    prisma.readingProgress.findMany({ where: { profileId }, include: { ebook: true } }),
  ]);

  const categoryCounts = new Map<string, number>();
  const authorCounts = new Map<string, number>();
  for (const entry of [...favorites, ...progress]) {
    const { category, author } = entry.ebook;
    categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
    if (author) authorCounts.set(author, (authorCounts.get(author) ?? 0) + 1);
  }
  const topCategory =
    [...categoryCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const topAuthor = [...authorCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const excludeFilter = excludeIds.length > 0 ? { notIn: excludeIds } : undefined;

  const [byCategory, byAuthor, newest, popularOrders] = await Promise.all([
    topCategory
      ? prisma.eBook.findMany({
          where: { audience: "adults", category: topCategory, id: excludeFilter },
          take: 3,
        })
      : Promise.resolve([]),
    topAuthor
      ? prisma.eBook.findMany({
          where: { audience: "adults", author: topAuthor, id: excludeFilter },
          take: 3,
        })
      : Promise.resolve([]),
    prisma.eBook.findMany({
      where: { audience: "adults", id: excludeFilter },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.order.groupBy({
      by: ["ebookId"],
      where: { status: "paid" },
      _count: { ebookId: true },
      orderBy: { _count: { ebookId: "desc" } },
      take: 10,
    }),
  ]);

  const popularIds = popularOrders
    .map((o) => o.ebookId)
    .filter((id) => !excludeIds.includes(id));

  const popularBooks = popularIds.length
    ? await prisma.eBook.findMany({ where: { id: { in: popularIds } } })
    : [];

  const popular = popularIds
    .map((id) => popularBooks.find((b) => b.id === id))
    .filter((b): b is NonNullable<typeof b> => Boolean(b))
    .slice(0, 3);

  return { topCategory, byCategory, topAuthor, byAuthor, newest, popular };
}
