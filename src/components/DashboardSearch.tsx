"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type SearchBook = {
  id: string;
  slug: string;
  title: string;
  category: string;
  author: string;
  coverEmoji: string;
  coverTheme: string;
  coverImageUrl?: string | null;
};

export default function DashboardSearch({ books }: { books: SearchBook[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const categories = Array.from(new Set(books.map((b) => b.category))).slice(0, 10);

  const q = query.trim().toLowerCase();
  const results = q
    ? books
        .filter((b) => [b.title, b.category, b.author].some((f) => f.toLowerCase().includes(q)))
        .slice(0, 8)
    : [];

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function openSearch() {
    setOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function closeSearch() {
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={containerRef} className="relative">
      {!open ? (
        <button
          type="button"
          onClick={openSearch}
          aria-label="Rechercher"
          className="text-lg text-[#6e6e73] transition hover:text-[#1d1d1f]"
        >
          🔍
        </button>
      ) : (
        <div className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 shadow-sm">
          <span className="text-sm text-[#6e6e73]">🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Titres, catégories, auteurs..."
            className="w-40 bg-transparent text-sm text-[#1d1d1f] outline-none placeholder:text-[#a1a1a6] sm:w-64"
          />
          <button
            type="button"
            onClick={closeSearch}
            aria-label="Fermer la recherche"
            className="text-sm text-[#6e6e73] hover:text-[#1d1d1f]"
          >
            ✕
          </button>
        </div>
      )}

      {open && (
        <div className="absolute right-0 top-full z-30 mt-3 w-[min(90vw,420px)] rounded-2xl border border-black/5 bg-white p-4 shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
          {!q ? (
            <>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#a1a1a6]">
                Parcourir par catégorie
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setQuery(c)}
                    className="rounded-full bg-[#f5f5f7] px-3 py-1.5 text-xs font-semibold text-[#1d1d1f] transition hover:bg-[#ebebef]"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </>
          ) : results.length === 0 ? (
            <p className="py-3 text-center text-sm text-[#6e6e73]">{`Aucun résultat pour « ${query} »`}</p>
          ) : (
            <div className="flex flex-col gap-1">
              {results.map((book) => (
                <Link
                  key={book.id}
                  href={`/ebooks/${book.slug}`}
                  onClick={closeSearch}
                  className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-[#f5f5f7]"
                >
                  <span
                    className={`${book.coverImageUrl ? "" : `cover-theme-${book.coverTheme}`} relative flex h-12 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md text-base`}
                  >
                    {book.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={book.coverImageUrl} alt="" className="h-full w-full object-contain" />
                    ) : (
                      book.coverEmoji
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-[#1d1d1f]">{book.title}</span>
                    <span className="block truncate text-xs text-[#6e6e73]">{book.category}</span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
