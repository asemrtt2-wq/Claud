"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  saveReadingProgress,
  incrementReadingMinutes,
  toggleFavorite,
  createHighlight,
  updateHighlightNote,
  deleteHighlight,
} from "@/lib/profileActions";
import BookRow from "@/components/BookRow";
import BookFlip, { type BookFlipHandle } from "@/components/BookFlip";

const FONT_SIZES = ["text-[17px]", "text-[19px]", "text-[21px]", "text-[23px]"];
const FONT_SIZE_PX = [17, 19, 21, 23];
const LINE_HEIGHTS = ["leading-[1.6]", "leading-[1.8]", "leading-[2]"];
const LINE_HEIGHT_LABELS = ["Compact", "Confort", "Aéré"];
const WIDTHS = ["max-w-[620px]", "max-w-[720px]", "max-w-[860px]"];
const WIDTH_LABELS = ["Étroit", "Confort", "Large"];
const THEME_LABELS: Record<Theme, string> = {
  clair: "Clair",
  sepia: "Sépia",
  sombre: "Sombre",
  immersive: "Immersif",
};
const SPEEDS = [0.75, 1, 1.25, 1.5];
const CHAPTER_RE = /^(Chapitre\s+\d+|Introduction)\s*(?:—|-|:)\s*(.+)$/i;

type Theme = "clair" | "sepia" | "sombre" | "immersive";
type Chapter = { number: number; title: string; pageIndex: number; estimatedMinutes: number };
type HighlightData = { id: string; page: number; text: string; note: string | null };
type RowBook = {
  id: string;
  slug: string;
  title: string;
  coverEmoji: string;
  coverTheme: string;
  coverImageUrl?: string | null;
};
type NextTome = {
  slug: string;
  title: string;
  coverEmoji: string;
  coverTheme: string;
  coverImageUrl?: string | null;
} | null;

function countWords(text: string) {
  return text.split(/\s+/).filter(Boolean).length;
}

/** Mirrors the marker-stripping renderBlock does, so the spoken text's word
 * order/count matches exactly what gets rendered/highlighted — no drift from
 * dropped "> "/"- " markers or the chapter heading's "—" separator. */
function getCleanedText(pageText: string): string {
  return pageText
    .split(/\n\n+/)
    .filter(Boolean)
    .map((block) => {
      const trimmed = block.trim();
      const chapterMatch = trimmed.match(CHAPTER_RE);
      if (chapterMatch) return `${chapterMatch[1]} ${chapterMatch[2]}`.trim();
      if (trimmed.startsWith("> ")) return trimmed.replace(/^>\s?/, "");
      const lines = trimmed.split("\n").filter(Boolean);
      if (lines.length > 0 && lines.every((l) => l.trim().startsWith("- "))) {
        return lines.map((l) => l.trim().replace(/^-\s?/, "")).join(". ");
      }
      return trimmed;
    })
    .join("\n\n");
}

function wordIndexAtCharIndex(text: string, charIndex: number): number {
  return text.slice(0, charIndex).split(/\s+/).filter(Boolean).length;
}

type RenderCtx = {
  highlights: HighlightData[];
  wordCounter: { current: number };
  activeWordIndex: number | null;
};

/** Tokenizes text into words, applying both a saved-highlight mark (yellow)
 * and the currently-spoken-word mark (purple) from the same pass, since a
 * word can be inside a saved highlight while also being read aloud. */
function renderTextWithMarks(text: string, ctx: RenderCtx): React.ReactNode[] {
  const ranges = ctx.highlights
    .map((h) => {
      const idx = text.indexOf(h.text);
      return idx === -1 ? null : { start: idx, end: idx + h.text.length, id: h.id };
    })
    .filter((r): r is { start: number; end: number; id: string } => r !== null)
    .sort((a, b) => a.start - b.start);

  const tokens = text.split(/(\s+)/);
  const nodes: React.ReactNode[] = [];
  let charPos = 0;

  tokens.forEach((tok, k) => {
    const tokStart = charPos;
    charPos += tok.length;
    if (tok === "" || /^\s+$/.test(tok)) {
      nodes.push(tok);
      return;
    }
    const wordIdx = ctx.wordCounter.current++;
    const isActive = ctx.activeWordIndex !== null && wordIdx === ctx.activeWordIndex;
    const inHighlight = ranges.some((r) => tokStart >= r.start && tokStart + tok.length <= r.end);
    if (!isActive && !inHighlight) {
      nodes.push(tok);
      return;
    }
    nodes.push(
      <span
        key={k}
        className={
          isActive
            ? "rounded bg-[#7c5cff] px-0.5 text-white"
            : "rounded bg-[#facc15]/35 px-0.5"
        }
      >
        {tok}
      </span>
    );
  });

  return nodes;
}

function renderBlock(block: string, key: number, ctx: RenderCtx) {
  const trimmed = block.trim();
  const chapterMatch = trimmed.match(CHAPTER_RE);
  if (chapterMatch) {
    ctx.wordCounter.current += countWords(`${chapterMatch[1]} ${chapterMatch[2]}`);
    return (
      <div key={key} className="mb-8 mt-2 first:mt-0">
        <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-50">{chapterMatch[1]}</p>
        <h2 className="mt-1 text-3xl font-extrabold tracking-tight">{chapterMatch[2].trim()}</h2>
        <div className="mt-4 h-px w-16 bg-current opacity-20" />
      </div>
    );
  }
  if (trimmed.startsWith("> ")) {
    const quoteText = trimmed.replace(/^>\s?/, "");
    return (
      <blockquote
        key={key}
        className="my-6 rounded-r-xl border-l-4 border-[#7c5cff] bg-current/5 py-3 pl-5 pr-4 italic"
      >
        {renderTextWithMarks(quoteText, ctx)}
      </blockquote>
    );
  }
  const lines = trimmed.split("\n").filter(Boolean);
  if (lines.length > 0 && lines.every((l) => l.trim().startsWith("- "))) {
    return (
      <ul key={key} className="my-6 space-y-2 pl-1">
        {lines.map((l, li) => (
          <li key={li} className="flex gap-3">
            <span className="mt-1 text-[#7c5cff]">●</span>
            <span>{renderTextWithMarks(l.trim().replace(/^-\s?/, ""), ctx)}</span>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <p key={key} className="mb-6 last:mb-0">
      {renderTextWithMarks(trimmed, ctx)}
    </p>
  );
}

function renderPageContent(text: string, highlights: HighlightData[], activeWordIndex: number | null) {
  const ctx: RenderCtx = { highlights, wordCounter: { current: 0 }, activeWordIndex };
  return text
    .split(/\n\n+/)
    .filter(Boolean)
    .map((block, i) => renderBlock(block, i, ctx));
}

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
  chapters = [],
  avgSecondsPerPage = null,
  initialFavorited = false,
  nextTome = null,
  similarBooks = [],
  initialHighlights = [],
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
  chapters?: Chapter[];
  avgSecondsPerPage?: number | null;
  initialFavorited?: boolean;
  nextTome?: NextTome;
  similarBooks?: RowBook[];
  initialHighlights?: HighlightData[];
}) {
  const frontOffset = coverImageUrl ? 1 : 0;
  const totalSlots = pages.length + frontOffset + (backCoverImageUrl ? 1 : 0);
  const startView = initialPage > 0 ? initialPage + frontOffset : 0;
  const [view, setView] = useState(Math.min(Math.max(startView, 0), totalSlots - 1));
  const [theme, setTheme] = useState<Theme>("immersive");
  const [fontSizeIndex, setFontSizeIndex] = useState(1);
  const [lineHeightIndex, setLineHeightIndex] = useState(1);
  const [widthIndex, setWidthIndex] = useState(1);
  const [fontFamily, setFontFamily] = useState<"sans" | "serif">("sans");
  const [mode, setMode] = useState<"pages" | "scroll">("pages");
  const [toolbarVisible, setToolbarVisible] = useState(true);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [panelOpen, setPanelOpen] = useState<"settings" | "toc" | "search" | "audio" | null>(null);
  const [tocTab, setTocTab] = useState<"chapters" | "bookmarks" | "highlights">("chapters");
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorited, setFavorited] = useState(initialFavorited);
  const [favoritePopping, setFavoritePopping] = useState(false);
  const [selection, setSelection] = useState<string | null>(null);
  const [isFavPending, startFavTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollSaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bookFlipRef = useRef<BookFlipHandle>(null);

  const [highlights, setHighlights] = useState<HighlightData[]>(initialHighlights);
  const [editingHighlightId, setEditingHighlightId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  const [listening, setListening] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [voiceURI, setVoiceURI] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState<number | null>(null);

  const dark = theme === "sombre" || theme === "immersive";
  const mutedTextClass = dark ? "text-white/60" : "text-black/50";

  const bookmarkKey = `lumina-bookmarks:${ebookId}:${profileId}`;
  useEffect(() => {
    try {
      const raw = localStorage.getItem(bookmarkKey);
      if (raw) setBookmarks(JSON.parse(raw));
    } catch {
      // ignore malformed/unavailable localStorage
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookmarkKey]);

  function persistBookmarks(next: number[]) {
    setBookmarks(next);
    try {
      localStorage.setItem(bookmarkKey, JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  function toggleBookmark(page: number) {
    persistBookmarks(
      bookmarks.includes(page) ? bookmarks.filter((p) => p !== page) : [...bookmarks, page].sort((a, b) => a - b)
    );
  }

  function handleToggleFavorite() {
    setFavorited((v) => !v);
    setFavoritePopping(true);
    startFavTransition(() => {
      toggleFavorite(profileId, ebookId, slug);
    });
  }

  useEffect(() => {
    function handleSelectionChange() {
      const sel = window.getSelection();
      const text = sel?.toString().trim() ?? "";
      setSelection(text.length > 0 && text.length < 600 ? text : null);
    }
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, []);

  async function handleCopyQuote() {
    if (!selection) return;
    try {
      await navigator.clipboard.writeText(`« ${selection} » — ${title}`);
    } catch {
      // clipboard unavailable, ignore
    }
    setSelection(null);
  }

  async function handleShareQuote() {
    if (!selection) return;
    const text = `« ${selection} » — ${title}`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // user cancelled share, ignore
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        // ignore
      }
    }
    setSelection(null);
  }

  async function handleSaveHighlight() {
    if (!selection) return;
    const text = selection;
    const page = contentPage;
    setSelection(null);
    const id = await createHighlight(profileId, ebookId, page, text);
    setHighlights((prev) => [...prev, { id, page, text, note: null }]);
  }

  async function handleSaveNote(id: string) {
    await updateHighlightNote(id, noteDraft);
    setHighlights((prev) => prev.map((h) => (h.id === id ? { ...h, note: noteDraft.trim() || null } : h)));
    setEditingHighlightId(null);
  }

  async function handleDeleteHighlight(id: string) {
    setHighlights((prev) => prev.filter((h) => h.id !== id));
    await deleteHighlight(id);
  }

  const highlightsByPage = useMemo(() => {
    const map = new Map<number, HighlightData[]>();
    for (const h of highlights) {
      const list = map.get(h.page) ?? [];
      list.push(h);
      map.set(h.page, list);
    }
    return map;
  }, [highlights]);

  function scrollStep(dir: 1 | -1) {
    scrollRef.current?.scrollBy({ top: dir * scrollRef.current.clientHeight * 0.85, behavior: "smooth" });
  }

  function goToView(next: number) {
    setDirection(next > view ? "forward" : "backward");
    setView(next);
    setPanelOpen(null);
  }

  const isFrontCover = frontOffset === 1 && view === 0;
  const isBackCover = !!backCoverImageUrl && view === totalSlots - 1;
  const isLastView = view === totalSlots - 1;
  const contentPage = Math.min(Math.max(view - frontOffset, 0), pages.length - 1);

  const frenchVoices = useMemo(
    () => availableVoices.filter((v) => v.lang.toLowerCase().startsWith("fr")),
    [availableVoices]
  );
  const voiceOptions = frenchVoices.length > 0 ? frenchVoices : availableVoices;

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    function loadVoices() {
      setAvailableVoices(window.speechSynthesis.getVoices());
    }
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  useEffect(() => {
    if (!listening || pdfUrl || isFrontCover || isBackCover) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const text = getCleanedText(pages[contentPage]);
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speechRate;
    utterance.lang = "fr-FR";
    const voice = voiceOptions.find((v) => v.voiceURI === voiceURI);
    if (voice) utterance.voice = voice;
    utterance.onboundary = (e) => {
      if (e.name && e.name !== "word") return;
      setCurrentWordIndex(wordIndexAtCharIndex(text, e.charIndex));
    };
    utterance.onend = () => {
      setCurrentWordIndex(null);
      setView((v) => {
        if (v < totalSlots - 1) {
          setDirection("forward");
          return v + 1;
        }
        setListening(false);
        return v;
      });
    };
    utterance.onerror = () => {
      setCurrentWordIndex(null);
      setListening(false);
    };
    window.speechSynthesis.speak(utterance);

    return () => {
      window.speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listening, view, speechRate, voiceURI]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    const results: { page: number; snippet: string }[] = [];
    pages.forEach((text, i) => {
      const idx = text.toLowerCase().indexOf(q);
      if (idx !== -1) {
        const start = Math.max(0, idx - 40);
        const end = Math.min(text.length, idx + q.length + 40);
        results.push({ page: i, snippet: text.slice(start, end).replace(/\s+/g, " ").trim() });
      }
    });
    return results.slice(0, 30);
  }, [searchQuery, pages]);

  const currentChapter = useMemo(() => {
    return [...chapters].reverse().find((c) => c.pageIndex <= contentPage) ?? null;
  }, [chapters, contentPage]);

  const remainingMinutes = useMemo(() => {
    if (isFrontCover || isBackCover) return null;
    const pagesLeft = pages.length - 1 - contentPage;
    if (pagesLeft <= 0) return 0;
    if (avgSecondsPerPage) {
      return Math.max(1, Math.round((avgSecondsPerPage * pagesLeft) / 60));
    }
    const wordsLeft = pages.slice(contentPage + 1).reduce((sum, p) => sum + countWords(p), 0);
    return Math.max(1, Math.round(wordsLeft / 200));
  }, [pages, contentPage, avgSecondsPerPage, isFrontCover, isBackCover]);

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
  const textClass = `${FONT_SIZES[fontSizeIndex]} ${LINE_HEIGHTS[lineHeightIndex]} ${
    fontFamily === "serif" ? "font-serif" : ""
  }`;
  const paperBg = theme === "sombre" ? "#1c1c1c" : theme === "sepia" ? "#F4ECD8" : "#FAFAF7";
  const paperText = theme === "sombre" ? "#e8e8e8" : theme === "sepia" ? "#3f2f1d" : "#1a1a1a";

  function renderBookPage(index: number) {
    return (
      <div className={textClass}>
        {renderPageContent(
          pages[index],
          highlightsByPage.get(index) ?? [],
          listening && index === contentPage ? currentWordIndex : null
        )}
      </div>
    );
  }

  function handleNext() {
    if (mode !== "pages") {
      scrollStep(1);
      return;
    }
    if (isFrontCover) {
      goToView(1);
      return;
    }
    if (isBackCover) return;
    bookFlipRef.current?.next();
  }

  function handlePrev() {
    if (mode !== "pages") {
      scrollStep(-1);
      return;
    }
    if (isBackCover) {
      goToView(totalSlots - 2);
      return;
    }
    if (isFrontCover) return;
    bookFlipRef.current?.prev();
  }

  const endOfBookBlock = isLastView ? (
    <div className={`mx-auto mt-12 ${WIDTHS[widthIndex]} rounded-[26px] p-8 text-center ${dark ? "bg-white/5" : "bg-black/5"}`}>
      <p className="text-3xl">🎉</p>
      <h3 className="mt-3 text-xl font-extrabold">{`Merci d'avoir lu « ${title} » !`}</h3>
      <p className={`mt-2 text-sm ${mutedTextClass}`}>On espère que cette lecture t&apos;a plu.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {nextTome && (
          <Link
            href={`/ebooks/${nextTome.slug}`}
            className="rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-5 py-2.5 text-sm font-bold text-white"
          >
            {`Tome suivant : ${nextTome.title} →`}
          </Link>
        )}
        <Link
          href={`/p/${profileId}`}
          className={`rounded-xl border px-5 py-2.5 text-sm font-bold ${dark ? "border-white/20" : "border-black/15"}`}
        >
          ← Retour à la bibliothèque
        </Link>
      </div>
      {similarBooks.length > 0 && (
        <div className="mt-8 text-left">
          <p className={`mb-3 text-sm font-semibold ${mutedTextClass}`}>Livres similaires</p>
          <BookRow label="" books={similarBooks} />
        </div>
      )}
    </div>
  ) : null;

  return (
    <div
      className={theme === "immersive" ? `cover-theme-${coverTheme} relative min-h-screen text-white` : "relative min-h-screen"}
      style={theme === "clair" ? { background: "#FAFAFA", color: "#181828" } : theme === "sepia" ? { background: "#F4ECD8", color: "#3f2f1d" } : theme === "sombre" ? { background: "#161616", color: "#e9e9ec" } : undefined}
    >
      {theme === "immersive" && <div className="pointer-events-none absolute inset-0 bg-black/45" />}

      <div
        className={`sticky top-0 z-20 overflow-hidden transition-[max-height] duration-300 ${
          toolbarVisible ? "max-h-36" : "max-h-0"
        }`}
      >
        <div
          className={`flex items-center justify-between border-b px-6 py-4 backdrop-blur-sm ${
            dark ? "border-white/10 bg-black/50" : "border-black/10 bg-white/70"
          }`}
        >
          <Link
            href={`/p/${profileId}`}
            className={`truncate text-sm font-semibold ${dark ? "text-white/70 hover:text-white" : "text-black/60 hover:text-black"}`}
          >
            ← {title}
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPanelOpen((p) => (p === "audio" ? null : "audio"))}
              aria-label="Lecture à voix haute"
              className={`h-8 w-8 rounded-lg border text-sm font-bold ${
                listening ? "border-[#7c5cff] bg-[#7c5cff]/20" : dark ? "border-white/20" : "border-black/15"
              }`}
            >
              🎧
            </button>
            <button
              onClick={() => setPanelOpen((p) => (p === "search" ? null : "search"))}
              aria-label="Rechercher dans le livre"
              className={`h-8 w-8 rounded-lg border text-sm font-bold ${dark ? "border-white/20" : "border-black/15"}`}
            >
              🔍
            </button>
            <button
              onClick={() => setPanelOpen((p) => (p === "toc" ? null : "toc"))}
              aria-label="Sommaire et signets"
              className={`h-8 w-8 rounded-lg border text-sm font-bold ${dark ? "border-white/20" : "border-black/15"}`}
            >
              📑
            </button>
            <button
              onClick={handleToggleFavorite}
              disabled={isFavPending}
              aria-label="Ajouter aux favoris"
              className={`h-8 w-8 rounded-lg border text-sm font-bold disabled:opacity-50 ${dark ? "border-white/20" : "border-black/15"}`}
            >
              <span
                className={favoritePopping ? "heart-pop inline-block" : "inline-block"}
                onAnimationEnd={() => setFavoritePopping(false)}
              >
                {favorited ? "❤️" : "🤍"}
              </span>
            </button>
            <button
              onClick={() => setPanelOpen((p) => (p === "settings" ? null : "settings"))}
              aria-label="Réglages de lecture"
              className={`h-8 w-8 rounded-lg border font-serif text-sm font-bold ${dark ? "border-white/20" : "border-black/15"}`}
            >
              Aa
            </button>
            <button
              onClick={() => setMode((m) => (m === "pages" ? "scroll" : "pages"))}
              className={`rounded-lg border px-3 py-1.5 text-sm font-bold ${dark ? "border-white/20" : "border-black/15"}`}
            >
              {mode === "pages" ? "📜 Défilement" : "📖 Pages"}
            </button>
            <button
              onClick={() => {
                setToolbarVisible(false);
                setPanelOpen(null);
              }}
              aria-label="Masquer les commandes"
              className={`h-8 w-8 rounded-lg border text-sm font-bold ${dark ? "border-white/20" : "border-black/15"}`}
            >
              ⌃
            </button>
          </div>
        </div>
        {!isFrontCover && !isBackCover && (
          <div className={`flex items-center justify-between px-6 pb-2 pt-2 text-xs font-semibold ${mutedTextClass}`}>
            <span className="truncate">{currentChapter ? currentChapter.title : title}</span>
            <span className="shrink-0">
              {remainingMinutes !== null ? `${progress}% · ~${remainingMinutes} min restantes` : `${progress}%`}
            </span>
          </div>
        )}
        <div className={`h-1 w-full ${dark ? "bg-white/10" : "bg-black/10"}`}>
          <div
            className="h-1 bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] transition-all duration-500"
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
            dark ? "bg-black/50 text-white" : "bg-white text-navy"
          }`}
        >
          ⌄
        </button>
      )}

      {panelOpen && (
        <div
          className={`fixed right-6 top-20 z-30 max-h-[75vh] w-[min(92vw,340px)] overflow-y-auto rounded-2xl border p-5 text-sm shadow-2xl backdrop-blur-md ${
            dark ? "border-white/10 bg-[#14122a]/95 text-white" : "border-black/10 bg-white/95 text-[#181828]"
          }`}
        >
          {panelOpen === "audio" && (
            <div className="space-y-5">
              <div>
                <p className="mb-2 font-bold">Lecture à voix haute</p>
                <p className={`mb-3 text-xs ${mutedTextClass}`}>
                  Voix et surlignage des mots via la synthèse vocale de ton navigateur — la
                  précision du surlignage dépend de la voix utilisée.
                </p>
                <button
                  onClick={() => setListening((v) => !v)}
                  className="w-full rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-4 py-2.5 text-center text-sm font-bold text-white"
                >
                  {listening ? "⏸ Arrêter la lecture" : "▶️ Écouter cette page"}
                </button>
              </div>
              {voiceOptions.length > 0 && (
                <div>
                  <p className="mb-2 font-bold">Voix</p>
                  <select
                    value={voiceURI ?? voiceOptions[0]?.voiceURI ?? ""}
                    onChange={(e) => setVoiceURI(e.target.value)}
                    className={`w-full rounded-xl border px-3 py-2 text-xs ${
                      dark ? "border-white/15 bg-white/5 text-white" : "border-black/10 bg-black/5"
                    }`}
                  >
                    {voiceOptions.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI} className="text-black">
                        {`${v.name} (${v.lang})`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <p className="mb-2 font-bold">Vitesse</p>
                <div className="grid grid-cols-4 gap-2">
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSpeechRate(s)}
                      className={`rounded-xl border py-2 text-xs font-bold ${
                        speechRate === s
                          ? "border-[#7c5cff] bg-[#7c5cff]/10"
                          : dark
                            ? "border-white/15"
                            : "border-black/10"
                      }`}
                    >
                      {`${s}×`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {panelOpen === "settings" && (
            <div className="space-y-5">
              <div>
                <p className="mb-2 font-bold">Thème</p>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(THEME_LABELS) as Theme[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`rounded-xl border py-2 text-xs font-bold ${
                        theme === t
                          ? "border-[#7c5cff] bg-[#7c5cff]/10"
                          : dark
                            ? "border-white/15"
                            : "border-black/10"
                      }`}
                    >
                      {THEME_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 font-bold">Police</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFontFamily("sans")}
                    className={`rounded-xl border py-2 text-xs font-bold ${
                      fontFamily === "sans" ? "border-[#7c5cff] bg-[#7c5cff]/10" : dark ? "border-white/15" : "border-black/10"
                    }`}
                  >
                    Sans-serif
                  </button>
                  <button
                    onClick={() => setFontFamily("serif")}
                    className={`rounded-xl border py-2 text-xs font-bold font-serif ${
                      fontFamily === "serif" ? "border-[#7c5cff] bg-[#7c5cff]/10" : dark ? "border-white/15" : "border-black/10"
                    }`}
                  >
                    Serif
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold">Taille du texte</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFontSizeIndex((i) => Math.max(0, i - 1))}
                    className={`h-8 w-8 rounded-lg border text-xs font-bold ${dark ? "border-white/20" : "border-black/15"}`}
                  >
                    A-
                  </button>
                  <span className="w-10 text-center text-xs opacity-70">{FONT_SIZE_PX[fontSizeIndex]}px</span>
                  <button
                    onClick={() => setFontSizeIndex((i) => Math.min(FONT_SIZES.length - 1, i + 1))}
                    className={`h-8 w-8 rounded-lg border text-xs font-bold ${dark ? "border-white/20" : "border-black/15"}`}
                  >
                    A+
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold">Interligne</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLineHeightIndex((i) => Math.max(0, i - 1))}
                    className={`h-8 w-8 rounded-lg border text-xs font-bold ${dark ? "border-white/20" : "border-black/15"}`}
                  >
                    −
                  </button>
                  <span className="w-16 text-center text-xs opacity-70">{LINE_HEIGHT_LABELS[lineHeightIndex]}</span>
                  <button
                    onClick={() => setLineHeightIndex((i) => Math.min(LINE_HEIGHTS.length - 1, i + 1))}
                    className={`h-8 w-8 rounded-lg border text-xs font-bold ${dark ? "border-white/20" : "border-black/15"}`}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold">Largeur</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setWidthIndex((i) => Math.max(0, i - 1))}
                    className={`h-8 w-8 rounded-lg border text-xs font-bold ${dark ? "border-white/20" : "border-black/15"}`}
                  >
                    −
                  </button>
                  <span className="w-16 text-center text-xs opacity-70">{WIDTH_LABELS[widthIndex]}</span>
                  <button
                    onClick={() => setWidthIndex((i) => Math.min(WIDTHS.length - 1, i + 1))}
                    className={`h-8 w-8 rounded-lg border text-xs font-bold ${dark ? "border-white/20" : "border-black/15"}`}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}

          {panelOpen === "toc" && (
            <div>
              <div className="mb-3 flex gap-2">
                <button
                  onClick={() => setTocTab("chapters")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                    tocTab === "chapters" ? "bg-[#7c5cff] text-white" : dark ? "bg-white/10" : "bg-black/5"
                  }`}
                >
                  Chapitres
                </button>
                <button
                  onClick={() => setTocTab("bookmarks")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                    tocTab === "bookmarks" ? "bg-[#7c5cff] text-white" : dark ? "bg-white/10" : "bg-black/5"
                  }`}
                >
                  Signets
                </button>
                <button
                  onClick={() => setTocTab("highlights")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                    tocTab === "highlights" ? "bg-[#7c5cff] text-white" : dark ? "bg-white/10" : "bg-black/5"
                  }`}
                >
                  Surlignages
                </button>
              </div>
              {tocTab === "chapters" ? (
                chapters.length > 0 ? (
                  <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
                    {chapters.map((c) => (
                      <button
                        key={c.number}
                        onClick={() => goToView(c.pageIndex + frontOffset)}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-[#7c5cff]/10`}
                      >
                        <span className="truncate font-semibold">{`${c.number}. ${c.title}`}</span>
                        <span className="shrink-0 pl-2 text-xs opacity-50">{`~${c.estimatedMinutes} min`}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="opacity-60">Aucun chapitre détecté pour ce livre.</p>
                )
              ) : tocTab === "bookmarks" ? (
                <div>
                  <button
                    onClick={() => toggleBookmark(contentPage)}
                    className="mb-3 w-full rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-4 py-2 text-center text-xs font-bold text-white"
                  >
                    {bookmarks.includes(contentPage) ? "🔖 Retirer cette page des signets" : "🔖 Ajouter cette page aux signets"}
                  </button>
                  {bookmarks.length > 0 ? (
                    <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
                      {bookmarks.map((p) => (
                        <div key={p} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-[#7c5cff]/10">
                          <button onClick={() => goToView(p + frontOffset)} className="font-semibold">
                            {`Page ${p + 1}`}
                          </button>
                          <button onClick={() => toggleBookmark(p)} className="opacity-50 hover:opacity-100">
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="opacity-60">Aucun signet pour ce livre.</p>
                  )}
                </div>
              ) : (
                <div>
                  {highlights.length > 0 ? (
                    <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                      {highlights.map((h) => (
                        <div
                          key={h.id}
                          className={`rounded-lg border p-3 ${dark ? "border-white/10" : "border-black/10"}`}
                        >
                          <button
                            onClick={() => goToView(h.page + frontOffset)}
                            className="mb-1.5 block text-left text-xs font-bold opacity-60"
                          >
                            {`Page ${h.page + 1}`}
                          </button>
                          <p className="mb-2 text-sm italic">{`« ${h.text} »`}</p>
                          {editingHighlightId === h.id ? (
                            <div className="flex gap-2">
                              <input
                                autoFocus
                                value={noteDraft}
                                onChange={(e) => setNoteDraft(e.target.value)}
                                placeholder="Ta note…"
                                className={`flex-1 rounded-lg border px-2 py-1 text-xs outline-none ${
                                  dark ? "border-white/15 bg-white/5" : "border-black/10 bg-black/5"
                                }`}
                              />
                              <button
                                onClick={() => handleSaveNote(h.id)}
                                className="rounded-lg bg-[#7c5cff] px-3 text-xs font-bold text-white"
                              >
                                OK
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-2">
                              <button
                                onClick={() => {
                                  setEditingHighlightId(h.id);
                                  setNoteDraft(h.note ?? "");
                                }}
                                className="truncate text-xs font-semibold opacity-70 hover:opacity-100"
                              >
                                {h.note ? `📝 ${h.note}` : "+ Ajouter une note"}
                              </button>
                              <button
                                onClick={() => handleDeleteHighlight(h.id)}
                                className="shrink-0 opacity-50 hover:opacity-100"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="opacity-60">
                      Sélectionne du texte dans une page pour créer ton premier surlignage.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {panelOpen === "search" && (
            <div>
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher dans le livre…"
                className={`mb-3 w-full rounded-xl border px-3 py-2 text-sm outline-none ${
                  dark ? "border-white/15 bg-white/5 text-white" : "border-black/10 bg-black/5"
                }`}
              />
              {searchQuery.trim().length >= 2 ? (
                searchResults.length > 0 ? (
                  <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
                    {searchResults.map((r) => (
                      <button
                        key={r.page}
                        onClick={() => goToView(r.page + frontOffset)}
                        className="block w-full rounded-lg px-3 py-2 text-left hover:bg-[#7c5cff]/10"
                      >
                        <span className="font-semibold">{`Page ${r.page + 1}`}</span>
                        <span className="block truncate text-xs opacity-60">{`…${r.snippet}…`}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="opacity-60">Aucun résultat.</p>
                )
              ) : (
                <p className="opacity-60">Tape au moins 2 caractères.</p>
              )}
            </div>
          )}
        </div>
      )}

      {mode === "pages" ? (
        isFrontCover || isBackCover ? (
          <div
            key={view}
            className={`relative z-10 mx-auto flex ${WIDTHS[widthIndex]} flex-col items-center justify-center px-6 py-16 ${
              direction === "forward" ? "page-turn-forward" : "page-turn-backward"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={(isFrontCover ? coverImageUrl : backCoverImageUrl) ?? undefined}
              alt={isFrontCover ? `Couverture de ${title}` : `Quatrième de couverture de ${title}`}
              className="max-h-[70vh] rounded-[18px] shadow-[0_30px_70px_rgba(0,0,0,0.5)]"
            />
            {isLastView && endOfBookBlock}
          </div>
        ) : (
          <>
            <BookFlip
              ref={bookFlipRef}
              pageCount={pages.length}
              currentIndex={contentPage}
              onCommit={(idx) => goToView(idx + frontOffset)}
              renderPage={renderBookPage}
              paperBg={paperBg}
              paperText={paperText}
            />
            {isLastView && <div className="relative z-10 mx-auto px-6 pb-16">{endOfBookBlock}</div>}
          </>
        )
      ) : (
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className={`relative z-10 mx-auto h-[70vh] ${WIDTHS[widthIndex]} overflow-y-auto px-6 py-16`}
        >
          {coverImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverImageUrl}
              alt={`Couverture de ${title}`}
              className="mx-auto mb-10 max-h-[70vh] rounded-[18px] shadow-[0_30px_70px_rgba(0,0,0,0.5)]"
            />
          )}
          <div className={`select-text rounded-[22px] p-8 ${dark ? "bg-black/40 backdrop-blur-sm" : ""}`}>
            <div className={textClass}>
              {pages.map((pageText, i) => (
                <div key={i}>
                  {renderPageContent(
                    pageText,
                    highlightsByPage.get(i) ?? [],
                    listening && i === contentPage ? currentWordIndex : null
                  )}
                  {i < pages.length - 1 && (
                    <div className="my-10 flex items-center justify-center gap-3 opacity-40">
                      <span className="h-px w-10 bg-current" />
                      <span className="text-xs">···</span>
                      <span className="h-px w-10 bg-current" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          {backCoverImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={backCoverImageUrl}
              alt={`Quatrième de couverture de ${title}`}
              className="mx-auto mt-10 max-h-[70vh] rounded-[18px] shadow-[0_30px_70px_rgba(0,0,0,0.5)]"
            />
          )}
          {endOfBookBlock}
        </div>
      )}

      {selection && (
        <div className="fixed bottom-20 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-full bg-black/85 px-4 py-2 text-sm font-bold text-white shadow-lg backdrop-blur-sm">
          <button onClick={handleCopyQuote}>📋 Copier</button>
          <span className="opacity-30">|</span>
          <button onClick={handleShareQuote}>↗ Partager</button>
          <span className="opacity-30">|</span>
          <button onClick={handleSaveHighlight}>🖍 Surligner</button>
        </div>
      )}

      <div
        className={`sticky bottom-0 z-10 flex items-center justify-between border-t px-6 py-4 ${
          dark ? "border-white/10 bg-black/50 backdrop-blur-sm" : "border-black/10 bg-white/80 backdrop-blur-sm"
        }`}
      >
        <button
          onClick={handlePrev}
          disabled={mode === "pages" && view === 0}
          className={`rounded-xl border px-5 py-2.5 text-sm font-bold disabled:opacity-40 ${dark ? "border-white/20" : "border-black/15"}`}
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
          onClick={handleNext}
          disabled={mode === "pages" && view === totalSlots - 1}
          className="rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40"
        >
          Suivant →
        </button>
      </div>
    </div>
  );
}
