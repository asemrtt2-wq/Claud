"use client";

import { useState, type ComponentProps } from "react";
import EbookForm from "@/components/EbookForm";

type Defaults = ComponentProps<typeof EbookForm>["defaults"];

export default function AdminEbookComposer({
  action,
  initialAudience,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  initialAudience: "adults" | "kids";
  submitLabel: string;
}) {
  const [audience, setAudience] = useState<"adults" | "kids">(initialAudience);
  const [topic, setTopic] = useState("");
  const [draft, setDraft] = useState<Defaults | undefined>(undefined);
  const [renderKey, setRenderKey] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  async function handleGenerate() {
    if (!topic.trim()) {
      setStatus("error");
      setError("Décris d'abord le sujet du livre à générer.");
      return;
    }
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/admin/generate-ebook", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ topic, audience }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Échec de la génération.");
      }
      setDraft({ ...data.draft, audience });
      setRenderKey((k) => k + 1);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Échec de la génération.");
    }
  }

  return (
    <div className="grid gap-5">
      <div className="lumina-card rounded-2xl p-6">
        <h2 className="mb-1 text-sm font-bold text-white">Générer avec l&apos;IA</h2>
        <p className="mb-4 text-xs text-[color:var(--color-lumina-text-muted)]">
          Décris un sujet, l&apos;IA propose un livre complet (titre, résumé, chapitres...) que tu
          peux relire et modifier avant de l&apos;enregistrer ci-dessous. Répète l&apos;opération
          autant de fois que tu veux pour peupler le catalogue.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ex : la méditation pour débutants"
            className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#a78bfa]"
          />
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value as "adults" | "kids")}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-[#a78bfa]"
          >
            <option value="adults" className="bg-navy-dark">Adultes</option>
            <option value="kids" className="bg-navy-dark">Enfants</option>
          </select>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={status === "loading"}
            className="rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-5 py-2.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(124,92,255,0.4)] transition hover:-translate-y-0.5 disabled:opacity-50"
          >
            {status === "loading" ? "Génération..." : "Générer"}
          </button>
        </div>
        {status === "error" && <p className="mt-3 text-xs text-red-400">{error}</p>}
        {draft && status !== "error" && (
          <p className="mt-3 text-xs text-emerald-400">
            Brouillon généré ci-dessous — relis-le puis enregistre.
          </p>
        )}
      </div>

      <EbookForm
        key={renderKey}
        action={action}
        defaults={draft ?? { audience: initialAudience }}
        submitLabel={submitLabel}
      />
    </div>
  );
}
