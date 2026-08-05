"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { saveReadingProgress, incrementAdultReadingMinutes } from "@/lib/customerActions";

const FONT_SIZES = ["text-base", "text-lg", "text-xl"];

export default function Reader({
  ebookId,
  slug,
  title,
  coverTheme,
  pages,
  initialPage,
}: {
  ebookId: string;
  slug: string;
  title: string;
  coverTheme: string;
  pages: string[];
  initialPage: number;
}) {
  const [page, setPage] = useState(Math.min(initialPage, pages.length - 1));
  const [immersive, setImmersive] = useState(true);
  const [fontSizeIndex, setFontSizeIndex] = useState(1);
  const [mode, setMode] = useState<"pages" | "scroll">("pages");
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollSaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    saveReadingProgress(ebookId, page);
  }, [ebookId, page]);

  useEffect(() => {
    const interval = setInterval(() => {
      incrementAdultReadingMinutes();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const ratio = el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight);
    const nextPage = Math.min(pages.length - 1, Math.max(0, Math.round(ratio * (pages.length - 1))));
    if (scrollSaveTimeout.current) clearTimeout(scrollSaveTimeout.current);
    scrollSaveTimeout.current = setTimeout(() => setPage(nextPage), 500);
  }

  const progress = Math.round(((page + 1) / pages.length) * 100);

  return (
    <div
      className={
        immersive
          ? `cover-theme-${coverTheme} relative min-h-screen text-white`
          : "min-h-screen bg-white text-navy"
      }
    >
      {immersive && <div className="pointer-events-none absolute inset-0 bg-black/45" />}

      <div className="relative z-10 flex items-center justify-between border-b border-white/10 px-6 py-4">
        <Link
          href={`/ebooks/${slug}`}
          className={`text-sm font-semibold ${immersive ? "text-white/70 hover:text-white" : "text-text-muted hover:text-navy"}`}
        >
          ← {title}
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFontSizeIndex((i) => Math.max(0, i - 1))}
            className={`h-8 w-8 rounded-lg border text-sm font-bold ${immersive ? "border-white/20" : "border-gray-mid"}`}
          >
            A-
          </button>
          <button
            onClick={() => setFontSizeIndex((i) => Math.min(FONT_SIZES.length - 1, i + 1))}
            className={`h-8 w-8 rounded-lg border text-sm font-bold ${immersive ? "border-white/20" : "border-gray-mid"}`}
          >
            A+
          </button>
          <button
            onClick={() => setImmersive((v) => !v)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-bold ${immersive ? "border-white/20" : "border-gray-mid"}`}
          >
            {immersive ? "☀️ Clair" : "🌙 Immersif"}
          </button>
          <button
            onClick={() => setMode((m) => (m === "pages" ? "scroll" : "pages"))}
            className={`rounded-lg border px-3 py-1.5 text-sm font-bold ${immersive ? "border-white/20" : "border-gray-mid"}`}
          >
            {mode === "pages" ? "📜 Défilement" : "📖 Pages"}
          </button>
        </div>
      </div>

      <div className={`relative z-10 h-1 w-full ${immersive ? "bg-white/10" : "bg-gray-mid"}`}>
        <div
          className="h-1 bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {mode === "pages" ? (
        <div className="relative z-10 mx-auto max-w-2xl px-6 py-16">
          <div
            className={`rounded-[22px] p-8 ${immersive ? "bg-black/40 backdrop-blur-sm" : ""}`}
          >
            <p
              className={`whitespace-pre-line leading-relaxed ${FONT_SIZES[fontSizeIndex]}`}
            >
              {pages[page]}
            </p>
          </div>
        </div>
      ) : (
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="relative z-10 mx-auto h-[70vh] max-w-2xl overflow-y-auto px-6 py-16"
        >
          <div
            className={`rounded-[22px] p-8 ${immersive ? "bg-black/40 backdrop-blur-sm" : ""}`}
          >
            <p
              className={`whitespace-pre-line leading-relaxed ${FONT_SIZES[fontSizeIndex]}`}
            >
              {pages.join("\n\n— • —\n\n")}
            </p>
          </div>
        </div>
      )}

      {mode === "pages" && (
        <div
          className={`sticky bottom-0 z-10 flex items-center justify-between border-t px-6 py-4 ${
            immersive ? "border-white/10 bg-black/50 backdrop-blur-sm" : "border-gray-mid bg-white"
          }`}
        >
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className={`rounded-xl border px-5 py-2.5 text-sm font-bold disabled:opacity-40 ${immersive ? "border-white/20" : "border-gray-mid"}`}
          >
            ← Précédent
          </button>
          <span className="text-sm font-semibold opacity-70">
            {page + 1} / {pages.length}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pages.length - 1, p + 1))}
            disabled={page === pages.length - 1}
            className="rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40"
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
  );
}
