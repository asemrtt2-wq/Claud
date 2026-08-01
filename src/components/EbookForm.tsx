"use client";

const THEMES = ["royal", "navy", "deep", "dark", "steel"];

type Defaults = {
  title?: string;
  subtitle?: string;
  description?: string;
  category?: string;
  coverEmoji?: string;
  coverTheme?: string;
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
    <form action={action} className="grid gap-5 rounded-2xl border border-gray-mid bg-white p-7 shadow-soft">
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-navy">Titre</label>
        <input
          name="title"
          required
          defaultValue={defaults?.title}
          className="w-full rounded-xl border border-gray-mid px-4 py-2.5 text-sm outline-none focus:border-royal"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-navy">Sous-titre</label>
        <input
          name="subtitle"
          required
          defaultValue={defaults?.subtitle}
          className="w-full rounded-xl border border-gray-mid px-4 py-2.5 text-sm outline-none focus:border-royal"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-navy">Description</label>
        <textarea
          name="description"
          required
          rows={4}
          defaultValue={defaults?.description}
          className="w-full rounded-xl border border-gray-mid px-4 py-2.5 text-sm outline-none focus:border-royal"
        />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-navy">Catégorie</label>
          <input
            name="category"
            required
            defaultValue={defaults?.category}
            className="w-full rounded-xl border border-gray-mid px-4 py-2.5 text-sm outline-none focus:border-royal"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-navy">Emoji de couverture</label>
          <input
            name="coverEmoji"
            required
            defaultValue={defaults?.coverEmoji ?? "📘"}
            className="w-full rounded-xl border border-gray-mid px-4 py-2.5 text-sm outline-none focus:border-royal"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-navy">Thème</label>
          <select
            name="coverTheme"
            defaultValue={defaults?.coverTheme ?? "royal"}
            className="w-full rounded-xl border border-gray-mid px-4 py-2.5 text-sm outline-none focus:border-royal"
          >
            {THEMES.map((theme) => (
              <option key={theme} value={theme}>
                {theme}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-navy">Prix (€)</label>
          <input
            type="number"
            step="0.01"
            name="price"
            required
            defaultValue={defaults?.price}
            className="w-full rounded-xl border border-gray-mid px-4 py-2.5 text-sm outline-none focus:border-royal"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-navy">
            Ancien prix (€, optionnel)
          </label>
          <input
            type="number"
            step="0.01"
            name="oldPrice"
            defaultValue={defaults?.oldPrice ?? undefined}
            className="w-full rounded-xl border border-gray-mid px-4 py-2.5 text-sm outline-none focus:border-royal"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm font-semibold text-navy">
        <input type="checkbox" name="featured" defaultChecked={defaults?.featured} />
        Mettre en vedette (affiché dans le hero)
      </label>

      <button
        type="submit"
        className="mt-2 w-full rounded-2xl bg-gradient-to-br from-royal to-[#3a6bff] px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(30,91,255,0.4)] transition hover:-translate-y-0.5"
      >
        {submitLabel}
      </button>
    </form>
  );
}
