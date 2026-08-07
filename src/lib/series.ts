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
