"use client";

import { useRef } from "react";
import Link from "next/link";

type ContinueBook = {
  id: string;
  slug: string;
  title: string;
  coverEmoji: string;
  coverTheme: string;
  coverImageUrl?: string | null;
};

export default function ContinueReadingRow({
  profileId,
  books,
}: {
  profileId: string;
  books: { ebook: ContinueBook; percent: number }[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollBy(amount: number) {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  }

  return (
    <div className="group/row relative">
      <div
        ref={scrollRef}
        className="scrollbar-hide -mx-6 flex snap-x gap-4 overflow-x-auto px-6 pb-1 sm:-mx-10 sm:px-10"
      >
        {books.map(({ ebook, percent }) => (
          <div
            key={ebook.id}
            className="ibook-card flex w-64 shrink-0 snap-start flex-col gap-3 rounded-2xl p-4 sm:w-72"
          >
            <div className="flex items-center gap-3">
              <span
                className={`${ebook.coverImageUrl ? "" : `cover-theme-${ebook.coverTheme}`} relative flex h-16 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg text-xl`}
              >
                {ebook.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ebook.coverImageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  ebook.coverEmoji
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-[#1d1d1f]">{ebook.title}</p>
                <p className="text-xs font-bold text-[#5b3df0]">{`${percent}% terminé`}</p>
              </div>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full ibook-progress-track">
              <div className="h-full ibook-progress-fill" style={{ width: `${percent}%` }} />
            </div>
            <Link
              href={`/p/${profileId}/read/${ebook.slug}`}
              className="rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-4 py-2 text-center text-sm font-bold text-white transition hover:-translate-y-0.5"
            >
              Continuer →
            </Link>
          </div>
        ))}
      </div>

      {books.length > 2 && (
        <>
          <button
            type="button"
            onClick={() => scrollBy(-(scrollRef.current?.clientWidth ?? 0) * 0.8)}
            aria-label="Voir précédent"
            className="absolute inset-y-0 left-0 z-10 hidden w-12 items-center justify-start rounded-r-2xl bg-gradient-to-r from-[#f5f5f7] to-transparent pl-2 text-2xl text-[#1d1d1f] opacity-0 transition-opacity duration-200 group-hover/row:opacity-100 sm:flex"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => scrollBy((scrollRef.current?.clientWidth ?? 0) * 0.8)}
            aria-label="Voir plus"
            className="absolute inset-y-0 right-0 z-10 hidden w-12 items-center justify-end rounded-l-2xl bg-gradient-to-l from-[#f5f5f7] to-transparent pr-2 text-2xl text-[#1d1d1f] opacity-0 transition-opacity duration-200 group-hover/row:opacity-100 sm:flex"
          >
            ›
          </button>
        </>
      )}
    </div>
  );
}
