"use client";

import { useState } from "react";
import BookCoverCard, { type CoverCardBook } from "./BookCoverCard";
import CoverLightbox, { type LightboxBook } from "./CoverLightbox";

export type GridBook = CoverCardBook & { backCoverImageUrl?: string | null };

export default function BookCoverGrid({
  books,
  light = false,
}: {
  books: GridBook[];
  light?: boolean;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))]">
        {books.map((book, i) => (
          <BookCoverCard
            key={book.id}
            book={book}
            light={light}
            animationDelayMs={Math.min(i, 10) * 40}
            onOpen={() => setLightboxIndex(i)}
          />
        ))}
      </div>

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
    </>
  );
}
