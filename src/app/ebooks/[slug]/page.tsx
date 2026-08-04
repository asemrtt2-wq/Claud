import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customerSession";
import { hasAccessToEbook } from "@/lib/access";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BuyButton from "@/components/BuyButton";
import FavoriteButton from "@/components/FavoriteButton";

export default async function EBookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ebook = await prisma.eBook.findUnique({ where: { slug } });

  if (!ebook) notFound();

  const customer = await getCurrentCustomer();
  const isLoggedIn = Boolean(customer);
  const [hasAccess, favorite] = customer
    ? await Promise.all([
        hasAccessToEbook(customer.id, ebook.id),
        prisma.favorite.findUnique({
          where: { customerId_ebookId: { customerId: customer.id, ebookId: ebook.id } },
        }),
      ])
    : [false, null];

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
            <div className="mb-3 flex items-center justify-between">
              <span className="inline-block text-[0.82rem] font-extrabold uppercase tracking-wider text-royal">
                {ebook.category}
              </span>
              <FavoriteButton
                ebookId={ebook.id}
                slug={ebook.slug}
                initialFavorited={Boolean(favorite)}
                isLoggedIn={isLoggedIn}
              />
            </div>
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

            {hasAccess ? (
              <div className="max-w-sm rounded-[22px] border border-gray-mid bg-white p-6 shadow-soft">
                <Link
                  href={`/read/${ebook.slug}`}
                  className="block rounded-2xl bg-gradient-to-br from-royal to-[#3a6bff] px-7 py-3.5 text-center text-sm font-bold text-white shadow-[0_12px_30px_rgba(30,91,255,0.4)] transition hover:-translate-y-0.5"
                >
                  📖 Lire maintenant
                </Link>
              </div>
            ) : (
              <div className="max-w-sm rounded-[22px] border border-gray-mid bg-white p-6 shadow-soft">
                <BuyButton ebookId={ebook.id} isLoggedIn={isLoggedIn} />
                <Link
                  href="/premium"
                  className="mt-3 block rounded-2xl border border-gray-mid px-7 py-3 text-center text-sm font-bold text-navy transition hover:border-royal"
                >
                  ✨ Lire gratuitement avec Premium
                </Link>
                <p className="mt-4 text-xs text-text-muted">
                  🔒 Paiement sécurisé via Stripe — accès immédiat après paiement.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
