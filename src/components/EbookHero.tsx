"use client";

import { useState } from "react";
import Link from "next/link";
import BuyButton from "./BuyButton";
import CoverLightbox, { type LightboxBook } from "./CoverLightbox";

export default function EbookHero({
  ebookId,
  title,
  author,
  seriesName,
  seriesOrder,
  category,
  publishedYear,
  isPdf,
  pagesCount,
  coverEmoji,
  coverTheme,
  coverImageUrl,
  backCoverImageUrl,
  price,
  oldPrice,
  discount,
  hasAccess,
  isLoggedIn,
  readHref,
  progressLabel,
}: {
  ebookId: string;
  title: string;
  author: string;
  seriesName: string | null;
  seriesOrder: number | null;
  category: string;
  publishedYear: number | null;
  isPdf: boolean;
  pagesCount: number;
  coverEmoji: string;
  coverTheme: string;
  coverImageUrl: string | null;
  backCoverImageUrl: string | null;
  price: number;
  oldPrice: number | null;
  discount: number | null;
  hasAccess: boolean;
  isLoggedIn: boolean;
  readHref: string | null;
  progressLabel: { percent: number; text: string } | null;
}) {
  const [previewOpen, setPreviewOpen] = useState(false);

  const lightboxBook: LightboxBook = {
    slug: "",
    title,
    category,
    coverEmoji,
    coverTheme,
    coverImageUrl,
    backCoverImageUrl,
  };

  return (
    <div className="relative overflow-hidden bg-white">
      <div className="relative z-10 mx-auto grid max-w-5xl gap-8 px-6 py-10 sm:py-14 md:grid-cols-[minmax(220px,280px)_1fr] md:items-center md:gap-12">
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          className="group relative mx-auto block w-full max-w-[240px] md:max-w-none"
          aria-label="Aperçu de la couverture"
        >
          {coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverImageUrl}
              alt={`Couverture de ${title}`}
              className="w-full rounded-2xl object-contain shadow-[0_20px_50px_rgba(0,0,0,0.18)] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_28px_60px_rgba(124,92,255,0.25)]"
            />
          ) : (
            <div
              className={`cover-theme-${coverTheme} flex aspect-[0.5628] w-full items-center justify-center rounded-2xl text-7xl shadow-[0_20px_50px_rgba(0,0,0,0.18)]`}
            >
              {coverEmoji}
            </div>
          )}
          <span className="pointer-events-none absolute inset-x-0 bottom-3 rounded-lg bg-black/60 py-1 text-center text-xs font-bold text-white opacity-0 transition group-hover:opacity-100">
            👁 Aperçu
          </span>
        </button>

        <div>
          <h1 className="mb-1 text-3xl font-extrabold tracking-tight text-[#1d1d1f] sm:text-4xl">
            {title}
          </h1>
          {author && <p className="mb-2 text-lg font-semibold text-[#5b3df0]">{author}</p>}
          {seriesName && (
            <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#5b3df0]">
              {seriesName}
              {seriesOrder ? ` · Tome ${seriesOrder}` : ""}
            </p>
          )}
          <p className="mb-6 text-sm text-[#6e6e73]">
            {[
              category,
              isPdf ? "PDF" : `${pagesCount} page${pagesCount > 1 ? "s" : ""}`,
              "Français",
              publishedYear,
            ]
              .filter(Boolean)
              .join(" • ")}
          </p>

          {hasAccess ? (
            <div className="max-w-sm">
              <Link
                href={readHref ?? "/profiles"}
                className="block rounded-2xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-7 py-3.5 text-center text-sm font-bold text-white shadow-[0_12px_30px_rgba(124,92,255,0.35)] transition hover:-translate-y-0.5"
              >
                {progressLabel ? "▶ Reprendre la lecture" : "📖 Commencer la lecture"}
              </Link>
              {progressLabel && (
                <div className="mt-4">
                  <div className="mb-1.5 h-1.5 w-full overflow-hidden rounded-full ibook-progress-track">
                    <div
                      className="h-full ibook-progress-fill"
                      style={{ width: `${progressLabel.percent}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#6e6e73]">{progressLabel.text}</p>
                </div>
              )}
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="mt-3 block w-full rounded-2xl border border-black/10 px-7 py-3 text-center text-sm font-bold text-[#1d1d1f] transition hover:border-[#7c5cff]"
              >
                👁 Aperçu de la couverture
              </button>
            </div>
          ) : (
            <div className="ibook-card max-w-sm rounded-[22px] p-6">
              <div className="mb-3 flex items-baseline gap-3">
                {oldPrice && (
                  <span className="text-lg font-bold text-black/30 line-through">
                    {oldPrice} €
                  </span>
                )}
                <span className="text-3xl font-extrabold tracking-tight text-[#1d1d1f]">
                  {price} €
                </span>
                {discount && (
                  <span className="rounded-full bg-gradient-to-br from-[#ff3b3b] to-[#c9192a] px-3 py-1 text-xs font-extrabold text-white">
                    -{discount}%
                  </span>
                )}
              </div>
              <BuyButton ebookId={ebookId} isLoggedIn={isLoggedIn} />
              <Link
                href="/premium"
                className="mt-3 block rounded-2xl border border-black/10 px-7 py-3 text-center text-sm font-bold text-[#1d1d1f] transition hover:border-[#7c5cff]"
              >
                ✨ Lire gratuitement avec Premium
              </Link>
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="mt-3 block w-full rounded-2xl border border-black/10 px-7 py-3 text-center text-sm font-bold text-[#1d1d1f] transition hover:border-[#7c5cff]"
              >
                👁 Aperçu de la couverture
              </button>
              <p className="mt-4 text-xs text-[#6e6e73]">
                🔒 Paiement sécurisé via Stripe — accès immédiat après paiement.
              </p>
            </div>
          )}
        </div>
      </div>

      {previewOpen && (
        <CoverLightbox
          books={[lightboxBook]}
          index={0}
          onClose={() => setPreviewOpen(false)}
          onNavigate={() => {}}
          hideViewLink
        />
      )}
    </div>
  );
}
