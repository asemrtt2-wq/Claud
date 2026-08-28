"use client";

import { useState } from "react";
import Link from "next/link";

type CategoryBook = {
  id: string;
  slug: string;
  title: string;
  coverEmoji: string;
  coverTheme: string;
  coverImageUrl?: string | null;
};

export type CategoryGroup = {
  name: string;
  books: CategoryBook[];
};

export default function CategoryAccordion({ categories }: { categories: CategoryGroup[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-3">
      {categories.map((cat, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={cat.name} className="ibook-card overflow-hidden rounded-2xl">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex w-full items-center justify-between px-5 py-4 text-left"
            >
              <span className="text-sm font-bold text-[#1d1d1f]">{cat.name}</span>
              <span className="flex items-center gap-2 text-xs font-semibold text-[#6e6e73]">
                {cat.books.length} livre{cat.books.length > 1 ? "s" : ""}
                <span className={`inline-block transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
                  ⌄
                </span>
              </span>
            </button>
            {isOpen && (
              <div className="grid grid-cols-3 gap-4 border-t border-black/5 px-5 py-5 sm:grid-cols-4 md:grid-cols-6">
                {cat.books.map((book) => (
                  <Link key={book.id} href={`/ebooks/${book.slug}`} className="group">
                    <div
                      className={`${book.coverImageUrl ? "" : `cover-theme-${book.coverTheme}`} relative mb-2 flex aspect-[0.5628] w-full items-center justify-center overflow-hidden rounded-xl text-2xl transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_14px_28px_rgba(0,0,0,0.18)]`}
                    >
                      {book.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={book.coverImageUrl} alt="" className="h-full w-full object-contain" />
                      ) : (
                        book.coverEmoji
                      )}
                    </div>
                    <p className="truncate text-xs font-semibold text-[#1d1d1f]">{book.title}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
