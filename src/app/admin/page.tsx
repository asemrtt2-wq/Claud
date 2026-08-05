import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminNav from "@/components/AdminNav";
import DeleteEbookButton from "@/components/DeleteEbookButton";

function EbookTable({ ebooks }: { ebooks: Awaited<ReturnType<typeof prisma.eBook.findMany>> }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-mid bg-white shadow-soft">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-light text-xs font-bold uppercase tracking-wide text-text-muted">
          <tr>
            <th className="px-5 py-3">Titre</th>
            <th className="px-5 py-3">Catégorie</th>
            <th className="px-5 py-3">Prix</th>
            <th className="px-5 py-3">Vedette</th>
            <th className="px-5 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {ebooks.map((ebook) => (
            <tr key={ebook.id} className="border-t border-gray-mid">
              <td className="px-5 py-3 font-semibold text-navy">
                {ebook.coverEmoji} {ebook.title}
              </td>
              <td className="px-5 py-3 text-text-muted">{ebook.category}</td>
              <td className="px-5 py-3 text-navy">{ebook.price} €</td>
              <td className="px-5 py-3">{ebook.featured ? "✅" : "—"}</td>
              <td className="px-5 py-3 text-right">
                <div className="flex justify-end gap-3">
                  <Link
                    href={`/admin/ebooks/${ebook.id}/edit`}
                    className="font-semibold text-royal hover:underline"
                  >
                    Modifier
                  </Link>
                  <DeleteEbookButton id={ebook.id} title={ebook.title} />
                </div>
              </td>
            </tr>
          ))}
          {ebooks.length === 0 && (
            <tr>
              <td colSpan={5} className="px-5 py-8 text-center text-text-muted">
                Aucun eBook pour le moment.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  const [ebooks, orderCount, paidOrders] = await Promise.all([
    prisma.eBook.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "paid" } }),
  ]);
  const adultEbooks = ebooks.filter((e) => e.audience !== "kids");
  const kidsEbooks = ebooks.filter((e) => e.audience === "kids");

  return (
    <div className="min-h-screen bg-gray-light">
      <AdminNav email={session?.user?.email} />
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 grid grid-cols-4 gap-5">
          <div className="rounded-2xl border border-gray-mid bg-white p-5 shadow-soft">
            <p className="text-xs font-bold uppercase tracking-wide text-text-muted">Adultes</p>
            <p className="text-2xl font-extrabold text-navy">{adultEbooks.length}</p>
          </div>
          <div className="rounded-2xl border border-gray-mid bg-white p-5 shadow-soft">
            <p className="text-xs font-bold uppercase tracking-wide text-text-muted">Enfants</p>
            <p className="text-2xl font-extrabold text-navy">{kidsEbooks.length}</p>
          </div>
          <div className="rounded-2xl border border-gray-mid bg-white p-5 shadow-soft">
            <p className="text-xs font-bold uppercase tracking-wide text-text-muted">Commandes</p>
            <p className="text-2xl font-extrabold text-navy">{orderCount}</p>
          </div>
          <div className="rounded-2xl border border-gray-mid bg-white p-5 shadow-soft">
            <p className="text-xs font-bold uppercase tracking-wide text-text-muted">Payées</p>
            <p className="text-2xl font-extrabold text-navy">{paidOrders}</p>
          </div>
        </div>

        <section id="adultes" className="mb-12 scroll-mt-24">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-extrabold tracking-tight text-navy">
              📚 Catalogue Adultes
            </h1>
            <Link
              href="/admin/ebooks/new?audience=adults"
              className="rounded-xl bg-gradient-to-br from-royal to-[#3a6bff] px-5 py-2.5 text-sm font-bold text-white shadow-[0_12px_24px_rgba(30,91,255,0.35)] transition hover:-translate-y-0.5"
            >
              + Nouvel eBook
            </Link>
          </div>
          <EbookTable ebooks={adultEbooks} />
        </section>

        <section id="enfants" className="scroll-mt-24">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-extrabold tracking-tight text-navy">
              🧒 Catalogue Enfants
            </h1>
            <Link
              href="/admin/ebooks/new?audience=kids"
              className="rounded-xl bg-gradient-to-br from-royal to-[#3a6bff] px-5 py-2.5 text-sm font-bold text-white shadow-[0_12px_24px_rgba(30,91,255,0.35)] transition hover:-translate-y-0.5"
            >
              + Nouvel eBook
            </Link>
          </div>
          <EbookTable ebooks={kidsEbooks} />
        </section>
      </div>
    </div>
  );
}
