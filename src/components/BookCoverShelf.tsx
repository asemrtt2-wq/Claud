"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import BookCoverCard, { type CoverCardBook } from "./BookCoverCard";
import CoverLightbox, { type LightboxBook } from "./CoverLightbox";

export type ShelfBook = CoverCardBook & { backCoverImageUrl?: string | null };

export default function BookCoverShelf({
  books,
  light = false,
}: {
  books: ShelfBook[];
  light?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  /* Same behaviour as BookRow: solid, always-legible arrows that disable themselves at the
     ends rather than fading in over the covers and doing nothing when there is no more row. */
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

  const arrowBase = `absolute top-[38%] z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-xl font-bold shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-md transition duration-200 disabled:pointer-events-none disabled:opacity-0 ${
    light ? "bg-white/95 text-[#1d1d1f] hover:bg-white" : "bg-black/70 text-white hover:bg-black/90"
  }`;

  return (
    <div className="group/row relative">
      <div
        ref={scrollRef}
        onScroll={syncEdges}
        className="scrollbar-hide -mx-6 flex snap-x gap-5 overflow-x-auto px-6 pb-2 sm:-mx-10 sm:px-10"
      >
        {books.map((book, i) => (
          <div key={book.id} className="w-32 shrink-0 snap-start sm:w-40">
            <BookCoverCard
              book={book}
              light={light}
              animationDelayMs={Math.min(i, 10) * 40}
              onOpen={() => setLightboxIndex(i)}
            />
          </div>
        ))}
      </div>

      {books.length > 4 && (
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

      {lightboxIndex !== null && (
        <CoverLightbox
          books={books.map(
            (b): LightboxBook => ({
              slug: b.slug,
              title: b.title,
              category: b.category,
              coverEmoji: b.coverEmoji,
              coverTheme: b.coverTheme,
              coverImageUrl: b.coverImageUrl,
              backCoverImageUrl: b.backCoverImageUrl,
            })
          )}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(index) => setLightboxIndex(index)}
        />
      )}
    </div>
  );
}
