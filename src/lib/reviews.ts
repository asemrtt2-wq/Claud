import { prisma } from "@/lib/prisma";

/**
 * Public reviews: a 1-5 star rating plus a comment anyone can read and reply to.
 *
 * The score shown next to a book is a real average of real ratings — there is no seeded or
 * placeholder value, so a book nobody has rated shows "pas encore de note" rather than a
 * flattering default. That is the same rule the rest of this codebase follows about never
 * displaying a number it doesn't actually have.
 */

export type ReviewAuthor = {
  name: string;
  avatarEmoji: string;
  color: string;
};

export type ReviewNode = {
  id: string;
  rating: number | null;
  comment: string;
  createdAt: string;
  author: ReviewAuthor;
  /** True when the viewing profile wrote it, so the UI can offer delete/edit. */
  mine: boolean;
  replies: ReviewNode[];
};

export type RatingSummary = {
  /** Null when nobody has rated the book yet. */
  average: number | null;
  count: number;
  /** How many ratings each star value received, index 0 = 1 star. */
  distribution: number[];
};

function formatDate(date: Date) {
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

/** Average score + count for one book. */
export async function getRatingSummary(ebookId: string): Promise<RatingSummary> {
  const rows = await prisma.review.findMany({
    where: { ebookId, parentId: null, rating: { not: null } },
    select: { rating: true },
  });

  const distribution = [0, 0, 0, 0, 0];
  let total = 0;
  for (const row of rows) {
    const value = row.rating as number;
    if (value >= 1 && value <= 5) {
      distribution[value - 1] += 1;
      total += value;
    }
  }

  return {
    average: rows.length > 0 ? Math.round((total / rows.length) * 10) / 10 : null,
    count: rows.length,
    distribution,
  };
}

/**
 * Average score for many books at once, for listings that show a score beside each cover.
 * One grouped query rather than one per book — a catalog row renders a dozen tiles.
 */
export async function getRatingSummaries(
  ebookIds: string[]
): Promise<Map<string, { average: number; count: number }>> {
  const map = new Map<string, { average: number; count: number }>();
  if (ebookIds.length === 0) return map;

  const grouped = await prisma.review.groupBy({
    by: ["ebookId"],
    where: { ebookId: { in: ebookIds }, parentId: null, rating: { not: null } },
    _avg: { rating: true },
    _count: { rating: true },
  });

  for (const row of grouped) {
    if (row._avg.rating === null) continue;
    map.set(row.ebookId, {
      average: Math.round(row._avg.rating * 10) / 10,
      count: row._count.rating,
    });
  }
  return map;
}

/** Every top-level review of a book with its replies nested underneath, newest first. */
export async function getReviewThread(
  ebookId: string,
  viewerProfileId: string | null
): Promise<ReviewNode[]> {
  const rows = await prisma.review.findMany({
    where: { ebookId },
    orderBy: { createdAt: "asc" },
    include: {
      profile: { select: { name: true, avatarEmoji: true, color: true } },
    },
  });

  const toNode = (row: (typeof rows)[number]): ReviewNode => ({
    id: row.id,
    rating: row.rating,
    comment: row.comment,
    createdAt: formatDate(row.createdAt),
    author: {
      name: row.profile.name,
      avatarEmoji: row.profile.avatarEmoji,
      color: row.profile.color,
    },
    mine: viewerProfileId === row.profileId,
    replies: [],
  });

  const nodes = new Map(rows.map((row) => [row.id, toNode(row)]));
  const roots: ReviewNode[] = [];
  for (const row of rows) {
    const node = nodes.get(row.id)!;
    // A reply whose parent was deleted mid-render is dropped rather than orphaned to the top.
    if (row.parentId) nodes.get(row.parentId)?.replies.push(node);
    else roots.push(node);
  }

  return roots.reverse();
}

/** The viewing profile's own rating, so the form opens pre-filled instead of blank. */
export async function getMyReview(ebookId: string, profileId: string) {
  return prisma.review.findFirst({
    where: { ebookId, profileId, parentId: null },
    select: { id: true, rating: true, comment: true },
  });
}
