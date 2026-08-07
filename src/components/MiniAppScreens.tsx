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
