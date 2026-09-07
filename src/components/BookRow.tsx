"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import StarRating from "@/components/StarRating";

type RowBook = {
  id: string;
  slug: string;
  title: string;
  coverEmoji: string;
  coverTheme: string;
  coverImageUrl?: string | null;
  isNew?: boolean;
  isBestseller?: boolean;
  /** Real average rating, or null/undefined when nobody has rated the book. */
  rating?: number | null;
  ratingCount?: number;
  /** Set on the tile that stands in for a whole series, e.g. 5 for "5 tomes". */
  seriesCount?: number | null;
};

export default function BookRow({
  label,
  tagline,
  books,
  hrefBase = "/ebooks",
  progressByEbookId,
  light = false,
}: {
  label: string;
  tagline?: string | null;
  books: RowBook[];
  hrefBase?: string;
  progressByEbookId?: Map<string, number>;
  light?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  /* The arrows disable themselves at the ends instead of sitting there doing nothing,
     and re-check on resize because how many tiles fit changes with the viewport. */
  const syncEdges = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    /* The row is inset with a negative margin + matching padding, and `snap-start` parks
       the first tile past that padding — so a row sitting at its start reports a scrollLeft
       equal to the padding, not 0. Comparing against 0 left the "‹" enabled at the start. */
    const startOffset = parseFloat(getComputedStyle(el).paddingLeft) || 0;
    setAtStart(el.scrollLeft <= startOffset + 2);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    syncEdges();
    const el = scrollRef.current;
    if (!el) return;
    const observer = new ResizeObserver(syncEdges);
    observer.observe(el);
    return () => observer.disconnect();
  }, [syncEdges, books.length]);

  function scrollByPage(direction: 1 | -1) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: "smooth" });
  }

  const muted = light ? "text-[#6e6e73]" : "text-[color:var(--color-lumia-text-muted)]";
  const titleColor = light ? "text-[#1d1d1f]" : "text-white";
  const progressTrack = light ? "ibook-progress-track" : "lumia-progress-track";
  const progressFill = light ? "ibook-progress-fill" : "lumia-progress-fill";

  const arrowBase = `absolute top-[38%] z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-xl font-bold shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-md transition duration-200 disabled:pointer-events-none disabled:opacity-0 ${
    light
      ? "bg-white/95 text-[#1d1d1f] hover:bg-white"
      : "bg-black/70 text-white hover:bg-black/90"
  }`;

  return (
    <div className="group/row relative">
      {label && (
        <div className="mb-3">
          <p className={`text-sm font-semibold ${muted}`}>{label}</p>
          {tagline && <p className="lumia-gold-text mt-0.5 text-xs italic">{tagline}</p>}
        </div>
      )}
      <div
        ref={scrollRef}
        onScroll={syncEdges}
        className="scrollbar-hide -mx-6 flex snap-x gap-4 overflow-x-auto px-6 pb-1 sm:-mx-10 sm:px-10"
      >
        {books.map((book, i) => {
          const percent = progressByEbookId?.get(book.id);
          return (
            <Link
              key={book.id}
              href={`${hrefBase}/${book.slug}`}
              style={{ animationDelay: `${i * 50}ms` }}
              className="group relative w-32 shrink-0 snap-start transition hover:z-10 sm:w-36 animate-fade-in-up"
            >
              <div
                className={`${book.coverImageUrl ? "" : `cover-theme-${book.coverTheme}`} relative mb-2 flex aspect-[0.5628] w-full items-center justify-center overflow-hidden rounded-2xl text-4xl shadow-[0_10px_24px_rgba(0,0,0,0.45)] transition duration-300 group-hover:-translate-y-1 group-hover:scale-[1.04] group-hover:shadow-[0_20px_44px_rgba(124,92,255,0.45)]`}
              >
                {book.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={book.coverImageUrl}
                    alt=""
                    className="h-full w-full object-contain"
                  />
                ) : (
                  book.coverEmoji
                )}

                {book.seriesCount != null && book.seriesCount > 1 && (
                  <span className="absolute left-1.5 top-1.5 rounded-md bg-black/75 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                    {`Série · ${book.seriesCount} tomes`}
                  </span>
                )}
                {book.isNew && (
                  <span className="absolute right-1.5 top-1.5 rounded-md bg-[#7c5cff] px-1.5 py-0.5 text-[0.6rem] font-bold text-white">
                    Nouveau
                  </span>
                )}
                {!book.isNew && book.isBestseller && (
                  <span className="absolute right-1.5 top-1.5 rounded-md bg-[#f5b301] px-1.5 py-0.5 text-[0.6rem] font-bold text-black">
                    🔥
                  </span>
                )}
              </div>
              <p className={`truncate text-xs font-bold ${titleColor}`}>{book.title}</p>
              {book.rating != null && (
                <p className={`mt-0.5 flex items-center gap-1 text-[0.65rem] font-semibold ${muted}`}>
                  <StarRating value={book.rating} size={10} className={titleColor} />
                  {book.rating.toFixed(1)}
                  {book.ratingCount ? ` (${book.ratingCount})` : ""}
                </p>
              )}
              {percent !== undefined && (
                <div className={`mt-1 h-1 w-full overflow-hidden rounded-full ${progressTrack}`}>
                  <div className={`h-full ${progressFill}`} style={{ width: `${percent}%` }} />
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {books.length > 3 && (
        <>
          <button
            type="button"
            onClick={() => scrollByPage(-1)}
            disabled={atStart}
            aria-label="Voir précédent"
            className={`${arrowBase} -left-1 sm:left-2`}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => scrollByPage(1)}
            disabled={atEnd}
            aria-label="Voir plus"
            className={`${arrowBase} -right-1 sm:right-2`}
          >
            ›
          </button>
        </>
      )}
    </div>
  );
}
