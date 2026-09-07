type SeriesAware = {
  seriesName: string | null;
  seriesOrder: number | null;
};

/**
 * Collapses a list of books down to one representative per series (the lowest
 * seriesOrder, i.e. "tome 1") so browse rows read like a show tile instead of
 * listing every tome separately. Standalone books (no seriesName) pass through
 * untouched. Order of first appearance is preserved.
 */
export function dedupeSeries<T extends SeriesAware>(books: T[]): T[] {
  const seen = new Set<string>();
  const bestBySeries = new Map<string, T>();

  for (const book of books) {
    if (!book.seriesName) continue;
    const current = bestBySeries.get(book.seriesName);
    if (!current || (book.seriesOrder ?? Infinity) < (current.seriesOrder ?? Infinity)) {
      bestBySeries.set(book.seriesName, book);
    }
  }

  const result: T[] = [];
  for (const book of books) {
    if (!book.seriesName) {
      result.push(book);
      continue;
    }
    if (seen.has(book.seriesName)) continue;
    seen.add(book.seriesName);
    result.push(bestBySeries.get(book.seriesName)!);
  }
  return result;
}

/**
 * How many tomes each series has in the given list, so a collapsed tile can say
 * "Série · 5 tomes" instead of silently hiding the other four.
 */
export function seriesCounts(books: SeriesAware[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const book of books) {
    if (!book.seriesName) continue;
    counts.set(book.seriesName, (counts.get(book.seriesName) ?? 0) + 1);
  }
  return counts;
}

/**
 * `dedupeSeries` plus the tome count attached to each surviving tile — the shape browse
 * rows and grids actually want, since every caller that collapses a series also needs to
 * label it as one.
 */
export function collapseSeries<T extends SeriesAware>(
  books: T[]
): (T & { seriesCount: number | null })[] {
  const counts = seriesCounts(books);
  return dedupeSeries(books).map((book) => ({
    ...book,
    seriesCount: book.seriesName ? (counts.get(book.seriesName) ?? 1) : null,
  }));
}
