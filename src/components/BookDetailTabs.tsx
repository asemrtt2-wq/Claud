"use client";

import { useState } from "react";
import Link from "next/link";
import type { ChapterInfo } from "@/lib/chapters";

type SimilarBook = {
  id: string;
  slug: string;
  title: string;
  author: string;
  coverEmoji: string;
  coverTheme: string;
};

export default function BookDetailTabs({
  chapters,
  readHref,
  similarBooks,
}: {
  chapters: ChapterInfo[];
  readHref: string | null;
  similarBooks: SimilarBook[];
}) {
  const [tab, setTab] = useState<"chapters" | "similar">("chapters");

  return (
    <div>
      <div className="mb-5 flex gap-6 border-b border-white/10">
        {(
          [
            ["chapters", `Chapitres`],
            ["similar", "Livres similaires"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`relative pb-3 text-sm font-bold transition ${
              tab === key ? "text-white" : "text-[color:var(--color-lumina-text-muted)]"
            }`}
          >
            {label}
            {tab === key && (
              <span className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-[#7c5cff] to-[#a78bfa]" />
            )}
          </button>
        ))}
      </div>

      {tab === "chapters" ? (
        chapters.length === 0 ? (
          <p className="text-sm text-[color:var(--color-lumina-text-muted)]">
            Ce livre n&apos;a pas de chapitres identifiés.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {chapters.map((c) => {
              const content = (
                <>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/10 text-sm font-bold">
                    {c.number}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-bold">{c.title}</p>
                    <p className="text-xs text-[color:var(--color-lumina-text-muted)]">
                      {c.estimatedMinutes} min
                    </p>
                  </div>
                </>
              );
              return readHref ? (
                <Link
                  key={c.number}
                  href={`${readHref}?page=${c.pageIndex}`}
                  className="lumina-card flex items-center gap-4 rounded-2xl p-3 transition hover:-translate-y-0.5"
                >
                  {content}
                </Link>
              ) : (
                <div
                  key={c.number}
                  className="lumina-card flex items-center gap-4 rounded-2xl p-3 opacity-70"
                >
                  {content}
                </div>
              );
            })}
          </div>
        )
      ) : similarBooks.length === 0 ? (
        <p className="text-sm text-[color:var(--color-lumina-text-muted)]">
          Aucun livre similaire pour l&apos;instant.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {similarBooks.map((book) => (
            <Link key={book.id} href={`/ebooks/${book.slug}`} className="group">
              <div
                className={`cover-theme-${book.coverTheme} mb-2 flex h-32 items-center justify-center rounded-2xl text-3xl shadow-lg transition group-hover:-translate-y-1`}
              >
                {book.coverEmoji}
              </div>
              <p className="truncate text-xs font-bold">{book.title}</p>
              {book.author && (
                <p className="truncate text-xs text-[color:var(--color-lumina-text-muted)]">
                  {book.author}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
