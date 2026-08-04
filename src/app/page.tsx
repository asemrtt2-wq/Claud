import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroCovers from "@/components/HeroCovers";
import EBookCard from "@/components/EBookCard";

export default async function HomePage() {
  const ebooks = await prisma.eBook.findMany({ orderBy: { createdAt: "asc" } });
  const featured = ebooks.filter((e) => e.featured).slice(0, 3);
  const heroCovers = featured.length === 3 ? featured : ebooks.slice(0, 3);

  return (
    <>
      <Header />

      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a0918] via-[#150f2e] to-navy-dark px-6 pb-20 pt-16 text-white">
        <div className="pointer-events-none absolute -right-52 -top-52 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(124,92,255,0.3),transparent_70%)]" />
        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-14 md:grid-cols-2">
          <div>
            <span className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4.5 py-2 text-[0.82rem] font-bold uppercase tracking-wide text-[#c9bdff]">
              ✦ LUMINA
            </span>
            <h1 className="mb-6 text-[2.6rem] font-extrabold leading-[1.08] tracking-tight md:text-[3.5rem]">
              Remplace les écrans par des{" "}
              <span className="bg-gradient-to-br from-[#a78bfa] to-white bg-clip-text text-transparent">
                histoires qui te transforment
              </span>
            </h1>
            <p className="mb-10 max-w-lg text-lg text-[#c3bfe8]">
              L&apos;application qui t&apos;aide à reprendre le contrôle de ton temps grâce à des
              eBooks immersifs, interactifs et motivants.
            </p>
            <div className="flex flex-wrap gap-4.5">
              <Link
                href="/signup"
                className="rounded-2xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-7 py-3.5 text-sm font-bold shadow-[0_12px_30px_rgba(124,92,255,0.4)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(124,92,255,0.5)]"
              >
                Commencer gratuitement
              </Link>
              <Link
                href="#catalogue"
                className="rounded-2xl border border-gray-mid bg-white px-7 py-3.5 text-sm font-bold text-navy shadow-[0_8px_24px_rgba(8,27,69,0.1)] transition hover:-translate-y-0.5"
              >
                En savoir plus
              </Link>
            </div>
          </div>

          <HeroCovers ebooks={heroCovers} />
        </div>

        <svg
          className="absolute inset-x-0 bottom-0 block w-full"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path
            fill="#ffffff"
            d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,80C1120,85,1280,75,1360,69.3L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
          />
        </svg>
      </section>

      <section id="catalogue" className="px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-16 max-w-xl text-center">
            <span className="mb-3.5 inline-block text-[0.82rem] font-extrabold uppercase tracking-wider text-royal">
              Le catalogue
            </span>
            <h2 className="mb-4 text-[2rem] font-extrabold tracking-tight text-navy md:text-[2.75rem]">
              Nos eBooks populaires
            </h2>
            <p className="text-[1.05rem] text-text-muted">
              Explorez notre collection d&apos;eBooks pour tous les goûts et toutes les passions.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {ebooks.map((ebook) => (
              <EBookCard
                key={ebook.id}
                slug={ebook.slug}
                title={ebook.title}
                category={ebook.category}
                coverEmoji={ebook.coverEmoji}
                coverTheme={ebook.coverTheme}
                price={ebook.price}
                oldPrice={ebook.oldPrice}
              />
            ))}
          </div>
        </div>
      </section>

      <section id="avis" className="bg-gray-light px-6 py-28">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[2fr_1fr]">
          <div>
            <span className="mb-3.5 inline-block text-[0.82rem] font-extrabold uppercase tracking-wider text-royal">
              Ils l&apos;ont fait
            </span>
            <h2 className="mb-7 text-[1.6rem] font-extrabold tracking-tight text-navy md:text-[2.1rem]">
              Avis de nos clients
            </h2>
            <div className="grid gap-5 sm:grid-cols-3">
              {[
                { quote: "Une superbe sélection de livres, très pratique et facile à télécharger.", name: "Sophie L." },
                { quote: "Les eBooks sont de grande qualité, ça se remarque.", name: "Marc D." },
                { quote: "Excellent site ! J'ai trouvé exactement ce que je cherchais.", name: "Julien D." },
              ].map((t) => (
                <div
                  key={t.name}
                  className="flex flex-col justify-between gap-4.5 rounded-2xl border border-gray-mid bg-white p-6 shadow-soft"
                >
                  <p className="text-base font-bold tracking-tight text-navy">&quot;{t.quote}&quot;</p>
                  <div className="flex items-center justify-between text-[0.82rem]">
                    <span className="tracking-wide text-[#ffb020]">★★★★★</span>
                    <span className="font-semibold text-text-muted">{t.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-center rounded-[22px] bg-gradient-to-br from-royal to-navy p-10 text-white shadow-strong">
            <h3 className="mb-3.5 text-2xl font-extrabold tracking-tight">
              Lisez dès aujourd&apos;hui !
            </h3>
            <p className="mb-6.5 text-[0.92rem] text-[#dbe4ff]">
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

      <Footer />
    </>
  );
}
