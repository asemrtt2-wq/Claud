"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type CarouselEbook = {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  coverEmoji: string;
  coverTheme: string;
};

export default function HeroCarousel({ ebooks }: { ebooks: CarouselEbook[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (ebooks.length < 2) return;
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % ebooks.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [ebooks.length]);

  if (ebooks.length === 0) return null;
  const active = ebooks[index];

  return (
    <div className="relative">
      <Link
        key={active.slug}
        href={`/ebooks/${active.slug}`}
        className={`cover-theme-${active.coverTheme} relative flex h-[380px] w-full max-w-[420px] flex-col justify-end overflow-hidden rounded-[26px] p-8 text-white shadow-[0_30px_70px_rgba(0,0,0,0.45)] transition hover:-translate-y-1`}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute right-7 top-7 text-6xl opacity-90">{active.coverEmoji}</div>
        <div className="relative z-10">
          <span className="mb-2 inline-block text-[0.7rem] font-extrabold uppercase tracking-widest text-[#c3d3ff]">
            {active.category}
          </span>
          <h3 className="mb-2 text-2xl font-extrabold leading-tight tracking-tight">
            {active.title}
          </h3>
          <p className="mb-4 line-clamp-2 text-sm text-white/80">{active.subtitle}</p>
          <span className="inline-block rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-navy">
            Découvrir →
          </span>
        </div>
      </Link>

      {ebooks.length > 1 && (
        <div className="mt-5 flex justify-center gap-2">
          {ebooks.map((book, i) => (
            <button
              key={book.slug}
              onClick={() => setIndex(i)}
              aria-label={`Voir ${book.title}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-white" : "w-1.5 bg-white/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
