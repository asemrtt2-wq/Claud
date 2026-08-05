import Link from "next/link";
import { LaptopFrame, PhoneFrame, TabletFrame } from "@/components/DeviceFrame";
import { MiniLibraryScreen, MiniReaderScreen } from "@/components/MiniAppScreens";
import { PROFILE_AVATARS } from "@/lib/profileColors";

const FEATURES = [
  {
    emoji: "📖",
    color: "#4d7dff",
    title: "Lis autrement",
    text: "Des eBooks immersifs qui captivent ton esprit et nourrissent ton âme.",
  },
  {
    emoji: "🧠",
    color: "#a78bfa",
    title: "Déconnecte-toi",
    text: "Remplace le scroll infini par des histoires qui comptent vraiment.",
  },
  {
    emoji: "🎯",
    color: "#34d399",
    title: "Progresse chaque jour",
    text: "Développement personnel, connaissances, imagination : deviens la meilleure version de toi-même.",
  },
  {
    emoji: "🌐",
    color: "#4d7dff",
    title: "Partout avec toi",
    text: "Retrouve ta lecture sur tous tes écrans, directement depuis ton navigateur.",
  },
];

export function FeatureHighlights() {
  return (
    <section className="bg-[#0d0b22] px-6 py-20 text-white">
      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <div key={f.title}>
            <div
              className="mb-4 flex h-11 w-11 items-center justify-center rounded-full text-lg"
              style={{ backgroundColor: `${f.color}26`, color: f.color }}
            >
              {f.emoji}
            </div>
            <h3 className="mb-1.5 font-extrabold tracking-tight text-white">{f.title}</h3>
            <p className="text-sm text-[color:var(--color-lumina-text-muted)]">{f.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const KIDS_AVATARS = PROFILE_AVATARS.filter((e) =>
  ["🦊", "🐻", "🐱", "🐼", "🐰", "🧒"].includes(e)
);

export function KidsModeSection() {
  return (
    <section className="bg-[#0a0918] px-6 py-20 text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div className="lumina-card rounded-[22px] p-8">
          <span className="mb-3 inline-flex items-center gap-2 text-lg font-extrabold tracking-tight">
            Compte enfant <span title="Verrouillable par PIN">🔒</span>
          </span>
          <p className="mb-6 text-[color:var(--color-lumina-text-muted)]">
            Un espace pensé pour chaque âge, avec des eBooks adaptés pour éveiller leur curiosité
            et leur imagination.
          </p>
          <div className="mb-6 flex flex-wrap gap-3">
            {KIDS_AVATARS.map((emoji) => (
              <div
                key={emoji}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7c5cff]/30 to-[#5b3df0]/30 text-2xl"
              >
                {emoji}
              </div>
            ))}
          </div>
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {[
              "Contenu adapté à chaque âge",
              "Sans publicité",
              "Suivi du temps de lecture",
              "Mode enfant simple",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm font-semibold">
                <span className="text-[#34d399]">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-4 text-[1.8rem] font-extrabold leading-tight tracking-tight md:text-[2.2rem]">
            Une lecture sur mesure, pour toute la famille.
          </h2>
          <p className="mb-6 text-[color:var(--color-lumina-text-muted)]">
            Chaque profil garde ses propres favoris, son propre historique et sa propre limite de
            temps de lecture — sans jamais se mélanger avec les autres profils du compte.
          </p>
          <Link
            href="/signup"
            className="inline-block rounded-2xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(124,92,255,0.4)] transition hover:-translate-y-0.5"
          >
            Créer un profil enfant
          </Link>
        </div>
      </div>
    </section>
  );
}

export function ReadingExperienceSection({
  books,
}: {
  books: { title: string; coverEmoji: string; coverTheme: string; content: string }[];
}) {
  const readerBook = books[0];
  const excerpt =
    readerBook?.content
      .replace(/^Chapitre\s+\d+\s*[—-].*$/im, "")
      .trim()
      .slice(0, 260) ?? "";

  return (
    <section className="overflow-hidden bg-[#0d0b22] px-6 py-24 text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <span className="mb-3.5 inline-block text-[0.82rem] font-extrabold uppercase tracking-wider text-[#a78bfa]">
            Le lecteur
          </span>
          <h2 className="mb-6 text-[1.8rem] font-extrabold leading-tight tracking-tight md:text-[2.2rem]">
            Une expérience de lecture unique.
          </h2>
          <ul className="grid gap-5">
            {[
              { icon: "🌌", title: "Ambiance immersive", text: "Fonds animés inspirés de chaque couverture." },
              { icon: "🎨", title: "Lecture personnalisée", text: "Taille de police, thèmes, disposition en pages ou en défilement." },
              { icon: "🌓", title: "Mode jour / nuit", text: "Bascule entre lecture immersive et lecture claire à tout moment." },
              { icon: "📌", title: "Reprise automatique", text: "Ta position est sauvegardée, tu reprends toujours exactement où tu t'es arrêté." },
            ].map((f) => (
              <li key={f.title} className="flex items-start gap-3.5">
                <span className="text-xl">{f.icon}</span>
                <div>
                  <p className="font-extrabold tracking-tight">{f.title}</p>
                  <p className="text-sm text-[color:var(--color-lumina-text-muted)]">{f.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="order-1 flex items-center justify-center lg:order-2">
          <div className="relative flex items-center">
            <LaptopFrame className="hidden md:block">
              <MiniLibraryScreen books={books} />
            </LaptopFrame>
            {readerBook && (
              <PhoneFrame className="relative z-10 -ml-16 hidden rotate-3 shadow-[0_30px_70px_rgba(0,0,0,0.6)] sm:block">
                <MiniReaderScreen
                  title={readerBook.title}
                  chapterLabel="Chapitre 12"
                  excerpt={excerpt}
                  page={178}
                  totalPages={320}
                />
              </PhoneFrame>
            )}
            <TabletFrame className="md:hidden">
              <MiniLibraryScreen books={books} />
            </TabletFrame>
          </div>
        </div>
      </div>
    </section>
  );
}

const COMPATIBILITY = [
  { emoji: "📱", label: "Smartphone" },
  { emoji: "📱", label: "Tablette" },
  { emoji: "💻", label: "Ordinateur" },
  { emoji: "🌐", label: "Web" },
];

export function CompatibilitySection() {
  return (
    <section className="bg-[#0a0918] px-6 py-20 text-white">
      <div className="mx-auto grid max-w-4xl gap-10 sm:grid-cols-2">
        <div>
          <h3 className="mb-2 text-xl font-extrabold tracking-tight">Compatible partout</h3>
          <p className="mb-6 text-sm text-[color:var(--color-lumina-text-muted)]">
            Lumina fonctionne directement dans ton navigateur — aucune app à installer, aucun
            fichier à télécharger.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {COMPATIBILITY.map((c) => (
              <span key={c.label} className="flex items-center gap-2 text-sm font-semibold">
                <span className="text-lg">{c.emoji}</span>
                {c.label}
              </span>
            ))}
          </div>
        </div>
        <div className="lumina-card flex flex-col justify-center gap-3 rounded-[22px] p-7">
          <p className="text-sm font-semibold text-[color:var(--color-lumina-text-muted)]">
            Fonctionne dans tous les navigateurs modernes
          </p>
          <div className="flex flex-wrap gap-3 text-sm font-bold">
            <span className="rounded-full bg-white/5 px-3.5 py-1.5">Chrome</span>
            <span className="rounded-full bg-white/5 px-3.5 py-1.5">Safari</span>
            <span className="rounded-full bg-white/5 px-3.5 py-1.5">Firefox</span>
            <span className="rounded-full bg-white/5 px-3.5 py-1.5">Edge</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FinalCtaBand() {
  return (
    <section className="bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-6 py-14 text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✦</span>
          <div>
            <p className="text-lg font-extrabold tracking-tight">
              Reprends le contrôle de ton temps.
            </p>
            <p className="text-sm text-[#e4defc]">
              Moins de distractions, plus d&apos;histoires qui te construisent.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href="/signup"
            className="rounded-2xl bg-white px-6 py-3 text-sm font-bold text-navy shadow-[0_12px_28px_rgba(0,0,0,0.2)] transition hover:bg-[#f0f4ff]"
          >
            Essayer gratuitement
          </Link>
          <Link
            href="/login"
            className="rounded-2xl border border-white/40 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </section>
  );
}
