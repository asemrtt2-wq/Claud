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
};

export default function BookRow({
  label,
  books,
  hrefBase = "/ebooks",
  progressByEbookId,
}: {
  label: string;
  books: RowBook[];
  hrefBase?: string;
  progressByEbookId?: Map<string, number>;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollBy(amount: number) {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  }

  const arrowClass =
    "absolute top-0 z-10 hidden h-40 w-12 items-center justify-center text-2xl text-white opacity-0 transition-opacity duration-200 group-hover/row:opacity-100 sm:flex";

  return (
    <div className="group/row relative">
      {label && (
        <p className="mb-3 text-sm font-semibold text-[color:var(--color-lumina-text-muted)]">
          {label}
        </p>
      )}
      <div
        ref={scrollRef}
        className="scrollbar-hide -mx-6 flex snap-x gap-4 overflow-x-auto px-6 pb-1 sm:-mx-10 sm:px-10"
      >
        {books.map((book) => {
          const percent = progressByEbookId?.get(book.id);
          return (
            <Link
              key={book.id}
              href={`${hrefBase}/${book.slug}`}
              className="group relative w-32 shrink-0 snap-start transition hover:z-10 sm:w-36"
            >
              <div
                className={`${book.coverImageUrl ? "" : `cover-theme-${book.coverTheme}`} relative mb-2 flex h-40 items-center justify-center overflow-hidden rounded-2xl text-4xl shadow-lg transition duration-300 group-hover:-translate-y-1 group-hover:scale-110 group-hover:shadow-2xl`}
              >
                {book.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={book.coverImageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  book.coverEmoji
                )}
              </div>
              <p className="truncate text-xs font-bold text-white">{book.title}</p>
              {percent !== undefined && (
                <div className="mt-1 h-1 w-full overflow-hidden rounded-full lumina-progress-track">
                  <div className="h-full lumina-progress-fill" style={{ width: `${percent}%` }} />
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
            className={`${arrowClass} left-0 justify-start rounded-r-2xl bg-gradient-to-r from-[#0a0918] to-transparent pl-2`}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => scrollBy((scrollRef.current?.clientWidth ?? 0) * 0.8)}
            aria-label="Voir plus"
            className={`${arrowClass} right-0 justify-end rounded-l-2xl bg-gradient-to-l from-[#0a0918] to-transparent pr-2`}
          >
            ›
          </button>
        </>
      )}
    </div>
  );
}
