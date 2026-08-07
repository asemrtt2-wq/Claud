import Link from "next/link";

type Props = {
  slug: string;
  title: string;
  category: string;
  coverEmoji: string;
  coverTheme: string;
  coverImageUrl?: string | null;
  price: number;
  oldPrice: number | null;
};

export default function EBookCard({
  slug,
  title,
  category,
  coverEmoji,
  coverTheme,
  coverImageUrl,
  price,
  oldPrice,
}: Props) {
  return (
    <Link
      href={`/ebooks/${slug}`}
      className={`card-scrim ${coverImageUrl ? "" : `cover-theme-${coverTheme}`} group relative flex h-[290px] flex-col justify-between overflow-hidden rounded-[22px] p-6 text-white shadow-soft ring-1 ring-white/10 transition-transform duration-300 hover:-translate-y-2.5`}
    >
      {coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverImageUrl}
          alt=""
          className="absolute inset-0 z-0 h-full w-full object-cover"
        />
      )}
      <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl backdrop-blur">
        {coverEmoji}
      </div>
      <div className="relative z-10">
        <span className="text-xs font-bold uppercase tracking-wider text-[#c3d3ff]">
          {category}
        </span>
        <h3 className="mt-1 text-lg font-extrabold tracking-tight">{title}</h3>
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
