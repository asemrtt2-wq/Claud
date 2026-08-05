const MAX_CHARS_PER_PAGE = 900;
const CHAPTER_RE = /^(Chapitre\s+\d+|Introduction)\s*(?:—|-|:)\s*(.+)$/i;

export type ChapterInfo = {
  number: number;
  title: string;
  pageIndex: number;
  estimatedMinutes: number;
};

function countWords(text: string) {
  return text.split(/\s+/).filter(Boolean).length;
}

/**
 * Mirrors paginateContent's paragraph-to-page grouping so pageIndex lines up
 * exactly with the pages the reader actually renders.
 */
export function getChapters(content: string): ChapterInfo[] {
  const paragraphs = content.split(/\n\n+/).filter(Boolean);
  const chapters: ChapterInfo[] = [];
  let current = "";
  let pageIndex = 0;
  let pending: { title: string; pageIndex: number; wordCount: number } | null = null;

  function finalize(p: typeof pending) {
    if (!p) return;
    chapters.push({
      number: chapters.length + 1,
      title: p.title,
      pageIndex: p.pageIndex,
      estimatedMinutes: Math.max(1, Math.round(p.wordCount / 200)),
    });
  }

  for (const paragraph of paragraphs) {
    if (current && current.length + paragraph.length > MAX_CHARS_PER_PAGE) {
      pageIndex += 1;
      current = paragraph;
    } else {
      current = current ? `${current}\n\n${paragraph}` : paragraph;
    }

    const match = paragraph.match(CHAPTER_RE);
    if (match) {
      finalize(pending);
      pending = { title: match[2].trim(), pageIndex, wordCount: countWords(paragraph) };
    } else if (pending) {
      pending.wordCount += countWords(paragraph);
    }
  }

  finalize(pending);
  return chapters;
}
