"use client";

import { useTransition } from "react";
import { deleteCatalog } from "@/lib/actions";

export default function DeleteCatalogButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Supprimer le catalogue "${name}" ? Les livres n'y seront plus rattachés.`)) return;
    startTransition(() => {
      deleteCatalog(id);
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="font-semibold text-[#ff8a8a] hover:underline disabled:opacity-50"
    >
      {isPending ? "..." : "Supprimer"}
    </button>
  );
}
