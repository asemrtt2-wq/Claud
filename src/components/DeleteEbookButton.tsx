"use client";

import { useTransition } from "react";
import { deleteEbook } from "@/lib/actions";

export default function DeleteEbookButton({ id, title }: { id: string; title: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Supprimer "${title}" ? Cette action est irréversible.`)) return;
    startTransition(() => {
      deleteEbook(id);
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
