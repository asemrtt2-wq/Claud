"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { saveChildReadingProgress, incrementReadingMinutes } from "@/lib/childActions";

const FONT_SIZES = ["text-lg", "text-xl", "text-2xl"];

const VOICES: Record<string, { emoji: string; label: string; pitch: number; rate: number }> = {
  femme: { emoji: "👩", label: "Femme", pitch: 1.15, rate: 1 },
  homme: { emoji: "👨", label: "Homme", pitch: 0.85, rate: 0.95 },
  robot: { emoji: "🤖", label: "Robot", pitch: 0.55, rate: 0.85 },
  alien: { emoji: "👽", label: "Alien", pitch: 1.9, rate: 1.25 },
  loup: { emoji: "🐺", label: "Loup", pitch: 0.5, rate: 0.8 },
  ours: { emoji: "🐻", label: "Ours", pitch: 0.35, rate: 0.75 },
};

export default function KidsReader({
  childId,
  ebookId,
  kidsHomeHref,
  title,
  coverTheme,
  pages,
  initialPage,
  initialLimitReached,
  dailyLimitMinutes,
}: {
  childId: string;
  ebookId: string;
  kidsHomeHref: string;
  title: string;
  coverTheme: string;
  pages: string[];
  initialPage: number;
  initialLimitReached: boolean;
  dailyLimitMinutes: number | null;
}) {
  const [page, setPage] = useState(Math.min(initialPage, pages.length - 1));
  const [fontSizeIndex, setFontSizeIndex] = useState(1);
  const [mode, setMode] = useState<"pages" | "scroll">("pages");
  const [mascotBounce, setMascotBounce] = useState(0);
  const [locked, setLocked] = useState(initialLimitReached);
  const [voiceKey, setVoiceKey] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollSaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setTtsSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  useEffect(() => {
    if (locked) return;
    saveChildReadingProgress(childId, ebookId, page);
    setMascotBounce((n) => n + 1);
  }, [childId, ebookId, page, locked]);

  useEffect(() => {
    if (locked) return;
    const interval = setInterval(async () => {
      const status = await incrementReadingMinutes(childId);
      if (status.limitReached) {
        setLocked(true);
        window.speechSynthesis?.cancel();
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [childId, locked]);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  function speak(text: string, key: string) {
    if (!ttsSupported) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voiceConfig = VOICES[key];
    utterance.lang = "fr-FR";
    utterance.pitch = voiceConfig.pitch;
    utterance.rate = voiceConfig.rate;
    const frenchVoice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith("fr"));
    if (frenchVoice) utterance.voice = frenchVoice;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setVoiceKey(key);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  function stopSpeaking() {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }

  function handleScroll() {
    const el = scrollRef.current;
    if (!el || locked) return;
    const ratio = el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight);
    const nextPage = Math.min(pages.length - 1, Math.max(0, Math.round(ratio * (pages.length - 1))));
    if (scrollSaveTimeout.current) clearTimeout(scrollSaveTimeout.current);
    scrollSaveTimeout.current = setTimeout(() => setPage(nextPage), 500);
  }

  const progress = Math.round(((page + 1) / pages.length) * 100);

  if (locked) {
    return (
      <div className={`cover-theme-${coverTheme} relative flex min-h-screen items-center justify-center p-6 text-white`}>
        <div className="absolute inset-0 bg-black/55" />
        <div className="lumina-card relative z-10 max-w-sm rounded-[26px] p-8 text-center">
          <p className="mb-4 text-5xl">⏱️</p>
          <h1 className="mb-2 text-xl font-extrabold">Temps de lecture atteint !</h1>
          <p className="mb-6 text-sm text-white/80">
            {`Tu as lu ${dailyLimitMinutes} minute${dailyLimitMinutes === 1 ? "" : "s"} aujourd'hui. Demande à un parent si tu veux continuer, ou reviens demain pour la suite de l'histoire !`}
          </p>
          <Link
            href={kidsHomeHref}
            className="inline-block rounded-2xl bg-white px-6 py-3 text-sm font-bold text-navy"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`cover-theme-${coverTheme} relative min-h-screen text-white`}>
      <div className="pointer-events-none absolute inset-0 bg-black/45" />

      <div className="relative z-10 flex items-center justify-between border-b border-white/10 px-5 py-4">
        <Link href={kidsHomeHref} className="text-sm font-bold text-white/80 hover:text-white">
          ← {title}
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFontSizeIndex((i) => Math.max(0, i - 1))}
            className="h-9 w-9 rounded-xl border border-white/20 text-sm font-bold"
          >
            A-
          </button>
          <button
            onClick={() => setFontSizeIndex((i) => Math.min(FONT_SIZES.length - 1, i + 1))}
            className="h-9 w-9 rounded-xl border border-white/20 text-sm font-bold"
          >
            A+
          </button>
          <button
            onClick={() => setMode((m) => (m === "pages" ? "scroll" : "pages"))}
            className="rounded-xl border border-white/20 px-3 py-2 text-xs font-bold"
          >
            {mode === "pages" ? "📜 Défilement" : "📖 Pages"}
          </button>
        </div>
      </div>

      <div className="relative z-10 h-1.5 w-full bg-white/10">
        <div
          className="h-1.5 bg-gradient-to-r from-[#ffb020] to-[#ff8a5c] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {ttsSupported && (
        <div className="relative z-10 flex flex-wrap items-center gap-2 px-5 py-3">
          <span className="text-xs font-bold text-white/70">🔊 Qui te lit l&apos;histoire ?</span>
          {Object.entries(VOICES).map(([key, v]) => (
            <button
              key={key}
              onClick={() => speak(pages[page], key)}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-base transition ${
                voiceKey === key && speaking ? "bg-[#ffb020]" : "bg-white/10 hover:bg-white/20"
              }`}
              title={v.label}
            >
              {v.emoji}
            </button>
          ))}
          {speaking && (
            <button
              onClick={stopSpeaking}
              className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold hover:bg-white/20"
            >
              ⏹ Stop
            </button>
          )}
        </div>
      )}

      <div className="relative z-10 mx-auto flex max-w-2xl justify-end px-6 pt-2">
        <span key={mascotBounce} className="mascot-bounce text-4xl">
          🦉
        </span>
      </div>

      {mode === "pages" ? (
        <div className="relative z-10 mx-auto max-w-2xl px-6 pb-24 pt-2">
          <div className="rounded-[26px] bg-black/40 p-8 backdrop-blur-sm">
            <p className={`whitespace-pre-line leading-relaxed ${FONT_SIZES[fontSizeIndex]}`}>
              {pages[page]}
            </p>
          </div>
        </div>
      ) : (
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="relative z-10 mx-auto h-[70vh] max-w-2xl overflow-y-auto px-6 pb-10 pt-2"
        >
          <div className="rounded-[26px] bg-black/40 p-8 backdrop-blur-sm">
            <p className={`whitespace-pre-line leading-relaxed ${FONT_SIZES[fontSizeIndex]}`}>
              {pages.join("\n\n— • —\n\n")}
            </p>
          </div>
        </div>
      )}

      {mode === "pages" && (
        <div className="sticky bottom-0 z-10 flex items-center justify-between border-t border-white/10 bg-black/50 px-5 py-4 backdrop-blur-sm">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-2xl border border-white/20 px-5 py-2.5 text-sm font-bold disabled:opacity-40"
          >
            ← Avant
          </button>
          <span className="text-sm font-bold opacity-70">
            {page + 1} / {pages.length}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pages.length - 1, p + 1))}
            disabled={page === pages.length - 1}
            className="rounded-2xl bg-gradient-to-br from-[#ffb020] to-[#ff8a5c] px-5 py-2.5 text-sm font-bold text-navy disabled:opacity-40"
          >
            Suite →
          </button>
        </div>
      )}
    </div>
  );
}
