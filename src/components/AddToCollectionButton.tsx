"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { addToCollection, createCollection } from "@/lib/customerActions";

type CollectionOption = { id: string; name: string; hasBook: boolean };

export default function AddToCollectionButton({
  ebookId,
  collections,
  isLoggedIn,
}: {
  ebookId: string;
  collections: CollectionOption[];
  isLoggedIn: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [added, setAdded] = useState<Record<string, boolean>>({});
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!isLoggedIn) return null;

  function handleAdd(collectionId: string) {
    setAdded((a) => ({ ...a, [collectionId]: true }));
    startTransition(() => {
      addToCollection(collectionId, ebookId);
    });
  }

  function handleCreateAndAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    startTransition(async () => {
      const id = await createCollection(newName.trim());
      await addToCollection(id, ebookId);
      setNewName("");
      setOpen(false);
    });
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-bold text-white transition hover:border-[#7c5cff]"
      >
        📁 Ajouter à une collection
      </button>

      {open && (
        <div className="lumina-card absolute right-0 top-12 z-50 w-64 rounded-2xl p-3">
          {collections.length === 0 ? (
            <p className="mb-2 px-1 text-xs text-[color:var(--color-lumina-text-muted)]">
              Aucune collection pour l&apos;instant.
            </p>
          ) : (
            collections.map((c) => (
              <button
                key={c.id}
                onClick={() => handleAdd(c.id)}
                disabled={isPending || c.hasBook || added[c.id]}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition hover:bg-white/5 disabled:opacity-60"
              >
                {c.name}
                {(c.hasBook || added[c.id]) && <span className="text-[#7ee0a8]">✓</span>}
              </button>
            ))
          )}
          <form onSubmit={handleCreateAndAdd} className="mt-2 flex gap-1.5 border-t border-white/10 pt-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nouvelle collection"
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white outline-none placeholder:text-[color:var(--color-lumina-text-muted)] focus:border-[#7c5cff]"
            />
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-2.5 py-1.5 text-xs font-bold text-white"
            >
              +
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
