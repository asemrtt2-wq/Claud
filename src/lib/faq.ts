import { prisma } from "@/lib/prisma";

/**
 * The public FAQ, written from /admin/faq.
 *
 * Kept in the database rather than hardcoded in the page so the project owner can answer a
 * new question without a deploy — the same reasoning as SiteSettings' hero overrides.
 */
export type FaqEntry = {
  id: string;
  question: string;
  answer: string;
  category: string;
};

export type FaqGroup = { category: string; items: FaqEntry[] };

export async function getPublishedFaq(): Promise<FaqEntry[]> {
  const rows = await prisma.faqItem.findMany({
    where: { published: true },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });
  return rows.map((row) => ({
    id: row.id,
    question: row.question,
    answer: row.answer,
    category: row.category,
  }));
}

/** Groups entries under their category heading, keeping the admin's ordering. */
export function groupFaq(items: FaqEntry[]): FaqGroup[] {
  const groups: FaqGroup[] = [];
  for (const item of items) {
    const key = item.category.trim();
    const existing = groups.find((g) => g.category === key);
    if (existing) existing.items.push(item);
    else groups.push({ category: key, items: [item] });
  }
  return groups;
}
