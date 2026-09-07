import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminNav from "@/components/AdminNav";
import FaqAdminList from "@/components/FaqAdminList";
import { createFaqItem } from "@/lib/faqActions";

/**
 * Where the public /faq page is written. Answers live in the database so a new question can
 * be answered without a deploy — same reasoning as the editable hero copy in /admin/settings.
 */
export default async function AdminFaqPage() {
  const session = await getServerSession(authOptions);
  const items = await prisma.faqItem.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="lumia-shell min-h-screen">
      <AdminNav email={session?.user?.email} />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-white">❓ FAQ</h1>
        <p className="mb-8 text-sm text-[color:var(--color-lumia-text-muted)]">
          Ces questions/réponses alimentent la page publique{" "}
          <Link href="/faq" className="font-semibold text-[#a78bfa] hover:underline">
            /faq
          </Link>
          . Une catégorie regroupe plusieurs questions sous un même titre ; laisse-la vide pour
          une question isolée.
        </p>

        <form
          action={createFaqItem}
          className="lumia-card mb-10 space-y-4 rounded-2xl p-5 sm:p-6"
        >
          <p className="font-extrabold text-white">Ajouter une question</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[color:var(--color-lumia-text-muted)]">
                Question
              </span>
              <input
                name="question"
                required
                maxLength={300}
                placeholder="Comment fonctionne l'abonnement Premium ?"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-[#7c5cff]"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[color:var(--color-lumia-text-muted)]">
                Catégorie (facultatif)
              </span>
              <input
                name="category"
                maxLength={80}
                placeholder="Abonnement"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-[#7c5cff]"
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[color:var(--color-lumia-text-muted)]">
              Réponse
            </span>
            <textarea
              name="answer"
              required
              rows={4}
              className="w-full resize-y rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-[#7c5cff]"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-[color:var(--color-lumia-text-muted)]">
            <input
              type="checkbox"
              name="published"
              defaultChecked
              className="h-4 w-4 accent-[#7c5cff]"
            />
            Publier tout de suite
          </label>
          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-5 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 sm:w-auto"
          >
            Ajouter
          </button>
        </form>

        <FaqAdminList
          items={items.map((item) => ({
            id: item.id,
            question: item.question,
            answer: item.answer,
            category: item.category,
            position: item.position,
            published: item.published,
          }))}
        />
      </div>
    </div>
  );
}
