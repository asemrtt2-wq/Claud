"use client";

import { useRef, useState } from "react";
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

  function scrollBy(amount: number) {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  }

  const arrowBase =
    "absolute inset-y-0 z-10 hidden w-14 items-center text-3xl opacity-0 transition-opacity duration-200 group-hover/row:opacity-100 sm:flex";
  const arrowColor = light ? "text-[#1d1d1f]" : "text-white";
  const edgeFrom = light ? "from-[#f5f5f7]" : "from-[#0a0918]";
  const edgeTo = light ? "to-[#f5f5f7]" : "to-[#0a0918]";

  return (
    <div className="group/row relative">
      <div
        ref={scrollRef}
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
            onClick={() => scrollBy(-(scrollRef.current?.clientWidth ?? 0) * 0.8)}
            aria-label="Voir précédent"
            className={`${arrowBase} left-0 justify-start rounded-r-2xl bg-gradient-to-r ${edgeFrom} to-transparent pl-2 ${arrowColor}`}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => scrollBy((scrollRef.current?.clientWidth ?? 0) * 0.8)}
            aria-label="Voir plus"
            className={`${arrowBase} right-0 justify-end rounded-l-2xl bg-gradient-to-l ${edgeTo} from-transparent pr-2 ${arrowColor}`}
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
