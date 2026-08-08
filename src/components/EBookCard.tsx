import Link from "next/link";

type Props = {
  slug: string;
  title: string;
  category: string;
  description?: string;
  coverEmoji: string;
  coverTheme: string;
  coverImageUrl?: string | null;
  price: number;
  oldPrice: number | null;
  pages?: number;
  readingMinutes?: number;
  isNew?: boolean;
  isBestseller?: boolean;
  animationDelayMs?: number;
};

export default function EBookCard({
  slug,
  title,
  category,
  description,
  coverEmoji,
  coverTheme,
  coverImageUrl,
  price,
  oldPrice,
  pages,
  readingMinutes,
  isNew,
  isBestseller,
  animationDelayMs = 0,
}: Props) {
  return (
    <Link
      href={`/ebooks/${slug}`}
      style={{ animationDelay: `${animationDelayMs}ms` }}
      className={`card-scrim ${coverImageUrl ? "" : `cover-theme-${coverTheme}`} group relative flex h-[290px] flex-col justify-between overflow-hidden rounded-[22px] p-6 text-white shadow-soft ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-2.5 hover:scale-[1.03] hover:shadow-[0_25px_60px_rgba(124,92,255,0.4)] animate-fade-in-up`}
    >
      {coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverImageUrl}
          alt=""
          className="absolute inset-0 z-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      )}
      {(isBestseller || isNew) && (
        <div className="absolute left-4 top-4 z-20 flex flex-col gap-1.5">
          {isBestseller && (
            <span className="rounded-full bg-gradient-to-r from-[#f59e0b] to-[#d97706] px-3 py-1 text-[0.65rem] font-extrabold uppercase tracking-wider text-white shadow-lg">
              🔥 Bestseller
            </span>
          )}
          {isNew && (
            <span className="rounded-full bg-gradient-to-r from-[#7c5cff] to-[#5b3df0] px-3 py-1 text-[0.65rem] font-extrabold uppercase tracking-wider text-white shadow-lg">
              🆕 Nouveau
            </span>
          )}
        </div>
      )}
      <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl backdrop-blur">
        {coverEmoji}
      </div>
      <div className="relative z-10">
        <span className="text-xs font-bold uppercase tracking-wider text-[#c3d3ff]">
          {category}
        </span>
        <h3 className="mt-1 text-lg font-extrabold tracking-tight">{title}</h3>
        {description && (
          <p className="mt-1 line-clamp-2 text-sm text-white/70">{description}</p>
        )}
        {(pages || readingMinutes) && (
          <div className="mt-1.5 flex items-center gap-3 text-xs font-semibold text-white/0 transition-colors duration-300 group-hover:text-white/70">
            {pages ? <span>{`📖 ${pages} pages`}</span> : null}
            {readingMinutes ? <span>{`⏱ ~${readingMinutes} min`}</span> : null}
          </div>
        )}
        <div className="mt-2 flex items-baseline gap-2">
          {oldPrice && (
            <span className="text-sm font-semibold text-white/50 line-through">
              {oldPrice} €
            </span>
          )}
          <span className="text-base font-extrabold">{price} €</span>
        </div>
      </div>
    </Link>
  );
}
