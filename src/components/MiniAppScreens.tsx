type MiniBook = {
  title: string;
  coverEmoji: string;
  coverTheme: string;
  category?: string;
};

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
    <div className="lumina-shell flex h-full flex-col px-3.5 pb-3 pt-4 text-white">
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-1 text-[0.65rem] font-extrabold tracking-wide">
          <span className="text-[#a78bfa]">✦</span> LUMINA
        </span>
        <div className="h-4 w-4 rounded-full bg-gradient-to-br from-[#7c5cff] to-[#5b3df0]" />
      </div>
      <p className="mb-3 text-[0.72rem] font-bold">{greeting}</p>

      <div
        className={`cover-theme-${continuing.coverTheme} relative mb-3 flex h-24 flex-col justify-end overflow-hidden rounded-xl p-2.5`}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute right-2 top-2 text-xl opacity-90">{continuing.coverEmoji}</div>
        <div className="relative z-10">
          <p className="text-[0.62rem] font-extrabold leading-tight">{continuing.title}</p>
          <div className="lumina-progress-track mt-1.5 h-1 w-full overflow-hidden rounded-full">
            <div
              className="lumina-progress-fill h-full rounded-full"
              style={{ width: `${continuing.progress}%` }}
            />
          </div>
        </div>
      </div>

      <p className="mb-1.5 text-[0.6rem] font-bold text-[color:var(--color-lumina-text-muted)]">
        Ma bibliothèque
      </p>
      <div className="flex gap-1.5">
        {library.slice(0, 3).map((book) => (
          <div
            key={book.title}
            className={`cover-theme-${book.coverTheme} flex h-14 flex-1 items-center justify-center rounded-lg text-base`}
          >
            {book.coverEmoji}
          </div>
        ))}
      </div>

      <div className="mt-auto flex justify-between pt-3 text-[0.55rem] text-[color:var(--color-lumina-text-muted)]">
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
    <div className="lumina-shell flex h-full flex-col gap-3 px-4 pb-4 pt-4 text-white">
      <div className="flex items-center justify-between text-[0.75rem] font-extrabold">
        <span className="flex items-center gap-1">
          <span className="text-[#a78bfa]">✦</span> LUMINA
        </span>
        <span className="text-[color:var(--color-lumina-text-muted)]">Bibliothèque</span>
      </div>
      <div className="grid flex-1 grid-cols-4 gap-2">
        {books.slice(0, 8).map((book, i) => (
          <div
            key={`${book.title}-${i}`}
            className={`cover-theme-${book.coverTheme} flex flex-col items-center justify-center gap-1 rounded-lg p-2 text-center`}
          >
            <span className="text-lg">{book.coverEmoji}</span>
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
    <div className="flex h-full flex-col bg-[#0d0b22] px-3.5 pb-3 pt-4 text-white">
      <div className="mb-2.5 flex items-center justify-between text-[0.6rem] text-[color:var(--color-lumina-text-muted)]">
        <div>
          <p className="font-extrabold text-white">{title}</p>
          <p>{chapterLabel}</p>
        </div>
        <span>🔖</span>
      </div>
      <p className="flex-1 overflow-hidden text-[0.6rem] leading-relaxed text-[#d8d4f0]">
        {excerpt}
      </p>
      <div className="mt-2 flex items-center justify-between text-[0.55rem] text-[color:var(--color-lumina-text-muted)]">
        <span>
          {page} / {totalPages}
        </span>
        <div className="lumina-progress-track h-1 w-20 overflow-hidden rounded-full">
          <div className="lumina-progress-fill h-full rounded-full" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}
