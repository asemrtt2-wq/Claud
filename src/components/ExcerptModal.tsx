"use client";

import { useEffect } from "react";

export default function ExcerptModal({
  title,
  chapterTitle,
  text,
  onClose,
}: {
  title: string;
  chapterTitle: string | null;
  text: string;
  onClose: () => void;
}) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const paragraphs = text.split(/\n\n+/).filter(Boolean);

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer"
        className="fixed right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/10 text-xl text-[#1d1d1f] backdrop-blur transition hover:bg-black/20 sm:right-6 sm:top-6"
      >
        ✕
      </button>

      <div className="mx-auto flex min-h-full max-w-2xl flex-col items-center justify-center py-14">
        <div className="w-full rounded-[26px] bg-white p-7 shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:p-10">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#a1a1a6]">
            Extrait · {title}
          </p>
          {chapterTitle && (
            <h3 className="mb-6 text-xl font-extrabold text-[#1d1d1f]">{chapterTitle}</h3>
          )}
          <div className="flex flex-col gap-4 font-serif text-[1.05rem] leading-relaxed text-[#1d1d1f]">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <p className="mt-8 text-center text-xs text-[#a1a1a6]">
            Fin de l&apos;extrait — poursuivez la lecture en accédant au livre complet.
          </p>
        </div>
      </div>
    </div>
  );
}
