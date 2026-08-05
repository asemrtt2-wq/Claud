"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  createCollection,
  deleteCollection,
  removeFromCollection,
} from "@/lib/customerActions";

type CollectionSummary = {
  id: string;
  name: string;
  items: {
    ebook: { id: string; slug: string; title: string; coverEmoji: string; coverTheme: string };
  }[];
};

export default function CollectionsManager({
  collections,
}: {
  collections: CollectionSummary[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      await createCollection(name.trim());
      setName("");
      setShowForm(false);
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Supprimer cette collection ?")) return;
    startTransition(() => {
      deleteCollection(id);
    });
  }

  function handleRemoveBook(collectionId: string, ebookId: string) {
    startTransition(() => {
      removeFromCollection(collectionId, ebookId);
    });
  }

  return (
    <div>
      {collections.length > 0 && (
        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c) => (
            <div key={c.id} className="lumina-card rounded-2xl p-4">
              <div className="mb-3 flex items-center justify-between">
                <button
                  onClick={() => setExpandedId((v) => (v === c.id ? null : c.id))}
                  className="text-sm font-bold hover:underline"
                >
                  📁 {c.name}
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  disabled={isPending}
                  className="text-xs font-bold text-[#ff8a8a] hover:underline"
                >
                  Supprimer
                </button>
              </div>
              {c.items.length === 0 ? (
                <p className="text-xs text-[color:var(--color-lumina-text-muted)]">
                  Aucun livre pour l&apos;instant.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {c.items.slice(0, expandedId === c.id ? undefined : 6).map((item) => (
                    <div key={item.ebook.id} className="relative">
                      <Link href={`/ebooks/${item.ebook.slug}`}>
                        <span
                          className={`cover-theme-${item.ebook.coverTheme} flex h-12 w-12 items-center justify-center rounded-lg text-xl`}
                          title={item.ebook.title}
                        >
                          {item.ebook.coverEmoji}
                        </span>
                      </Link>
                      {expandedId === c.id && (
                        <button
                          onClick={() => handleRemoveBook(c.id, item.ebook.id)}
                          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff8a8a] text-xs font-bold text-navy"
                          title="Retirer"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="rounded-xl border border-dashed border-white/20 px-5 py-3 text-sm font-bold text-[color:var(--color-lumina-text-muted)] transition hover:border-[#a78bfa] hover:text-white"
        >
          + Nouvelle collection
        </button>
      ) : (
        <form onSubmit={handleCreate} className="flex max-w-md gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom de la collection"
            required
            autoFocus
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-[color:var(--color-lumina-text-muted)] focus:border-[#7c5cff]"
          />
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-5 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            Créer
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold transition hover:border-white/30"
          >
            Annuler
          </button>
        </form>
      )}
    </div>
  );
}
