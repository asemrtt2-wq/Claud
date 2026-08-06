"use client";

const THEMES = ["royal", "navy", "deep", "dark", "steel"];

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#a78bfa]";
const labelClass = "mb-1.5 block text-sm font-semibold text-white";
const helpClass = "mb-2 text-xs text-[color:var(--color-lumina-text-muted)]";

type Defaults = {
  title?: string;
  subtitle?: string;
  description?: string;
  content?: string;
  pdfUrl?: string | null;
  author?: string;
  publishedYear?: number | null;
  audience?: string;
  category?: string;
  coverEmoji?: string;
  coverTheme?: string;
  coverImageUrl?: string | null;
  backCoverImageUrl?: string | null;
  price?: number;
  oldPrice?: number | null;
  featured?: boolean;
};

export default function EbookForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  defaults?: Defaults;
  submitLabel: string;
}) {
  return (
    <form action={action} className="lumina-card grid gap-5 rounded-2xl p-7">
      <div>
        <label className={labelClass}>Titre</label>
        <input name="title" required defaultValue={defaults?.title} className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Sous-titre</label>
        <input
          name="subtitle"
          required
          defaultValue={defaults?.subtitle}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea
          name="description"
          required
          rows={4}
          defaultValue={defaults?.description}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Catégorie</label>
          <input
            name="category"
            required
            defaultValue={defaults?.category}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Emoji de couverture</label>
          <input
            name="coverEmoji"
            required
            defaultValue={defaults?.coverEmoji ?? "📘"}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div>
          <label className={labelClass}>Auteur</label>
          <input name="author" defaultValue={defaults?.author} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Année de publication</label>
          <input
            type="number"
            name="publishedYear"
            defaultValue={defaults?.publishedYear ?? undefined}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Public</label>
          <select
            name="audience"
            defaultValue={defaults?.audience ?? "adults"}
            className={inputClass}
          >
            <option value="adults" className="bg-navy-dark">Adultes</option>
            <option value="kids" className="bg-navy-dark">Enfants</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div>
          <label className={labelClass}>Thème</label>
          <select
            name="coverTheme"
            defaultValue={defaults?.coverTheme ?? "royal"}
            className={inputClass}
          >
            {THEMES.map((theme) => (
              <option key={theme} value={theme} className="bg-navy-dark">
                {theme}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Prix (€)</label>
          <input
            type="number"
            step="0.01"
            name="price"
            required
            defaultValue={defaults?.price}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Ancien prix (€, optionnel)</label>
          <input
            type="number"
            step="0.01"
            name="oldPrice"
            defaultValue={defaults?.oldPrice ?? undefined}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Image de couverture (optionnel)</label>
          <p className={helpClass}>
            Chemin ou URL publique de l&apos;image de première de couverture (ex :{" "}
            <code>/covers/mon-livre-front.jpg</code> si le fichier est dans le dossier{" "}
            <code>public/</code> du site). Remplace l&apos;emoji + le dégradé par cette image
            partout où le livre apparaît, et s&apos;affiche comme première page dans le lecteur.
          </p>
          <input
            type="text"
            name="coverImageUrl"
            placeholder="/covers/mon-livre-front.jpg"
            defaultValue={defaults?.coverImageUrl ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Image de quatrième de couverture (optionnel)</label>
          <p className={helpClass}>
            Même principe, affichée comme toute dernière page dans le lecteur — une vraie
            couverture de fin, après la dernière page de texte.
          </p>
          <input
            type="text"
            name="backCoverImageUrl"
            placeholder="/covers/mon-livre-back.jpg"
            defaultValue={defaults?.backCoverImageUrl ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Lien PDF (optionnel)</label>
        <p className={helpClass}>
          Colle ici l&apos;URL publique d&apos;un PDF déjà hébergé quelque part (ex : un lien
          Google Drive/Dropbox partagé publiquement, ou un fichier hébergé sur ton propre
          serveur). <strong>Un chemin de fichier local sur ton ordinateur</strong> (du genre{" "}
          <code>/Users/toi/Desktop/livre.pdf</code>) ne fonctionnera pas — ce site n&apos;a
          aucun moyen d&apos;y accéder, il faut d&apos;abord héberger le fichier quelque part
          avec une vraie adresse web. Si ce champ est rempli, le lecteur affiche directement ce
          PDF (première page visible en l&apos;ouvrant) à la place du texte ci-dessous.
        </p>
        <input
          type="url"
          name="pdfUrl"
          placeholder="https://..."
          defaultValue={defaults?.pdfUrl ?? ""}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Contenu du livre</label>
        <p className={helpClass}>
          Texte intégral du livre (ignoré si un lien PDF est renseigné ci-dessus). Pour que les
          chapitres soient détectés dans la fiche et le lecteur, séparez-les avec une ligne du
          type « Chapitre 1 — Titre du chapitre ».
        </p>
        <textarea
          name="content"
          rows={16}
          defaultValue={defaults?.content}
          className={`${inputClass} font-mono`}
        />
      </div>

      <label className="flex items-center gap-2 text-sm font-semibold text-white">
        <input type="checkbox" name="featured" defaultChecked={defaults?.featured} />
        Mettre en vedette (affiché dans le hero)
      </label>

      <button
        type="submit"
        className="mt-2 w-full rounded-2xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(124,92,255,0.4)] transition hover:-translate-y-0.5"
      >
        {submitLabel}
      </button>
    </form>
  );
}
