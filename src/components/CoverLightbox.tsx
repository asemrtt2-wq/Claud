"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export type LightboxBook = {
  slug: string;
  title: string;
  category?: string;
  coverEmoji: string;
  coverTheme: string;
  coverImageUrl?: string | null;
  backCoverImageUrl?: string | null;
};

export default function CoverLightbox({
  books,
  index,
  onClose,
  onNavigate,
  hideViewLink = false,
}: {
  books: LightboxBook[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
  hideViewLink?: boolean;
}) {
  const [showBack, setShowBack] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const book = books[index];

  useEffect(() => {
    setShowBack(false);
  }, [index]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft" && books.length > 1) {
        onNavigate((index - 1 + books.length) % books.length);
      } else if (e.key === "ArrowRight" && books.length > 1) {
        onNavigate((index + 1) % books.length);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [index, books.length, onClose, onNavigate]);

  if (!book) return null;

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 50 || books.length <= 1) return;
    if (delta > 0) onNavigate((index - 1 + books.length) % books.length);
    else onNavigate((index + 1) % books.length);
  }

  const activeImage = showBack ? book.backCoverImageUrl : book.coverImageUrl;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/85 p-4 backdrop-blur-md"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer"
        className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-xl text-white backdrop-blur transition hover:bg-white/20 sm:right-6 sm:top-6"
      >
        ✕
      </button>

      {books.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => onNavigate((index - 1 + books.length) % books.length)}
            aria-label="Livre précédent"
            className="absolute left-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white backdrop-blur transition hover:bg-white/20 sm:left-6"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => onNavigate((index + 1) % books.length)}
            aria-label="Livre suivant"
            className="absolute right-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white backdrop-blur transition hover:bg-white/20 sm:right-6"
          >
            ›
          </button>
        </>
      )}

      <div className="flex max-h-[78vh] max-w-[90vw] flex-col items-center">
        {activeImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={activeImage}
            alt={`Couverture de ${book.title}`}
            className="max-h-[78vh] w-auto rounded-xl object-contain shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
          />
        ) : (
          <div
            className={`cover-theme-${book.coverTheme} flex h-[60vh] w-[42vh] items-center justify-center rounded-xl text-8xl shadow-[0_30px_80px_rgba(0,0,0,0.6)]`}
          >
            {book.coverEmoji}
          </div>
        )}

        {book.backCoverImageUrl && (
          <button
            type="button"
            onClick={() => setShowBack((v) => !v)}
            className="mt-4 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-bold text-white transition hover:border-white/40"
          >
            {showBack ? "↺ Voir le recto" : "↻ Voir le verso"}
          </button>
        )}
      </div>

      <div className="relative z-10 mt-5 flex flex-col items-center text-center">
        <h3 className="text-lg font-extrabold text-white">{book.title}</h3>
        {book.category && (
          <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-white/50">
            {book.category}
          </p>
        )}
        {books.length > 1 && (
          <p className="mt-1 text-xs text-white/40">{`${index + 1} / ${books.length}`}</p>
        )}
        {!hideViewLink && (
          <Link
            href={`/ebooks/${book.slug}`}
            className="mt-4 rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-6 py-2.5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(124,92,255,0.4)] transition hover:-translate-y-0.5"
          >
            Voir la fiche →
          </Link>
        )}
      </div>
    </div>
  );
}
