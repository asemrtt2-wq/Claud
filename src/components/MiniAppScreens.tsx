import LogoMark from "@/components/Logo";

type MiniBook = {
  title: string;
  coverEmoji: string;
  coverTheme: string;
  category?: string;
  /** Real cover art when the book has it — the mockups show the actual app, not stand-ins. */
  coverImageUrl?: string | null;
};

/** One cover tile, using the book's real image when it has one and the gradient otherwise. */
function MiniCover({ book, className }: { book: MiniBook; className: string }) {
  return (
    <div
      className={`${book.coverImageUrl ? "bg-black/30" : `cover-theme-${book.coverTheme}`} flex items-center justify-center overflow-hidden ${className}`}
    >
      {book.coverImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={book.coverImageUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        book.coverEmoji
      )}
    </div>
  );
}

export function MiniDashboardScreen({
  greeting = "Bonsoir 👋",
  continuing,
  library,
}: {
  greeting?: string;
  continuing: MiniBook & { progress: number };
  library: MiniBook[];
}) {
  return (
    <div className="lumia-shell flex h-full flex-col px-3.5 pb-3 pt-4 text-white">
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-1 text-[0.65rem] font-extrabold tracking-wide">
          <LogoMark className="flex h-3.5 w-3.5 items-center justify-center rounded-[4px] bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] text-white" />{" "}
          LUMIA
        </span>
        <div className="h-4 w-4 rounded-full bg-gradient-to-br from-[#7c5cff] to-[#5b3df0]" />
      </div>
      <p className="mb-3 text-[0.72rem] font-bold">{greeting}</p>

      {/* Same construction as the real dashboard billboard: blurred cover as a backdrop,
          a scrim, and the un-cropped cover standing beside the copy. */}
      <div
        className={`${continuing.coverImageUrl ? "bg-[#12101f]" : `cover-theme-${continuing.coverTheme}`} relative mb-3 flex h-24 items-center gap-2 overflow-hidden rounded-xl p-2.5`}
      >
        {continuing.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={continuing.coverImageUrl}
            alt=""
            className="absolute inset-0 h-full w-full scale-110 object-cover object-top blur-md"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/20" />
        <div className="relative z-10 min-w-0 flex-1">
          <p className="text-[0.5rem] font-bold uppercase tracking-wide text-[#f0c46a]">
            Continuer la lecture
          </p>
          <p className="mt-0.5 line-clamp-2 text-[0.62rem] font-extrabold leading-tight">
            {continuing.title}
          </p>
          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/25">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#7c5cff] to-[#a78bfa]"
              style={{ width: `${continuing.progress}%` }}
            />
          </div>
          <p className="mt-1 text-[0.5rem] text-white/70">{`${continuing.progress}% terminé`}</p>
        </div>
        <MiniCover book={continuing} className="relative z-10 h-full w-12 shrink-0 rounded-md text-base" />
      </div>

      <p className="mb-1.5 text-[0.6rem] font-bold text-[color:var(--color-lumia-text-muted)]">
        Ma bibliothèque
      </p>
      <div className="flex gap-1">
        {library.slice(0, 5).map((book, i) => (
          <MiniCover
            key={`${book.title}-${i}`}
            book={book}
            className="h-12 flex-1 rounded-lg text-sm"
          />
        ))}
      </div>

      <div className="mt-auto flex justify-between pt-3 text-[0.55rem] text-[color:var(--color-lumia-text-muted)]">
        <span>🏠</span>
        <span>📚</span>
        <span>✨</span>
        <span>♥</span>
        <span>👤</span>
      </div>
    </div>
  );
}

export function MiniLibraryScreen({ books }: { books: MiniBook[] }) {
  return (
    <div className="lumia-shell flex h-full flex-col gap-3 px-4 pb-4 pt-4 text-white">
      <div className="flex items-center justify-between text-[0.75rem] font-extrabold">
        <span className="flex items-center gap-1">
          <LogoMark className="flex h-3.5 w-3.5 items-center justify-center rounded-[4px] bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] text-white" />{" "}
          LUMIA
        </span>
        <span className="text-[color:var(--color-lumia-text-muted)]">Bibliothèque</span>
      </div>
      <div className="grid flex-1 grid-cols-4 gap-2">
        {books.slice(0, 8).map((book, i) => (
          <div key={`${book.title}-${i}`} className="flex flex-col gap-1">
            <MiniCover book={book} className="aspect-[0.5628] w-full rounded-lg text-lg" />
            <span className="line-clamp-2 text-[0.5rem] font-bold leading-tight">
              {book.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MiniReaderScreen({
  title,
  chapterLabel,
  excerpt,
  page,
  totalPages,
}: {
  title: string;
  chapterLabel: string;
  excerpt: string;
  page: number;
  totalPages: number;
}) {
  const progress = Math.round((page / totalPages) * 100);
  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#faf8f4] px-4 pb-3 pt-3 text-[#1a1730]">
      <div className="absolute inset-x-0 top-0 h-[3px] bg-[#e7e2d8]">
        <div
          className="h-full bg-gradient-to-r from-[#7c5cff] to-[#a78bfa]"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mb-2 mt-2 text-[0.52rem] font-bold uppercase tracking-wide text-[#8b84a8]">
        {chapterLabel}
      </p>
      <p className="flex-1 overflow-hidden whitespace-pre-line text-[0.62rem] leading-[1.65] text-[#2a2540]">
        {excerpt}
      </p>
      <p className="mt-2 text-center text-[0.5rem] text-[#a29ab8]">
        {page} / {totalPages}
      </p>
    </div>
  );
}
