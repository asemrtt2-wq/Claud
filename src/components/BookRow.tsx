"use client";

import { useRef } from "react";
import Link from "next/link";

type RowBook = {
  id: string;
  slug: string;
  title: string;
  coverEmoji: string;
  coverTheme: string;
  coverImageUrl?: string | null;
  isNew?: boolean;
  isBestseller?: boolean;
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

  function scrollBy(amount: number) {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  }

  const arrowClass = `absolute top-0 z-10 hidden h-40 w-12 items-center justify-center text-2xl opacity-0 transition-opacity duration-200 group-hover/row:opacity-100 sm:flex ${light ? "text-[#1d1d1f]" : "text-white"}`;
  const muted = light ? "text-[#6e6e73]" : "text-[color:var(--color-lumina-text-muted)]";
  const titleColor = light ? "text-[#1d1d1f]" : "text-white";
  const progressTrack = light ? "ibook-progress-track" : "lumina-progress-track";
  const progressFill = light ? "ibook-progress-fill" : "lumina-progress-fill";
  const edgeFadeFrom = light ? "from-[#f5f5f7]" : "from-[#0a0918]";
  const edgeFadeTo = light ? "to-[#f5f5f7]" : "to-[#0a0918]";

  return (
    <div className="group/row relative">
      {label && (
        <div className="mb-3">
          <p className={`text-sm font-semibold ${muted}`}>{label}</p>
          {tagline && <p className="lumina-gold-text mt-0.5 text-xs italic">{tagline}</p>}
        </div>
      )}
      <div
        ref={scrollRef}
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
                className={`cover-theme-${book.coverTheme} relative mb-2 flex h-40 items-center justify-center overflow-hidden rounded-2xl text-4xl shadow-[0_10px_24px_rgba(0,0,0,0.45)] ring-1 ring-white/10 transition duration-300 group-hover:-translate-y-1 group-hover:scale-110 group-hover:rotate-1 group-hover:shadow-[0_20px_44px_rgba(124,92,255,0.45)]`}
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
              </div>
              <p className={`truncate text-xs font-bold ${titleColor}`}>{book.title}</p>
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
            onClick={() => scrollBy(-(scrollRef.current?.clientWidth ?? 0) * 0.8)}
            aria-label="Voir précédent"
            className={`${arrowClass} left-0 justify-start rounded-r-2xl bg-gradient-to-r ${edgeFadeFrom} to-transparent pl-2`}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => scrollBy((scrollRef.current?.clientWidth ?? 0) * 0.8)}
            aria-label="Voir plus"
            className={`${arrowClass} right-0 justify-end rounded-l-2xl bg-gradient-to-l ${edgeFadeTo} pr-2`}
          >
            ›
          </button>
        </>
      )}
    </div>
  );
}
