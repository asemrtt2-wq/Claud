"use client";

import { useMemo, useState } from "react";
import { getCategoryGroup } from "@/lib/categoryGroups";
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
  onOpen,
}: {
  books: LibraryBook[];
  onOpen: (books: LibraryBook[], index: number) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))]">
      {books.map((book, i) => (
        <BookCoverCard
          key={book.id}
          book={book}
          animationDelayMs={Math.min(i, 10) * 40}
          onOpen={() => onOpen(books, i)}
        />
      ))}
    </div>
  );
}

export default function LibraryCatalogClient({
  sections,
  allBooks,
  categories,
}: {
  sections: LibrarySection[];
  allBooks: LibraryBook[];
  categories: string[];
}) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{ books: LibraryBook[]; index: number } | null>(null);

  const normalizedQuery = query.trim().toLowerCase();

  const searchResults = useMemo(() => {
    if (!normalizedQuery) return null;
    return allBooks.filter((b) =>
      [b.title, b.subtitle, b.category, b.author]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(normalizedQuery))
    );
  }, [normalizedQuery, allBooks]);

  const filterResults = useMemo(() => {
    if (normalizedQuery || !activeFilter) return null;
    if (activeFilter.startsWith("catalog:")) {
      const name = activeFilter.slice("catalog:".length);
      return sections.find((s) => s.key === `catalog:${name}`)?.books ?? [];
    }
    return allBooks.filter((b) => getCategoryGroup(b.category) === activeFilter);
  }, [normalizedQuery, activeFilter, allBooks, sections]);

  const flatResults = searchResults ?? filterResults;

  function openLightbox(books: LibraryBook[], index: number) {
    setLightbox({ books, index });
  }

  const catalogSections = sections.filter((s) => s.key.startsWith("catalog:"));
  const categorySections = sections.filter((s) => !s.key.startsWith("catalog:"));

  return (
    <div>
      <div className="mb-6">
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
            🔍
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un titre, un auteur, une catégorie…"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-[#7c5cff]"
          />
        </div>
      </div>

      <div className="scrollbar-hide mb-10 flex flex-nowrap gap-2.5 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveFilter(null)}
          className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition ${
            !activeFilter
              ? "border-[#7c5cff] bg-[#7c5cff]/15 text-white"
              : "border-white/15 text-white/80 hover:border-[#a78bfa] hover:text-white"
          }`}
        >
          Tous
        </button>
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveFilter(category)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition ${
              activeFilter === category
                ? "border-[#7c5cff] bg-[#7c5cff]/15 text-white"
                : "border-white/15 text-white/80 hover:border-[#a78bfa] hover:text-white"
            }`}
          >
            {category}
          </button>
        ))}
        {catalogSections.map((section) => {
          const key = `catalog:${section.label}`;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveFilter(key)}
              className={`lumina-gold-text shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition ${
                activeFilter === key
                  ? "border-[#d4af37] bg-[#d4af37]/10"
                  : "border-[#d4af37]/30 hover:border-[#d4af37]"
              }`}
            >
              ✦ {section.label}
            </button>
          );
        })}
      </div>

      {flatResults ? (
        <section>
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm font-semibold text-[color:var(--color-lumina-text-muted)]">
              {flatResults.length} résultat{flatResults.length > 1 ? "s" : ""}
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActiveFilter(null);
              }}
              className="text-sm font-bold text-[#a78bfa] hover:underline"
            >
              ✕ Réinitialiser
            </button>
          </div>
          {flatResults.length > 0 ? (
            <BookGrid books={flatResults} onOpen={openLightbox} />
          ) : (
            <p className="text-sm text-[color:var(--color-lumina-text-muted)]">
              Aucun livre ne correspond à ta recherche.
            </p>
          )}
        </section>
      ) : (
        <div className="flex flex-col gap-14">
          {catalogSections.map((section) => (
            <section key={section.key}>
              <div className="mb-5">
                <h2 className="text-lg font-extrabold text-white">{section.label}</h2>
                {section.tagline && (
                  <p className="lumina-gold-text mt-0.5 text-xs italic">{section.tagline}</p>
                )}
              </div>
              <BookGrid books={section.books} onOpen={openLightbox} />
            </section>
          ))}
          {categorySections.map((section) => (
            <section key={section.key}>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-white">{section.label}</h2>
                <button
                  type="button"
                  onClick={() => setActiveFilter(section.label)}
                  className="text-sm font-bold text-[#a78bfa] hover:underline"
                >
                  Voir tout →
                </button>
              </div>
              <BookGrid books={section.books.slice(0, 5)} onOpen={openLightbox} />
            </section>
          ))}
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
