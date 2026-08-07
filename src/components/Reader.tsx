"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { saveReadingProgress, incrementReadingMinutes } from "@/lib/profileActions";

const FONT_SIZES = ["text-base", "text-lg", "text-xl"];

export default function Reader({
  profileId,
  ebookId,
  slug,
  title,
  coverTheme,
  coverImageUrl,
  backCoverImageUrl,
  pages,
  initialPage,
  pdfUrl,
}: {
  profileId: string;
  ebookId: string;
  slug: string;
  title: string;
  coverTheme: string;
  coverImageUrl?: string | null;
  backCoverImageUrl?: string | null;
  pages: string[];
  initialPage: number;
  pdfUrl?: string | null;
}) {
  const frontOffset = coverImageUrl ? 1 : 0;
  const totalSlots = pages.length + frontOffset + (backCoverImageUrl ? 1 : 0);
  const startView = initialPage > 0 ? initialPage + frontOffset : 0;
  const [view, setView] = useState(Math.min(Math.max(startView, 0), totalSlots - 1));
  const [immersive, setImmersive] = useState(true);
  const [fontSizeIndex, setFontSizeIndex] = useState(1);
  const [mode, setMode] = useState<"pages" | "scroll">("pages");
  const [toolbarVisible, setToolbarVisible] = useState(true);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollSaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function scrollStep(dir: 1 | -1) {
    scrollRef.current?.scrollBy({ top: dir * scrollRef.current.clientHeight * 0.85, behavior: "smooth" });
  }

  function goToView(next: number) {
    setDirection(next > view ? "forward" : "backward");
    setView(next);
  }

  const isFrontCover = frontOffset === 1 && view === 0;
  const isBackCover = !!backCoverImageUrl && view === totalSlots - 1;
  const contentPage = Math.min(Math.max(view - frontOffset, 0), pages.length - 1);

  useEffect(() => {
    if (pdfUrl || isFrontCover || isBackCover) return;
    saveReadingProgress(profileId, ebookId, contentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId, ebookId, contentPage, pdfUrl, isFrontCover, isBackCover]);

  useEffect(() => {
    const interval = setInterval(() => {
      incrementReadingMinutes(profileId);
    }, 60000);
    return () => clearInterval(interval);
  }, [profileId]);

  if (pdfUrl) {
    return (
      <div className="flex h-screen flex-col bg-navy-dark text-white">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <Link href={`/p/${profileId}`} className="text-sm font-semibold text-white/70 hover:text-white">
            ← {title}
          </Link>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-white/20 px-3 py-1.5 text-sm font-bold hover:bg-white/10"
          >
            ⤢ Ouvrir dans un nouvel onglet
          </a>
        </div>
        <iframe src={pdfUrl} title={title} className="flex-1 border-0 bg-white" />
      </div>
    );
  }

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const ratio = el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight);
    const nextView = Math.min(totalSlots - 1, Math.max(0, Math.round(ratio * (totalSlots - 1))));
    if (scrollSaveTimeout.current) clearTimeout(scrollSaveTimeout.current);
    scrollSaveTimeout.current = setTimeout(() => setView(nextView), 500);
  }

  const progress = Math.round(((view + 1) / totalSlots) * 100);

  return (
    <div
      className={
        immersive
          ? `cover-theme-${coverTheme} relative min-h-screen text-white`
          : "min-h-screen bg-white text-navy"
      }
    >
      {immersive && <div className="pointer-events-none absolute inset-0 bg-black/45" />}

      <div
        className={`sticky top-0 z-20 overflow-hidden transition-[max-height] duration-300 ${
          toolbarVisible ? "max-h-24" : "max-h-0"
        }`}
      >
        <div
          className={`flex items-center justify-between border-b px-6 py-4 backdrop-blur-sm ${
            immersive ? "border-white/10 bg-black/50" : "border-gray-mid bg-white/90"
          }`}
        >
          <Link
            href={`/p/${profileId}`}
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
            <button
              onClick={() => setToolbarVisible(false)}
              aria-label="Masquer les commandes"
              className={`h-8 w-8 rounded-lg border text-sm font-bold ${immersive ? "border-white/20" : "border-gray-mid"}`}
            >
              ⌃
            </button>
          </div>
        </div>
        <div className={`h-1 w-full ${immersive ? "bg-white/10" : "bg-gray-mid"}`}>
          <div
            className="h-1 bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {!toolbarVisible && (
        <button
          type="button"
          onClick={() => setToolbarVisible(true)}
          aria-label="Afficher les commandes"
          className={`fixed left-1/2 top-3 z-20 flex h-8 w-10 -translate-x-1/2 items-center justify-center rounded-full text-sm font-bold shadow-lg backdrop-blur-sm ${
            immersive ? "bg-black/50 text-white" : "bg-white text-navy"
          }`}
        >
          ⌄
        </button>
      )}

      {mode === "pages" ? (
        isFrontCover || isBackCover ? (
          <div
            key={view}
            className={`relative z-10 mx-auto flex max-w-2xl justify-center px-6 py-16 ${
              direction === "forward" ? "page-turn-forward" : "page-turn-backward"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={(isFrontCover ? coverImageUrl : backCoverImageUrl) ?? undefined}
              alt={isFrontCover ? `Couverture de ${title}` : `Quatrième de couverture de ${title}`}
              className="max-h-[70vh] rounded-[18px] shadow-[0_30px_70px_rgba(0,0,0,0.5)]"
            />
          </div>
        ) : (
          <div
            key={view}
            className={`relative z-10 mx-auto max-w-2xl px-6 py-16 ${
              direction === "forward" ? "page-turn-forward" : "page-turn-backward"
            }`}
          >
            <div
              className={`rounded-[22px] p-8 ${immersive ? "bg-black/40 backdrop-blur-sm" : ""}`}
            >
              <p
                className={`whitespace-pre-line leading-relaxed ${FONT_SIZES[fontSizeIndex]}`}
              >
                {pages[contentPage]}
              </p>
            </div>
          </div>
        )
      ) : (
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="relative z-10 mx-auto h-[70vh] max-w-2xl overflow-y-auto px-6 py-16"
        >
          {coverImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverImageUrl}
              alt={`Couverture de ${title}`}
              className="mx-auto mb-10 max-h-[70vh] rounded-[18px] shadow-[0_30px_70px_rgba(0,0,0,0.5)]"
            />
          )}
          <div
            className={`rounded-[22px] p-8 ${immersive ? "bg-black/40 backdrop-blur-sm" : ""}`}
          >
            <p
              className={`whitespace-pre-line leading-relaxed ${FONT_SIZES[fontSizeIndex]}`}
            >
              {pages.join("\n\n— • —\n\n")}
            </p>
          </div>
          {backCoverImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={backCoverImageUrl}
              alt={`Quatrième de couverture de ${title}`}
              className="mx-auto mt-10 max-h-[70vh] rounded-[18px] shadow-[0_30px_70px_rgba(0,0,0,0.5)]"
            />
          )}
        </div>
      )}

      <div
        className={`sticky bottom-0 z-10 flex items-center justify-between border-t px-6 py-4 ${
          immersive ? "border-white/10 bg-black/50 backdrop-blur-sm" : "border-gray-mid bg-white"
        }`}
      >
        <button
          onClick={() => (mode === "pages" ? goToView(Math.max(0, view - 1)) : scrollStep(-1))}
          disabled={mode === "pages" && view === 0}
          className={`rounded-xl border px-5 py-2.5 text-sm font-bold disabled:opacity-40 ${immersive ? "border-white/20" : "border-gray-mid"}`}
        >
          ← Précédent
        </button>
        <span className="text-sm font-semibold opacity-70">
          {isFrontCover
            ? "Couverture"
            : isBackCover
              ? "Fin"
              : `${contentPage + 1} / ${pages.length}`}
          </span>
        <button
          onClick={() => (mode === "pages" ? goToView(Math.min(totalSlots - 1, view + 1)) : scrollStep(1))}
          disabled={mode === "pages" && view === totalSlots - 1}
          className="rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40"
        >
          Suivant →
        </button>
      </div>
    </div>
  );
}
