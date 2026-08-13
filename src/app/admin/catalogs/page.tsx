import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminNav from "@/components/AdminNav";
import DeleteCatalogButton from "@/components/DeleteCatalogButton";
import { createCatalog, renameCatalog } from "@/lib/actions";

export default async function AdminCatalogsPage() {
  const [session, catalogs] = await Promise.all([
    getServerSession(authOptions),
    prisma.catalog.findMany({
      include: { _count: { select: { ebooks: true } } },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <div className="lumina-shell">
      <AdminNav email={session?.user?.email} />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-white">Catalogues</h1>
        <p className="mb-6 text-sm text-[color:var(--color-lumina-text-muted)]">
          Crée des rangées personnalisées (ex : "Coup de cœur", "Best-sellers") — elles
          apparaissent sur la page d&apos;accueil et le tableau de bord dès qu&apos;un livre y est
          rattaché. Rattache un livre à un catalogue depuis sa fiche dans{" "}
          <span className="font-semibold text-white">Modifier l&apos;eBook</span>.
        </p>

        <form
          action={createCatalog}
          className="lumina-card mb-8 flex flex-col gap-3 rounded-2xl p-5"
        >
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              name="name"
              required
              placeholder="Nom du catalogue (ex : Coup de cœur)"
              className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#a78bfa]"
            />
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-5 py-2.5 text-sm font-bold text-white shadow-[0_12px_24px_rgba(124,92,255,0.35)] transition hover:-translate-y-0.5"
            >
              + Créer
            </button>
          </div>
          <input
            type="text"
            name="description"
            placeholder="Accroche (optionnel, ex : « Construis un mental que rien ne peut briser. »)"
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#a78bfa]"
          />
        </form>

        <div className="flex flex-col gap-3">
          {catalogs.map((catalog) => (
            <div
              key={catalog.id}
              className="lumina-card flex flex-col gap-3 rounded-2xl p-4"
            >
              <form
                action={renameCatalog.bind(null, catalog.id)}
                className="flex flex-col gap-2"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={catalog.name}
                    className="min-w-0 flex-1 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white outline-none focus:border-[#a78bfa]"
                  />
                  <span className="shrink-0 text-xs text-[color:var(--color-lumina-text-muted)]">
                    {catalog._count.ebooks} livre{catalog._count.ebooks > 1 ? "s" : ""}
                  </span>
                  <button
                    type="submit"
                    className="shrink-0 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-bold text-white transition hover:border-[#a78bfa]"
                  >
                    Enregistrer
                  </button>
                  <DeleteCatalogButton id={catalog.id} name={catalog.name} />
                </div>
                <input
                  type="text"
                  name="description"
                  defaultValue={catalog.description ?? ""}
                  placeholder="Accroche (optionnel)"
                  className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#a78bfa]"
                />
              </form>
            </div>
          ))}
          {catalogs.length === 0 && (
            <p className="text-sm text-[color:var(--color-lumina-text-muted)]">
              Aucun catalogue pour le moment.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
