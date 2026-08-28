import type { ChapterInfo } from "./chapters";

export type BestExcerpt = {
  chapterTitle: string | null;
  text: string;
};

/**
 * Picks a representative excerpt to preview before buying — never just page 1,
 * which is often a short/blank intro. Prefers the first real chapter (skipping
 * a plain "Introduction") and includes its following page too when that page
 * doesn't already belong to the next chapter, so the excerpt reads as a real
 * passage rather than a single truncated page.
 */
export function getBestExcerpt(pages: string[], chapters: ChapterInfo[]): BestExcerpt | null {
  if (pages.length === 0 || (pages.length === 1 && pages[0] === "Ce livre n'a pas encore de contenu.")) {
    return null;
  }

  if (chapters.length === 0) {
    let pageIndex = 0;
    while (pageIndex < pages.length - 1 && pages[pageIndex].length < 200) pageIndex += 1;
    return { chapterTitle: null, text: joinPages(pages, pageIndex, chapters) };
  }

  const chosen = chapters.find((c) => !/^introduction$/i.test(c.title)) ?? chapters[0];
  return { chapterTitle: chosen.title, text: joinPages(pages, chosen.pageIndex, chapters) };
}

function joinPages(pages: string[], pageIndex: number, chapters: ChapterInfo[]) {
  const nextPage = pages[pageIndex + 1];
  const nextPageStartsNewChapter = chapters.some((c) => c.pageIndex === pageIndex + 1);
  if (!nextPage || nextPageStartsNewChapter) return pages[pageIndex];
  return `${pages[pageIndex]}\n\n${nextPage}`;
}
