import { PhoneFrame } from "@/components/DeviceFrame";
import { MiniDashboardScreen, MiniReaderScreen } from "@/components/MiniAppScreens";

type ShowcaseBook = {
  title: string;
  coverEmoji: string;
  coverTheme: string;
  coverImageUrl: string | null;
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

  /* Distinct covers only. Several series tomes in this catalog share one cover image (a
     known issue in the supplied exports), and cycling a short pool to fill five slots made
     it worse — the mockup showed the same artwork three times, which is the first thing a
     visitor sees. De-duplicating on the image means the row is short before it is repetitive. */
  const seen = new Set<string>();
  const library = [main, ...rest].filter((book) => {
    const key = book.coverImageUrl ?? `${book.coverTheme}:${book.coverEmoji}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

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
