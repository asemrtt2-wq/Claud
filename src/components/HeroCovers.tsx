type CoverEbook = {
  title: string;
  coverEmoji: string;
  coverTheme: string;
  category: string;
};

const sizeClass: Record<"before" | "main" | "after", string> = {
  before: "w-[150px] h-[250px] z-10",
  main: "w-[230px] h-[320px] z-20",
  after: "w-[150px] h-[250px] z-10",
};

const transformStyle: Record<"before" | "main" | "after", string | undefined> = {
  before: "rotate(-9deg) translateX(28px)",
  main: undefined,
  after: "rotate(9deg) translateX(-28px)",
};

function Cover({
  ebook,
  variant,
}: {
  ebook: CoverEbook;
  variant: "before" | "main" | "after";
}) {
  const isMain = variant === "main";
  return (
    <div
      className={`cover-theme-${ebook.coverTheme} relative flex flex-shrink-0 flex-col overflow-hidden rounded-2xl p-6 text-white shadow-[0_30px_60px_rgba(0,0,0,0.4)] ${sizeClass[variant]}`}
      style={{ transform: transformStyle[variant] }}
    >
      <span className="mb-2.5 line-clamp-1 text-[0.65rem] font-extrabold uppercase tracking-widest text-[#c3d3ff]">
        {ebook.category}
      </span>
      <span
        className={`line-clamp-3 font-extrabold leading-tight tracking-tight ${isMain ? "text-xl" : "text-base"}`}
      >
        {ebook.title}
      </span>
      <div className={`flex flex-1 items-center justify-center ${isMain ? "text-5xl" : "text-4xl"}`}>
        {ebook.coverEmoji}
      </div>
    </div>
  );
}

export default function HeroCovers({ ebooks }: { ebooks: CoverEbook[] }) {
  const [before, main, after] = ebooks;
  if (!before || !main || !after) return null;

  return (
    <div className="relative flex items-center justify-center py-8 pb-12">
      <div className="absolute bottom-5 h-11 w-[340px] rounded-full bg-black/50 blur-md" />
      <Cover ebook={before} variant="before" />
      <Cover ebook={main} variant="main" />
      <Cover ebook={after} variant="after" />
    </div>
  );
}
