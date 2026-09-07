"use client";

import { useState } from "react";
import { deleteFaqItem, moveFaqItem, updateFaqItem } from "@/lib/faqActions";

export type AdminFaqItem = {
  id: string;
  question: string;
  answer: string;
  category: string;
  position: number;
  published: boolean;
};

/**
 * The admin list of FAQ entries. Editing happens inline — one row expands into its own form
 * rather than navigating to a separate edit page, since an answer is a couple of fields.
 */
export default function FaqAdminList({ items }: { items: AdminFaqItem[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <p className="lumia-card rounded-2xl p-6 text-center text-sm text-[color:var(--color-lumia-text-muted)]">
        Aucune question pour le moment. Ajoute la première ci-dessus.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li key={item.id} className="lumia-card rounded-2xl p-5">
          {editingId === item.id ? (
            <form
              action={async (formData) => {
                await updateFaqItem(item.id, formData);
                setEditingId(null);
              }}
              className="space-y-3"
            >
              <input
                name="question"
                defaultValue={item.question}
                required
                maxLength={300}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-white outline-none focus:border-[#7c5cff]"
              />
              <textarea
                name="answer"
                defaultValue={item.answer}
                required
                rows={4}
                className="w-full resize-y rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#7c5cff]"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  name="category"
                  defaultValue={item.category}
                  placeholder="Catégorie"
                  maxLength={80}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-[#7c5cff]"
                />
                <input type="hidden" name="position" value={item.position} />
                <label className="flex items-center gap-2 text-sm text-[color:var(--color-lumia-text-muted)]">
                  <input
                    type="checkbox"
                    name="published"
                    defaultChecked={item.published}
                    className="h-4 w-4 accent-[#7c5cff]"
                  />
                  Publiée
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-5 py-2.5 text-sm font-bold text-white"
                >
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-bold text-white"
                >
                  Annuler
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-bold text-white">
                  {item.question}
                  {!item.published && (
                    <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[0.65rem] font-bold text-amber-200">
                      Brouillon
                    </span>
                  )}
                  {item.category && (
                    <span className="rounded-full border border-white/15 px-2 py-0.5 text-[0.65rem] font-bold text-[color:var(--color-lumia-text-muted)]">
                      {item.category}
                    </span>
                  )}
                </p>
                <p className="mt-1.5 whitespace-pre-wrap text-sm text-[color:var(--color-lumia-text-muted)]">
                  {item.answer}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2 text-sm font-bold">
                <form action={moveFaqItem.bind(null, item.id, "up")}>
                  <button
                    type="submit"
                    disabled={index === 0}
                    aria-label="Monter"
                    className="rounded-lg border border-white/15 px-2.5 py-1.5 text-white transition hover:border-[#a78bfa] disabled:opacity-30"
                  >
                    ↑
                  </button>
                </form>
                <form action={moveFaqItem.bind(null, item.id, "down")}>
                  <button
                    type="submit"
                    disabled={index === items.length - 1}
                    aria-label="Descendre"
                    className="rounded-lg border border-white/15 px-2.5 py-1.5 text-white transition hover:border-[#a78bfa] disabled:opacity-30"
                  >
                    ↓
                  </button>
                </form>
                <button
                  type="button"
                  onClick={() => setEditingId(item.id)}
                  className="text-[#a78bfa] hover:underline"
                >
                  Modifier
                </button>
                <form action={deleteFaqItem.bind(null, item.id)}>
                  <button
                    type="submit"
                    className="text-[color:var(--color-lumia-text-muted)] transition hover:text-red-300"
                  >
                    Supprimer
                  </button>
                </form>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
