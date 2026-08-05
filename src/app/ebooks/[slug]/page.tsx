import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customerSession";
import { hasAccessToEbook } from "@/lib/access";
import { getActiveProfile } from "@/lib/activeProfile";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BuyButton from "@/components/BuyButton";
import FavoriteButton from "@/components/FavoriteButton";
import AddToCollectionButton from "@/components/AddToCollectionButton";

export default async function EBookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ebook = await prisma.eBook.findUnique({ where: { slug } });

  if (!ebook || ebook.audience === "kids") notFound();

  const customer = await getCurrentCustomer();
  const isLoggedIn = Boolean(customer);
  const activeProfile = customer ? await getActiveProfile(customer.id) : null;

  const [hasAccess, favorite, collections] = customer
    ? await Promise.all([
        hasAccessToEbook(customer.id, ebook.id),
        activeProfile
          ? prisma.favorite.findUnique({
              where: { profileId_ebookId: { profileId: activeProfile.id, ebookId: ebook.id } },
            })
          : Promise.resolve(null),
        activeProfile
          ? prisma.collection.findMany({
              where: { profileId: activeProfile.id },
              include: { items: { where: { ebookId: ebook.id } } },
              orderBy: { createdAt: "desc" },
            })
          : Promise.resolve([]),
      ])
    : [false, null, []];

  const collectionOptions = collections.map((c) => ({
    id: c.id,
    name: c.name,
    hasBook: c.items.length > 0,
  }));

  const discount = ebook.oldPrice
    ? Math.round(100 - (ebook.price / ebook.oldPrice) * 100)
    : null;

  return (
    <>
      <Header />
      <section className="lumina-shell px-6 py-20">
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
              <span className="inline-block text-[0.82rem] font-extrabold uppercase tracking-wider text-[#a78bfa]">
                {ebook.category}
              </span>
              <div className="flex items-center gap-2">
                <FavoriteButton
                  ebookId={ebook.id}
                  slug={ebook.slug}
                  initialFavorited={Boolean(favorite)}
                  profileId={activeProfile?.id ?? null}
                />
                <AddToCollectionButton
                  ebookId={ebook.id}
                  collections={collectionOptions}
                  profileId={activeProfile?.id ?? null}
                />
              </div>
            </div>
            <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-white">
              {ebook.title}
            </h1>
            <p className="mb-6 text-lg font-semibold text-[color:var(--color-lumina-text-muted)]">
              {ebook.subtitle}
            </p>
            <p className="mb-8 leading-relaxed text-[color:var(--color-lumina-text-muted)]">
              {ebook.description}
            </p>

            <div className="mb-8 flex items-baseline gap-3">
              {ebook.oldPrice && (
                <span className="text-xl font-bold text-white/40 line-through">
                  {ebook.oldPrice} €
                </span>
              )}
              <span className="text-4xl font-extrabold tracking-tight text-white">
                {ebook.price} €
              </span>
              {discount && (
                <span className="rounded-full bg-gradient-to-br from-[#ff3b3b] to-[#c9192a] px-3 py-1 text-xs font-extrabold text-white">
                  -{discount}%
                </span>
              )}
            </div>

            {hasAccess ? (
              <div className="lumina-card max-w-sm rounded-[22px] p-6">
                <Link
                  href={activeProfile ? `/p/${activeProfile.id}/read/${ebook.slug}` : "/profiles"}
                  className="block rounded-2xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-7 py-3.5 text-center text-sm font-bold text-white shadow-[0_12px_30px_rgba(124,92,255,0.4)] transition hover:-translate-y-0.5"
                >
                  📖 Lire maintenant
                </Link>
              </div>
            ) : (
              <div className="lumina-card max-w-sm rounded-[22px] p-6">
                <BuyButton ebookId={ebook.id} isLoggedIn={isLoggedIn} />
                <Link
                  href="/premium"
                  className="mt-3 block rounded-2xl border border-white/15 px-7 py-3 text-center text-sm font-bold text-white transition hover:border-[#7c5cff]"
                >
                  ✨ Lire gratuitement avec Premium
                </Link>
                <p className="mt-4 text-xs text-[color:var(--color-lumina-text-muted)]">
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
