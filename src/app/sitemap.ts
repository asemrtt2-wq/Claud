import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/seo";

/**
 * Lists every page a search engine should crawl: the marketing pages plus one entry per
 * public adult book, timestamped with the book's own updatedAt so a re-import re-announces it.
 *
 * Deliberately excludes /p/**, /profiles, /admin/** and the auth pages — they are
 * per-account or gated, so indexing them is at best useless and at worst a privacy leak.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [books, faqCount] = await Promise.all([
    prisma.eBook.findMany({
      where: { audience: "adults" },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.faqItem.count({ where: { published: true } }),
  ]);

  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    {
      url: absoluteUrl("/bibliotheque"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    { url: absoluteUrl("/premium"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];

  // Only advertise the FAQ once it actually answers something.
  if (faqCount > 0) {
    staticPages.push({
      url: absoluteUrl("/faq"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return [
    ...staticPages,
    ...books.map((book) => ({
      url: absoluteUrl(`/ebooks/${book.slug}`),
      lastModified: book.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
