"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { importRealBooksChunk } from "@/lib/actions";

/**
 * Drives the catalog import a few books at a time.
 *
 * The whole import used to be one server action firing 100+ concurrent upserts, which
 * timed out in production and — being a plain form submit — gave no sign that anything
 * had gone wrong. Looping small slices from the client keeps every request short and
 * puts both the progress and any error on screen.
 */
export default function ImportBooksButton() {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(0);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  async function run() {
    setRunning(true);
    setError(null);
    setFinished(false);
    setDone(0);
    setCurrent(null);

    let offset = 0;
    try {
      for (;;) {
        const result = await importRealBooksChunk(offset);
        setTotal(result.total);
        setDone(result.imported);
        setCurrent(result.titles[result.titles.length - 1] ?? null);
        if (result.done) break;
        if (result.nextOffset <= offset) {
          throw new Error("L'import n'a pas avancé — arrêt pour éviter une boucle infinie.");
        }
        offset = result.nextOffset;
      }
      setFinished(true);
      setCurrent(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue pendant l'import.");
    } finally {
      setRunning(false);
    }
  }

  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="lumina-card mb-8 rounded-2xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-extrabold text-white">📚 Importer mes livres</p>
          <p className="text-sm text-[color:var(--color-lumina-text-muted)]">
            Ajoute ou met à jour d&apos;un coup tous les livres réels préparés dans le code
            (couvertures + contenu déjà extraits). Sans risque à relancer plusieurs fois.
          </p>
        </div>
        <button
          type="button"
          onClick={run}
          disabled={running}
          className="shrink-0 rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-5 py-2.5 text-sm font-bold text-white shadow-[0_12px_24px_rgba(124,92,255,0.35)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {running ? "Import en cours…" : "Importer maintenant"}
        </button>
      </div>

      {(running || finished || error) && total > 0 && (
        <div className="mt-4">
          <div className="lumina-progress-track h-2 w-full overflow-hidden rounded-full">
            <div
              className="lumina-progress-fill h-full rounded-full transition-[width] duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-[color:var(--color-lumina-text-muted)]">
            {done} / {total} livres
            {current ? ` · ${current}` : ""}
          </p>
        </div>
      )}

      {finished && !error && (
        <p className="mt-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-200">
          ✅ Import terminé — {done} livres à jour.
        </p>
      )}

      {error && (
        <p className="mt-3 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-200">
          ❌ {error}
          {done > 0 ? ` (${done} livres déjà importés — relancez pour continuer.)` : ""}
        </p>
      )}
    </div>
  );
}
