"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { saveReadingProgress } from "@/lib/customerActions";

const FONT_SIZES = ["text-base", "text-lg", "text-xl"];

export default function Reader({
  ebookId,
  slug,
  title,
  pages,
  initialPage,
}: {
  ebookId: string;
  slug: string;
  title: string;
  pages: string[];
  initialPage: number;
}) {
  const [page, setPage] = useState(Math.min(initialPage, pages.length - 1));
  const [dark, setDark] = useState(false);
  const [fontSizeIndex, setFontSizeIndex] = useState(1);

  useEffect(() => {
    saveReadingProgress(ebookId, page);
  }, [ebookId, page]);

  const progress = Math.round(((page + 1) / pages.length) * 100);

  return (
    <div className={dark ? "min-h-screen bg-navy-dark text-white" : "min-h-screen bg-white text-navy"}>
      <div
        className={`flex items-center justify-between border-b px-6 py-4 ${
          dark ? "border-white/10" : "border-gray-mid"
        }`}
      >
        <Link
          href={`/ebooks/${slug}`}
          className={`text-sm font-semibold ${dark ? "text-white/70 hover:text-white" : "text-text-muted hover:text-navy"}`}
        >
          ← {title}
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFontSizeIndex((i) => Math.max(0, i - 1))}
            className={`h-8 w-8 rounded-lg border text-sm font-bold ${dark ? "border-white/20" : "border-gray-mid"}`}
          >
            A-
          </button>
          <button
            onClick={() => setFontSizeIndex((i) => Math.min(FONT_SIZES.length - 1, i + 1))}
            className={`h-8 w-8 rounded-lg border text-sm font-bold ${dark ? "border-white/20" : "border-gray-mid"}`}
          >
            A+
          </button>
          <button
            onClick={() => setDark((d) => !d)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-bold ${dark ? "border-white/20" : "border-gray-mid"}`}
          >
            {dark ? "☀️ Clair" : "🌙 Sombre"}
          </button>
        </div>
      </div>

      <div className={`h-1 w-full ${dark ? "bg-white/10" : "bg-gray-mid"}`}>
        <div
          className="h-1 bg-gradient-to-r from-royal to-[#3a6bff] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mx-auto max-w-2xl px-6 py-16">
        <p
          className={`whitespace-pre-line leading-relaxed ${FONT_SIZES[fontSizeIndex]}`}
        >
          {pages[page]}
        </p>
      </div>

      <div
        className={`sticky bottom-0 flex items-center justify-between border-t px-6 py-4 ${
          dark ? "border-white/10 bg-navy-dark" : "border-gray-mid bg-white"
        }`}
      >
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="rounded-xl border border-gray-mid px-5 py-2.5 text-sm font-bold disabled:opacity-40"
        >
          ← Précédent
        </button>
        <span className={`text-sm font-semibold ${dark ? "text-white/60" : "text-text-muted"}`}>
          Page {page + 1} / {pages.length}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(pages.length - 1, p + 1))}
          disabled={page === pages.length - 1}
          className="rounded-xl bg-gradient-to-br from-royal to-[#3a6bff] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40"
        >
          Suivant →
        </button>
      </div>
    </div>
  );
}
