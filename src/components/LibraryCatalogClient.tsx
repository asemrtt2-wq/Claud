"use client";

import { useMemo, useState } from "react";
import BookCoverCard, { type CoverCardBook } from "./BookCoverCard";
import CoverLightbox, { type LightboxBook } from "./CoverLightbox";

export type LibraryBook = CoverCardBook & {
  subtitle: string;
  author: string;
  backCoverImageUrl?: string | null;
  price: number;
  oldPrice: number | null;
  readingMinutes: number | null;
  hasAccess: boolean;
  href: string;
  isBestseller: boolean;
};

export type LibrarySection = {
  key: string;
  label: string;
  tagline?: string | null;
  books: LibraryBook[];
};

function toLightboxBook(book: LibraryBook): LightboxBook {
  return {
    slug: book.slug,
    title: book.title,
    category: book.category,
    coverEmoji: book.coverEmoji,
    coverTheme: book.coverTheme,
    coverImageUrl: book.coverImageUrl,
    backCoverImageUrl: book.backCoverImageUrl,
  };
}

function BookGrid({
  books,
  light,
  onOpen,
}: {
  books: LibraryBook[];
  light: boolean;
  onOpen: (books: LibraryBook[], index: number) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))]">
      {books.map((book, i) => (
        <BookCoverCard
          key={book.id}
          book={book}
          light={light}
          animationDelayMs={Math.min(i, 10) * 40}
          onOpen={() => onOpen(books, i)}
        />
      ))}
    </div>
  );
}

// A tight, fixed-width horizontal shelf (Apple Books "Reading Now" style) — used for
// the curated catalog shelves, where a shelf with only 1-2 books would otherwise sit
// inside a wrapping grid that reserves the full row width and reads as mostly empty.
// BookGrid (above) stays for the search results and the full catalog, where many
// items genuinely fill the width and wrapping into rows makes sense.
function BookShelf({
  books,
  light,
  onOpen,
}: {
  books: LibraryBook[];
  light: boolean;
  onOpen: (books: LibraryBook[], index: number) => void;
}) {
  return (
    <div className="scrollbar-hide -mx-6 flex snap-x gap-4 overflow-x-auto px-6 pb-1 sm:-mx-10 sm:gap-5 sm:px-10">
      {books.map((book, i) => (
        <div key={book.id} className="w-28 shrink-0 snap-start sm:w-36">
          <BookCoverCard
            book={book}
            light={light}
            animationDelayMs={Math.min(i, 10) * 40}
            onOpen={() => onOpen(books, i)}
          />
        </div>
      ))}
    </div>
  );
}

export default function LibraryCatalogClient({
  sections,
  allBooks,
  light = false,
}: {
  sections: LibrarySection[];
  allBooks: LibraryBook[];
  light?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [lightbox, setLightbox] = useState<{ books: LibraryBook[]; index: number } | null>(null);

  const normalizedQuery = query.trim().toLowerCase();

  // Category stays searchable (typing "philosophie" still matches) even though it's
  // no longer shown as its own browsing pill/section.
  const searchResults = useMemo(() => {
    if (!normalizedQuery) return null;
    return allBooks.filter((b) =>
      [b.title, b.subtitle, b.category, b.author]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(normalizedQuery))
    );
  }, [normalizedQuery, allBooks]);

  function openLightbox(books: LibraryBook[], index: number) {
    setLightbox({ books, index });
  }

  const heading = light ? "text-[#1d1d1f]" : "text-white";
  const muted = light ? "text-[#6e6e73]" : "text-[color:var(--color-lumina-text-muted)]";
  const link = light ? "text-[#5b3df0]" : "text-[#a78bfa]";
  const searchWrap = light
    ? "border-black/10 bg-black/[0.03] text-[#1d1d1f] placeholder:text-black/35 focus:border-[#7c5cff]"
    : "border-white/10 bg-white/[0.04] text-white placeholder:text-white/40 focus:border-[#7c5cff]";
  const searchIcon = light ? "text-black/30" : "text-white/40";

  return (
    <div>
      <div className="mb-10">
        <div className="relative">
          <span className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${searchIcon}`}>
            🔍
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un titre, un auteur, une catégorie…"
            className={`w-full rounded-2xl border py-3.5 pl-11 pr-4 text-sm outline-none transition ${searchWrap}`}
          />
        </div>
      </div>

      {searchResults ? (
        <section>
          <div className="mb-5 flex items-center justify-between">
            <p className={`text-sm font-semibold ${muted}`}>
              {searchResults.length} résultat{searchResults.length > 1 ? "s" : ""}
            </p>
            <button
              type="button"
              onClick={() => setQuery("")}
              className={`text-sm font-bold hover:underline ${link}`}
            >
              ✕ Réinitialiser
            </button>
          </div>
          {searchResults.length > 0 ? (
            <BookGrid books={searchResults} light={light} onOpen={openLightbox} />
          ) : (
            <p className={`text-sm ${muted}`}>Aucun livre ne correspond à ta recherche.</p>
          )}
        </section>
      ) : (
        <div className="flex flex-col gap-14">
          {sections.map((section) => (
            <section key={section.key}>
              <div className="mb-5">
                <h2 className={`text-lg font-extrabold ${heading}`}>{section.label}</h2>
                {section.tagline && (
                  <p className="lumina-gold-text mt-0.5 text-xs italic">{section.tagline}</p>
                )}
              </div>
              <BookShelf books={section.books} light={light} onOpen={openLightbox} />
            </section>
          ))}

          <section>
            <h2 className={`mb-5 text-lg font-extrabold ${heading}`}>Tous les livres</h2>
            <BookGrid books={allBooks} light={light} onOpen={openLightbox} />
          </section>
        </div>
      )}

      {lightbox && (
        <CoverLightbox
          books={lightbox.books.map(toLightboxBook)}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
          onNavigate={(index) => setLightbox({ books: lightbox.books, index })}
        />
      )}
    </div>
  );
}
