"use client";

import { useState } from "react";
import StarRating from "@/components/StarRating";

export type CoverCardBook = {
  id: string;
  slug: string;
  title: string;
  category: string;
  coverEmoji: string;
  coverTheme: string;
  coverImageUrl?: string | null;
  /** Real average of submitted ratings; null until the book has one. */
  rating?: number | null;
  ratingCount?: number;
  /** Tomes in the series this tile stands for; null/1 for a standalone book. */
  seriesCount?: number | null;
};

export default function BookCoverCard({
  book,
  onOpen,
  light = false,
  animationDelayMs = 0,
}: {
  book: CoverCardBook;
  onOpen: () => void;
  light?: boolean;
  animationDelayMs?: number;
}) {
  const [imgError, setImgError] = useState(false);
  const showImage = Boolean(book.coverImageUrl) && !imgError;

  return (
    <button
      type="button"
      onClick={onOpen}
      style={{ animationDelay: `${animationDelayMs}ms` }}
      className="group flex w-full flex-col text-left animate-fade-in-up"
    >
      <div
        className={`relative overflow-hidden rounded-2xl transition-all duration-300 ease-out group-hover:-translate-y-1.5 ${
          light
            ? "shadow-[0_2px_10px_rgba(0,0,0,0.1)] group-hover:shadow-[0_18px_34px_rgba(0,0,0,0.16)]"
            : "shadow-[0_14px_34px_rgba(0,0,0,0.35)] group-hover:shadow-[0_26px_54px_rgba(124,92,255,0.35)]"
        }`}
      >
        <div
          className={`${showImage ? (light ? "bg-black/[0.04]" : "bg-black/40") : `cover-theme-${book.coverTheme}`} relative flex aspect-[0.5628] w-full items-center justify-center transition-transform duration-300 ease-out group-hover:scale-[1.035]`}
        >
          {showImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={book.coverImageUrl ?? undefined}
              alt={`Couverture de ${book.title}`}
              className="h-full w-full object-contain"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-5xl">{book.coverEmoji}</span>
          )}
          {/* A series takes one tile in a listing, badged with how many tomes it holds —
              tome 2, 3, 4 no longer each claim their own slot. */}
          {book.seriesCount != null && book.seriesCount > 1 && (
            <span className="pointer-events-none absolute left-2 top-2 rounded-md bg-black/75 px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
              {`Série · ${book.seriesCount} tomes`}
            </span>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/80 to-transparent p-3 text-center text-xs font-bold text-white opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
            Voir le livre →
          </div>
        </div>
      </div>
      <h3
        className={`mt-3 line-clamp-2 text-sm font-bold leading-snug ${light ? "text-[#1d1d1f]" : "text-white"}`}
      >
        {book.title}
      </h3>
      <p
        className={`mt-0.5 truncate text-xs font-medium ${light ? "text-[#6e6e73]" : "text-[color:var(--color-lumia-text-muted)]"}`}
      >
        {book.category}
      </p>
      {book.rating != null && (
        <p
          className={`mt-1 flex items-center gap-1 text-xs font-semibold ${light ? "text-[#6e6e73]" : "text-[color:var(--color-lumia-text-muted)]"}`}
        >
          <StarRating value={book.rating} size={11} className={light ? "text-[#1d1d1f]" : "text-white"} />
          {book.rating.toFixed(1)}
          {book.ratingCount ? ` (${book.ratingCount})` : ""}
        </p>
      )}
    </button>
  );
}
