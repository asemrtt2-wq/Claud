"use client";

import { useState } from "react";
import Link from "next/link";
import type { ChapterInfo } from "@/lib/chapters";
import BookRow from "@/components/BookRow";

type SimilarBook = {
  id: string;
  slug: string;
  title: string;
  author: string;
  coverEmoji: string;
  coverTheme: string;
};

export type Episode = {
  id: string;
  slug: string;
  title: string;
  seriesOrder: number | null;
  coverEmoji: string;
  coverTheme: string;
  coverImageUrl?: string | null;
  isCurrent: boolean;
  progressPercent: number | null;
  completed: boolean;
};

export default function BookDetailTabs({
  chapters,
  readHref,
  similarBooks,
  episodes,
  light = false,
}: {
  chapters: ChapterInfo[];
  readHref: string | null;
  similarBooks: SimilarBook[];
  episodes: Episode[];
  light?: boolean;
}) {
  const [tab, setTab] = useState<"chapters" | "similar" | "episodes">(
    episodes.length > 0 ? "episodes" : "chapters"
  );

  const muted = light ? "text-[#6e6e73]" : "text-[color:var(--color-lumina-text-muted)]";
  const activeTab = light ? "text-[#1d1d1f]" : "text-white";
  const card = light ? "ibook-card" : "lumina-card";
  const accent = light ? "text-[#5b3df0]" : "text-[#a78bfa]";
  const chapterBadge = light ? "bg-black/[0.05] text-[#1d1d1f]" : "bg-white/10 text-white";
  const progressTrack = light ? "ibook-progress-track" : "lumina-progress-track";
  const progressFill = light ? "ibook-progress-fill" : "lumina-progress-fill";

  return (
    <div>
      <div className={`mb-5 flex gap-6 border-b ${light ? "border-black/10" : "border-white/10"}`}>
        {(
          [
            ...(episodes.length > 0 ? ([["episodes", "Épisodes"]] as const) : []),
            ["chapters", `Chapitres`],
            ["similar", "Livres similaires"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`relative pb-3 text-sm font-bold transition ${tab === key ? activeTab : muted}`}
          >
            {label}
            {tab === key && (
              <span className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-[#7c5cff] to-[#a78bfa]" />
            )}
          </button>
        ))}
      </div>

      {tab === "episodes" ? (
        <div className="flex flex-col gap-2">
          {episodes.map((ep) => (
            <Link
              key={ep.id}
              href={`/ebooks/${ep.slug}`}
              className={`${card} flex items-center gap-4 rounded-2xl p-3 transition hover:-translate-y-0.5 ${
                ep.isCurrent ? "border-[#a78bfa]/60" : ""
              }`}
            >
              <span
                className={`${ep.coverImageUrl ? "" : `cover-theme-${ep.coverTheme}`} relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg text-xl`}
              >
                {ep.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ep.coverImageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  ep.coverEmoji
                )}
              </span>
              <div className="flex-1">
                <p className={`text-xs font-bold uppercase tracking-wide ${accent}`}>
                  Tome {ep.seriesOrder}
                  {ep.isCurrent && " · Vous êtes ici"}
                </p>
                <p className={`text-sm font-bold ${light ? "text-[#1d1d1f]" : ""}`}>{ep.title}</p>
                {ep.progressPercent !== null && (
                  <div className={`mt-1.5 h-1 w-full max-w-[160px] overflow-hidden rounded-full ${progressTrack}`}>
                    <div
                      className={`h-full ${progressFill}`}
                      style={{ width: `${ep.progressPercent}%` }}
                    />
                  </div>
                )}
              </div>
              {ep.completed && <span className="text-[#0a8a3f]">✓</span>}
            </Link>
          ))}
        </div>
      ) : tab === "chapters" ? (
        chapters.length === 0 ? (
          <p className={`text-sm ${muted}`}>Ce livre n&apos;a pas de chapitres identifiés.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {chapters.map((c) => {
              const content = (
                <>
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${chapterBadge}`}
                  >
                    {c.number}
                  </span>
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${light ? "text-[#1d1d1f]" : ""}`}>{c.title}</p>
                    <p className={`text-xs ${muted}`}>{c.estimatedMinutes} min</p>
                  </div>
                </>
              );
              return readHref ? (
                <Link
                  key={c.number}
                  href={`${readHref}?page=${c.pageIndex}`}
                  className={`${card} flex items-center gap-4 rounded-2xl p-3 transition hover:-translate-y-0.5`}
                >
                  {content}
                </Link>
              ) : (
                <div key={c.number} className={`${card} flex items-center gap-4 rounded-2xl p-3 opacity-70`}>
                  {content}
                </div>
              );
            })}
          </div>
        )
      ) : similarBooks.length === 0 ? (
        <p className={`text-sm ${muted}`}>Aucun livre similaire pour l&apos;instant.</p>
      ) : (
        <BookRow label="" books={similarBooks} light={light} />
      )}
    </div>
  );
}
