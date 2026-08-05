import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminNav from "@/components/AdminNav";
import { getSiteSettings, updateSiteSettings } from "@/lib/siteSettings";

const DEFAULT_TITLE = "Remplace les écrans par des histoires qui te transforment";
const DEFAULT_SUBTITLE =
  "L'application qui t'aide à reprendre le contrôle de ton temps grâce à des eBooks immersifs, interactifs et motivants.";

export default async function AdminSettingsPage() {
  const [session, settings] = await Promise.all([
    getServerSession(authOptions),
    getSiteSettings(),
  ]);

  return (
    <div className="lumina-shell">
      <AdminNav email={session?.user?.email} />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-white">
          Réglages du site
        </h1>
        <p className="mb-6 text-sm text-[color:var(--color-lumina-text-muted)]">
          Modifie le texte affiché en haut de la page d&apos;accueil. Laisse un champ vide pour
          revenir au texte par défaut.
        </p>

        <form action={updateSiteSettings} className="lumina-card grid gap-5 rounded-2xl p-7">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-white">
              Titre d&apos;accueil
            </label>
            <textarea
              name="heroTitle"
              rows={2}
              placeholder={DEFAULT_TITLE}
              defaultValue={settings?.heroTitle ?? ""}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#a78bfa]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-white">
              Phrase d&apos;accroche
            </label>
            <textarea
              name="heroSubtitle"
              rows={3}
              placeholder={DEFAULT_SUBTITLE}
              defaultValue={settings?.heroSubtitle ?? ""}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#a78bfa]"
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full rounded-2xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(124,92,255,0.4)] transition hover:-translate-y-0.5"
          >
            Enregistrer
          </button>
        </form>
      </div>
    </div>
  );
}
