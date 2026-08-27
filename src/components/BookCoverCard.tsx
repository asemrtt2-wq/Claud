"use client";

export type CoverCardBook = {
  id: string;
  slug: string;
  title: string;
  category: string;
  coverEmoji: string;
  coverTheme: string;
  coverImageUrl?: string | null;
};

export default function BookCoverCard({
  book,
  onOpen,
  light = false,
  animationDelayMs = 0,
}: {
  book: CoverCardBook;
  onOpen: () => void;
  light?: boolean;
  animationDelayMs?: number;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      style={{ animationDelay: `${animationDelayMs}ms` }}
      className="group flex flex-col text-left animate-fade-in-up"
    >
      <div
        className={`relative overflow-hidden rounded-2xl transition-all duration-300 ease-out group-hover:-translate-y-1.5 ${
          light
            ? "shadow-[0_2px_10px_rgba(0,0,0,0.1)] group-hover:shadow-[0_18px_34px_rgba(0,0,0,0.16)]"
            : "shadow-[0_14px_34px_rgba(0,0,0,0.35)] group-hover:shadow-[0_26px_54px_rgba(124,92,255,0.35)]"
        }`}
      >
        <div
          className={`${book.coverImageUrl ? (light ? "bg-black/[0.04]" : "bg-black/40") : `cover-theme-${book.coverTheme}`} relative flex aspect-[0.5628] w-full items-center justify-center transition-transform duration-300 ease-out group-hover:scale-[1.035]`}
        >
          {book.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={book.coverImageUrl}
              alt={`Couverture de ${book.title}`}
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="text-5xl">{book.coverEmoji}</span>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/80 to-transparent p-3 text-center text-xs font-bold text-white opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
            Voir le livre →
          </div>
        </div>
      </div>
      <h3
        className={`mt-3 line-clamp-2 text-sm font-bold leading-snug ${light ? "text-[#1d1d1f]" : "text-white"}`}
      >
        {book.title}
      </h3>
      <p
        className={`mt-0.5 truncate text-xs font-medium ${light ? "text-[#6e6e73]" : "text-[color:var(--color-lumina-text-muted)]"}`}
      >
        {book.category}
      </p>
    </button>
  );
}
