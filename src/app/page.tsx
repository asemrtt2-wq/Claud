import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroDeviceShowcase from "@/components/HeroDeviceShowcase";
import EBookCard from "@/components/EBookCard";
import BookRow from "@/components/BookRow";
import BookCoverShelf from "@/components/BookCoverShelf";
import {
  CompatibilitySection,
  FeatureHighlights,
  FinalCtaBand,
  HowItWorksSection,
  KidsModeSection,
  ReadingExperienceSection,
} from "@/components/HomeMarketingSections";
import { getSiteSettings } from "@/lib/siteSettings";
import { dedupeSeries } from "@/lib/series";
import { getBestsellerIds } from "@/lib/recommendations";
import { isNewBook } from "@/lib/badges";
import { getCategoryStyle, getCuratedCategories } from "@/lib/categoryStyle";
import { getCurrentCustomer } from "@/lib/customerSession";
import { getActiveProfile } from "@/lib/activeProfile";
import { countWords, paginateContent } from "@/lib/paginate";

function withBadges<T extends { id: string; createdAt: Date }>(
  books: T[],
  bestsellerIds: Set<string>
): (T & { isNew: boolean; isBestseller: boolean })[] {
  return books.map((b) => ({ ...b, isNew: isNewBook(b.createdAt), isBestseller: bestsellerIds.has(b.id) }));
}

export default async function HomePage() {
  const customer = await getCurrentCustomer();
  const activeProfile = customer ? await getActiveProfile(customer.id) : null;

  const [ebooks, settings, catalogs, bestsellerIds] = await Promise.all([
    prisma.eBook.findMany({
      where: { audience: "adults" },
      orderBy: { createdAt: "asc" },
    }),
    getSiteSettings(),
    prisma.catalog.findMany({
      include: { ebooks: { where: { audience: "adults" } } },
      orderBy: { createdAt: "asc" },
    }),
    getBestsellerIds(),
  ]);
  const catalogsWithBooks = catalogs
    .filter((c) => c.ebooks.length > 0)
    .map((c) => ({ ...c, ebooks: withBadges(dedupeSeries(c.ebooks), bestsellerIds) }));
  const latestBooks = withBadges(
    dedupeSeries([...ebooks].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())).slice(0, 4),
    bestsellerIds
  );
  const featured = ebooks.filter((e) => e.featured);
  const heroCovers = (featured.length > 0 ? featured : ebooks).slice(0, 5);
  const allCategories = Array.from(new Set(ebooks.map((e) => e.category)));
  const categoryCount = allCategories.length;
  const featuredCategories = getCuratedCategories(allCategories);
  const browseHref = activeProfile ? `/p/${activeProfile.id}` : "/login";

  return (
    <>
      <Header />

      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a0918] via-[#150f2e] to-navy-dark px-6 pb-20 pt-16 text-white">
        <div className="pointer-events-none absolute -right-52 -top-52 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(124,92,255,0.3),transparent_70%)]" />
        <div className="lumina-glow -left-32 top-40 h-72 w-72 bg-[#5b3df0]/30" />
        <div className="lumina-glow bottom-0 left-1/3 h-56 w-56 bg-[#a78bfa]/20" style={{ animationDelay: "3s" }} />
        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-14 md:grid-cols-2">
          <div>
            <span className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4.5 py-2 text-[0.82rem] font-bold uppercase tracking-wide text-[#c9bdff]">
              ✦ LUMINA
            </span>
            <h1 className="mb-6 text-[2.6rem] font-extrabold leading-[1.08] tracking-tight md:text-[3.5rem]">
              {settings?.heroTitle ? (
                settings.heroTitle
              ) : (
                <>
                  Apprenez quelque chose de{" "}
                  <span className="bg-gradient-to-br from-[#a78bfa] to-white bg-clip-text text-transparent">
                    nouveau chaque jour
                  </span>
                </>
              )}
            </h1>
            <p className="mb-10 max-w-lg text-lg text-[#c3bfe8]">
              {settings?.heroSubtitle ??
                "Des iBooks courts, captivants et accessibles pour développer votre culture, votre mental et vos connaissances. Découvrez des lectures pensées pour vous et toute votre famille."}
            </p>
            <div className="flex flex-wrap gap-4.5">
              <Link
                href="#catalogue"
                className="rounded-2xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-7 py-3.5 text-sm font-bold shadow-[0_12px_30px_rgba(124,92,255,0.4)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(124,92,255,0.5)]"
              >
                Découvrir la bibliothèque
              </Link>
              <Link
                href="/signup"
                className="rounded-2xl border border-gray-mid bg-white px-7 py-3.5 text-sm font-bold text-navy shadow-[0_8px_24px_rgba(8,27,69,0.1)] transition hover:-translate-y-0.5"
              >
                Commencer gratuitement
              </Link>
            </div>

            {ebooks.length > 0 && (
              <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-2 text-sm font-semibold text-[#c3bfe8]">
                <span className="flex items-center gap-2">
                  <span className="text-lg">📚</span>
                  {ebooks.length} eBook{ebooks.length > 1 ? "s" : ""} au catalogue
                </span>
                {categoryCount > 0 && (
                  <span className="flex items-center gap-2">
                    <span className="text-lg">✦</span>
                    {categoryCount} catégorie{categoryCount > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-center md:justify-end">
            <HeroDeviceShowcase books={heroCovers} />
          </div>
        </div>

        <svg
          className="absolute inset-x-0 bottom-0 block w-full"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path
            fill="#0a0918"
            d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,80C1120,85,1280,75,1360,69.3L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
          />
        </svg>
      </section>

      <FeatureHighlights />

      {featuredCategories.length > 0 && (
        <section className="bg-[#0d0b22] px-6 py-20 text-white">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-8 text-lg font-extrabold">Explorer par catégorie</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {featuredCategories.map((category, i) => {
                const style = getCategoryStyle(category, i);
                return (
                  <Link
                    key={category}
                    href={browseHref}
                    style={{ animationDelay: `${i * 60}ms` }}
                    className={`animate-fade-in-up group flex flex-col items-center justify-center gap-2 rounded-2xl border border-transparent bg-gradient-to-br ${style.gradient} p-5 text-center shadow-[0_10px_28px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.05] hover:border-[#d4af37]/40 hover:shadow-[0_20px_44px_rgba(212,175,55,0.25)]`}
                  >
                    <span className="text-3xl transition-transform duration-300 group-hover:scale-110">
                      {style.emoji}
                    </span>
                    <span className="text-xs font-bold leading-tight">{category}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {catalogsWithBooks.length > 0 && (
        <section className="bg-[#0a0918] px-6 pb-4 pt-20 text-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-12">
            {catalogsWithBooks.map((catalog) => (
              <BookRow
                key={catalog.id}
                label={catalog.name}
                tagline={catalog.description}
                books={catalog.ebooks}
              />
            ))}
          </div>
        </section>
      )}

      {ebooks.length > 0 && (
        <section className="bg-[#0a0918] px-6 pb-4 pt-20 text-white">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-8 text-lg font-extrabold">Tous les livres</h2>
            <BookCoverShelf books={dedupeSeries(ebooks)} />
          </div>
        </section>
      )}

      <section id="catalogue" className="bg-[#0a0918] px-6 py-28 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-16 max-w-xl text-center">
            <span className="mb-3.5 inline-block text-[0.82rem] font-extrabold uppercase tracking-wider text-[#a78bfa]">
              Nos dernières parutions
            </span>
            <h2 className="mb-4 text-[2rem] font-extrabold tracking-tight text-white md:text-[2.75rem]">
              Découvrez nos nouveaux iBooks
            </h2>
            <p className="text-[1.05rem] text-[color:var(--color-lumina-text-muted)]">
              Trouvez votre prochaine lecture parmi nos dernières parutions.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {latestBooks.map((ebook, i) => (
              <EBookCard
                key={ebook.id}
                slug={ebook.slug}
                title={ebook.title}
                category={ebook.category}
                description={ebook.subtitle}
                coverEmoji={ebook.coverEmoji}
                coverTheme={ebook.coverTheme}
                coverImageUrl={ebook.coverImageUrl}
                price={ebook.price}
                oldPrice={ebook.oldPrice}
                pages={ebook.pdfUrl ? undefined : paginateContent(ebook.content).length}
                readingMinutes={ebook.pdfUrl ? undefined : Math.max(1, Math.round(countWords(ebook.content) / 200))}
                animationDelayMs={i * 80}
              />
            ))}
          </div>
        </div>
      </section>

      <KidsModeSection />

      <HowItWorksSection />

      <ReadingExperienceSection books={ebooks} />

      <CompatibilitySection />

      <section id="avis" className="bg-[#0d0b22] px-6 py-28 text-white">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[2fr_1fr]">
          <div>
            <span className="mb-3.5 inline-block text-[0.82rem] font-extrabold uppercase tracking-wider text-[#a78bfa]">
              Ils l&apos;ont fait
            </span>
            <h2 className="mb-7 text-[1.6rem] font-extrabold tracking-tight text-white md:text-[2.1rem]">
              Avis de nos clients
            </h2>
            <div className="grid gap-5 sm:grid-cols-3">
              {[
                { quote: "Une superbe sélection de livres, très pratique et facile à utiliser.", name: "Sophie L." },
                { quote: "Les eBooks sont de grande qualité, ça se remarque.", name: "Marc D." },
                { quote: "Excellent site ! J'ai trouvé exactement ce que je cherchais.", name: "Julien D." },
              ].map((t) => (
                <div
                  key={t.name}
                  className="lumina-card flex flex-col justify-between gap-4.5 rounded-2xl p-6"
                >
                  <p className="text-base font-bold tracking-tight text-white">&quot;{t.quote}&quot;</p>
                  <div className="flex items-center justify-between text-[0.82rem]">
                    <span className="tracking-wide text-[#ffb020]">★★★★★</span>
                    <span className="font-semibold text-[color:var(--color-lumina-text-muted)]">{t.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-center rounded-[22px] bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] p-10 text-white shadow-strong">
            <h3 className="mb-3.5 text-2xl font-extrabold tracking-tight">
              Lisez dès aujourd&apos;hui !
            </h3>
            <p className="mb-6.5 text-[0.92rem] text-[#e4defc]">
              Obtenez vos eBooks instantanément et commencez à lire en quelques clics.
            </p>
            <Link
              href="#catalogue"
              className="rounded-2xl bg-white px-7 py-3.5 text-center text-sm font-bold text-navy shadow-[0_12px_28px_rgba(0,0,0,0.2)] transition hover:bg-[#f0f4ff]"
            >
              Acheter maintenant
            </Link>
          </div>
        </div>
      </section>

      <FinalCtaBand />

      <Footer />
    </>
  );
}
