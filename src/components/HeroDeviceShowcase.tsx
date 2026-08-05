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
    .slice(0, 220)
    .trim();

  return (
    <div className="relative flex items-center justify-center py-6">
      <div className="absolute h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(124,92,255,0.25),transparent_70%)]" />
      <PhoneFrame className="relative z-0 hidden rotate-6 translate-x-10 opacity-90 sm:block">
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
          library={rest.length > 0 ? rest : [main, main, main]}
        />
      </PhoneFrame>
    </div>
  );
}
