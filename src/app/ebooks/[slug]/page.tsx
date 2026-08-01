import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BuyButton from "@/components/BuyButton";

export default async function EBookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ebook = await prisma.eBook.findUnique({ where: { slug } });

  if (!ebook) notFound();

  const discount = ebook.oldPrice
    ? Math.round(100 - (ebook.price / ebook.oldPrice) * 100)
    : null;

  return (
    <>
      <Header />
      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-5xl gap-14 md:grid-cols-2">
          <div
            className={`cover-theme-${ebook.coverTheme} relative flex h-[420px] flex-col justify-between rounded-[22px] p-9 text-white shadow-strong`}
          >
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#c3d3ff]">
              {ebook.category}
            </span>
            <div className="flex flex-1 items-center justify-center text-8xl">
              {ebook.coverEmoji}
            </div>
            <h1 className="text-2xl font-extrabold leading-tight tracking-tight">
              {ebook.title}
            </h1>
          </div>

          <div>
            <span className="mb-3 inline-block text-[0.82rem] font-extrabold uppercase tracking-wider text-royal">
              {ebook.category}
            </span>
            <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-navy">
              {ebook.title}
            </h1>
            <p className="mb-6 text-lg font-semibold text-text-muted">{ebook.subtitle}</p>
            <p className="mb-8 leading-relaxed text-text-muted">{ebook.description}</p>

            <div className="mb-8 flex items-baseline gap-3">
              {ebook.oldPrice && (
                <span className="text-xl font-bold text-[#a7b1c9] line-through">
                  {ebook.oldPrice} €
                </span>
              )}
              <span className="text-4xl font-extrabold tracking-tight text-navy">
                {ebook.price} €
              </span>
              {discount && (
                <span className="rounded-full bg-gradient-to-br from-[#ff3b3b] to-[#c9192a] px-3 py-1 text-xs font-extrabold text-white">
                  -{discount}%
                </span>
              )}
            </div>

            <div className="max-w-sm rounded-[22px] border border-gray-mid bg-white p-6 shadow-soft">
              <BuyButton ebookId={ebook.id} />
              <p className="mt-4 text-xs text-text-muted">
                🔒 Paiement sécurisé via Stripe — accès immédiat après paiement.
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
