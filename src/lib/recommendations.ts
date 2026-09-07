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

/**
 * Real popularity, from three signals the app actually records: paid orders, how many
 * profiles have started the book, and how many have favorited it. Purchases weigh most
 * because they cost something; a favorite is the cheapest signal, so it counts least.
 *
 * Ranked books are returned in a *rotated* order rather than always the same top 5: the
 * row is meant to feel alive between visits, and rotating a genuinely popular pool does
 * that without inventing numbers. Rotation is a shuffle over the top `poolSize`, so a book
 * never appears in the row unless it really is among the most popular.
 */
export async function getPopularBooks(limit = 10, poolSize = 24) {
  const [orders, progress, favorites] = await Promise.all([
    prisma.order.groupBy({
      by: ["ebookId"],
      where: { status: "paid" },
      _count: { ebookId: true },
    }),
    prisma.readingProgress.groupBy({ by: ["ebookId"], _count: { ebookId: true } }),
    prisma.favorite.groupBy({ by: ["ebookId"], _count: { ebookId: true } }),
  ]);

  const score = new Map<string, number>();
  const add = (id: string, weight: number) => score.set(id, (score.get(id) ?? 0) + weight);
  for (const row of orders) add(row.ebookId, row._count.ebookId * 5);
  for (const row of progress) add(row.ebookId, row._count.ebookId * 3);
  for (const row of favorites) add(row.ebookId, row._count.ebookId * 1);

  const ranked = [...score.entries()].sort((a, b) => b[1] - a[1]).slice(0, poolSize);
  if (ranked.length === 0) return [];

  const books = await prisma.eBook.findMany({
    where: { id: { in: ranked.map(([id]) => id) }, audience: "adults" },
  });
  const byId = new Map(books.map((b) => [b.id, b]));

  const pool = ranked
    .map(([id]) => byId.get(id))
    .filter((b): b is NonNullable<typeof b> => Boolean(b));

  // Fisher-Yates over the popular pool, then take the row's worth.
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, limit);
}

const SIMILARITY_STOP_WORDS = new Set([
  "le", "la", "les", "un", "une", "des", "du", "de", "et", "ou", "au", "aux", "en", "sur",
  "pour", "par", "dans", "avec", "sans", "ce", "cet", "cette", "ces", "qui", "que", "son",
  "sa", "ses", "plus", "tout", "tous", "toute", "est", "the", "of", "and", "to",
]);

function tokens(text: string) {
  return new Set(
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !SIMILARITY_STOP_WORDS.has(w))
  );
}

function overlap(a: Set<string>, b: Set<string>) {
  let hits = 0;
  for (const word of a) if (b.has(word)) hits += 1;
  return hits;
}

/**
 * "Livres similaires" for one book, scored rather than filtered.
 *
 * The old version was a plain `where: { category }` take-8, which meant a 40-book category
 * always returned the same arbitrary first eight and a book in a small category returned
 * almost nothing. Scoring the whole adult catalog on shared category, shared author and
 * title/subtitle/description word overlap surfaces books that actually resemble this one,
 * and still degrades gracefully when nothing is close.
 */
export async function getSimilarBooks(
  ebook: {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    category: string;
    author: string;
    seriesName: string | null;
  },
  limit = 6
) {
  const candidates = await prisma.eBook.findMany({
    where: {
      audience: "adults",
      id: { not: ebook.id },
      // The book's own tomes already have their own "Épisodes" tab.
      ...(ebook.seriesName ? { seriesName: { not: ebook.seriesName } } : {}),
    },
  });

  const source = tokens(`${ebook.title} ${ebook.subtitle} ${ebook.description}`);

  const scored = candidates.map((candidate) => {
    let score = 0;
    if (candidate.category === ebook.category) score += 10;
    if (ebook.author && candidate.author === ebook.author) score += 6;
    score += overlap(source, tokens(`${candidate.title} ${candidate.subtitle} ${candidate.description}`)) * 2;
    return { candidate, score };
  });

  return scored
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || b.candidate.createdAt.getTime() - a.candidate.createdAt.getTime())
    .slice(0, limit)
    .map((entry) => entry.candidate);
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

  const [byCategory, byAuthor, newest, popularPool] = await Promise.all([
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
    // Real popularity across purchases, reads and favorites — rotated per request so the
    // row changes between visits without ever showing a book that isn't actually popular.
    getPopularBooks(12),
  ]);

  const popular = popularPool.filter((b) => !excludeIds.includes(b.id)).slice(0, 3);

  return { topCategory, byCategory, topAuthor, byAuthor, newest, popular };
}

/**
 * "Me recommander un livre" pick: personalized (same signals as
 * getRecommendations) when a profile is active, otherwise a genuinely
 * random pick from the adult catalog — never a fabricated "just for you".
 */
export async function getSurpriseBook(profileId: string | null): Promise<string | null> {
  if (profileId) {
    const rec = await getRecommendations(profileId, []);
    const pick = rec.byCategory[0] ?? rec.popular[0] ?? rec.byAuthor[0] ?? rec.newest[0] ?? null;
    if (pick) return pick.slug;
  }

  const count = await prisma.eBook.count({ where: { audience: "adults" } });
  if (count === 0) return null;
  const [random] = await prisma.eBook.findMany({
    where: { audience: "adults" },
    select: { slug: true },
    take: 1,
    skip: Math.floor(Math.random() * count),
  });
  return random?.slug ?? null;
}
