"use client";

import { useRef } from "react";
import Link from "next/link";

export type LibraryBook = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  coverEmoji: string;
  coverTheme: string;
  coverImageUrl?: string | null;
  price: number;
  oldPrice: number | null;
  readingMinutes: number | null;
  isNew: boolean;
  isBestseller: boolean;
  hasAccess: boolean;
  href: string;
};

export default function LibraryBookRow({ books }: { books: LibraryBook[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollBy(amount: number) {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  }

  const arrowClass =
    "absolute top-0 z-10 hidden h-full w-12 items-center justify-center text-2xl text-white opacity-0 transition-opacity duration-200 group-hover/row:opacity-100 sm:flex";

  return (
    <div className="group/row relative">
      <div
        ref={scrollRef}
        className="scrollbar-hide -mx-6 flex snap-x gap-4 overflow-x-auto px-6 pb-2 sm:-mx-10 sm:px-10"
      >
        {books.map((book) => (
          <Link
            key={book.id}
            href={book.href}
            className="lumina-card group relative flex w-52 shrink-0 snap-start flex-col overflow-hidden rounded-2xl transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_44px_rgba(124,92,255,0.35)] sm:w-56"
          >
            <div
              className={`${book.coverImageUrl ? "" : `cover-theme-${book.coverTheme}`} relative flex h-56 items-center justify-center overflow-hidden text-5xl`}
            >
              {book.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={book.coverImageUrl}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                book.coverEmoji
              )}
              {(book.isBestseller || book.isNew) && (
                <span
                  className={`absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[0.6rem] font-extrabold uppercase tracking-wide text-white shadow-lg ${
                    book.isBestseller
                      ? "bg-gradient-to-r from-[#f59e0b] to-[#d97706]"
                      : "bg-gradient-to-r from-[#7c5cff] to-[#5b3df0]"
                  }`}
                >
                  {book.isBestseller ? "🔥 Bestseller" : "🆕 Nouveau"}
                </span>
              )}
            </div>
            <div className="flex flex-1 flex-col p-4">
              <h3 className="mb-1 truncate text-sm font-extrabold tracking-tight text-white">
                {book.title}
              </h3>
              <p className="mb-3 line-clamp-2 text-xs text-white/60">{book.subtitle}</p>
              <div className="mb-3 flex items-center gap-2.5 text-xs font-semibold text-white/50">
                <span className="truncate">{book.category}</span>
                {book.readingMinutes !== null && (
                  <span className="shrink-0">{`⏱ ${book.readingMinutes} min`}</span>
                )}
              </div>
              <div className="mt-auto flex items-center justify-between gap-2">
                <span className="flex items-baseline gap-1.5">
                  {book.oldPrice && (
                    <span className="text-xs font-semibold text-white/40 line-through">
                      {book.oldPrice} €
                    </span>
                  )}
                  <span className="text-sm font-extrabold text-white">{`${book.price} €`}</span>
                </span>
                <span className="shrink-0 rounded-lg bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-3 py-1.5 text-xs font-bold text-white">
                  {book.hasAccess ? "Lire" : "Découvrir"}
                </span>
              </div>
            </div>
          </Link>
        ))}
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
