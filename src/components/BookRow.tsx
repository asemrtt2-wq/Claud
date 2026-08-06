import Link from "next/link";

type RowBook = {
  id: string;
  slug: string;
  title: string;
  coverEmoji: string;
  coverTheme: string;
  coverImageUrl?: string | null;
};

export default function BookRow({
  label,
  books,
  hrefBase = "/ebooks",
  progressByEbookId,
}: {
  label: string;
  books: RowBook[];
  hrefBase?: string;
  progressByEbookId?: Map<string, number>;
}) {
  return (
    <div>
      {label && (
        <p className="mb-3 text-sm font-semibold text-[color:var(--color-lumina-text-muted)]">
          {label}
        </p>
      )}
      <div className="scrollbar-hide -mx-6 flex snap-x gap-4 overflow-x-auto px-6 pb-1 sm:-mx-10 sm:px-10">
        {books.map((book) => {
          const percent = progressByEbookId?.get(book.id);
          return (
            <Link
              key={book.id}
              href={`${hrefBase}/${book.slug}`}
              className="group w-32 shrink-0 snap-start sm:w-36"
            >
              <div
                className={`${book.coverImageUrl ? "" : `cover-theme-${book.coverTheme}`} relative mb-2 flex h-40 items-center justify-center overflow-hidden rounded-2xl text-4xl shadow-lg transition group-hover:-translate-y-1`}
              >
                {book.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={book.coverImageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  book.coverEmoji
                )}
              </div>
              <p className="truncate text-xs font-bold text-white">{book.title}</p>
              {percent !== undefined && (
                <div className="mt-1 h-1 w-full overflow-hidden rounded-full lumina-progress-track">
                  <div className="h-full lumina-progress-fill" style={{ width: `${percent}%` }} />
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
