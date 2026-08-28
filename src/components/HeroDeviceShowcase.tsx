import { PhoneFrame } from "@/components/DeviceFrame";
import { MiniDashboardScreen, MiniReaderScreen } from "@/components/MiniAppScreens";

type ShowcaseBook = {
  title: string;
  coverEmoji: string;
  coverTheme: string;
  content: string;
};

export default function HeroDeviceShowcase({ books }: { books: ShowcaseBook[] }) {
  if (books.length === 0) return null;
  const [main, ...rest] = books;
  const excerpt = main.content
    .replace(/^Chapitre\s+\d+\s*[—-].*$/im, "")
    .trim()
    .slice(0, 420)
    .trim();

  // Always show a full-looking row of 5 in the mockup, cycling through whatever
  // real covers are available rather than a sparse row when few books are featured.
  const libraryPool = rest.length > 0 ? rest : [main];
  const library = Array.from({ length: 5 }, (_, i) => libraryPool[i % libraryPool.length]);

  return (
    <div className="relative flex items-center justify-center py-6">
      <div className="absolute h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(124,92,255,0.25),transparent_70%)]" />
      <PhoneFrame className="relative z-0 hidden rotate-6 translate-x-16 opacity-95 sm:block">
        <MiniReaderScreen
          title={main.title}
          chapterLabel="Chapitre 1"
          excerpt={excerpt || main.title}
          page={12}
          totalPages={26}
        />
      </PhoneFrame>
      <PhoneFrame className="relative z-10 -rotate-3">
        <MiniDashboardScreen
          continuing={{ ...main, progress: 48 }}
          library={library}
        />
      </PhoneFrame>
    </div>
  );
}
