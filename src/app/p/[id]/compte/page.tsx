import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customerSession";
import { isProfileUnlocked } from "@/lib/profileUnlock";
import ProfileSwitcher from "@/components/ProfileSwitcher";
import ReadingReminderSetting from "@/components/ReadingReminderSetting";
import ReadingGoalSetting from "@/components/ReadingGoalSetting";
import SignOutButton from "@/components/SignOutButton";
import LogoMark from "@/components/Logo";

function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

function xpForLevel(level: number) {
  return (level - 1) ** 2 * 100;
}

/**
 * A level/XP framing over stats we already track for real (minutes read,
 * completed books, streak) — not a persisted points system, just a more
 * game-like presentation of the same numbers shown above.
 */
function computeLevel(totalMinutesRead: number, completedBooks: number, streak: number) {
  const xp = totalMinutesRead * 2 + completedBooks * 50 + streak * 5;
  let level = 1;
  while (xp >= xpForLevel(level + 1)) level += 1;
  const xpIntoLevel = xp - xpForLevel(level);
  const xpForNext = xpForLevel(level + 1) - xpForLevel(level);
  return { xp, level, xpIntoLevel, xpForNext, percent: Math.round((xpIntoLevel / xpForNext) * 100) };
}

export default async function CompteObjectifsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/login");

  const profile = await prisma.profile.findUnique({ where: { id } });
  if (!profile || profile.customerId !== customer.id) redirect("/profiles");
  if (profile.type === "kids") redirect(`/p/${id}`);

  if (profile.pinHash) {
    const unlocked = await isProfileUnlocked(id);
    if (!unlocked) redirect("/profiles");
  }

  const [allProfiles, subscription, progressEntries] = await Promise.all([
    prisma.profile.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: "asc" },
    }),
    prisma.subscription.findUnique({ where: { customerId: customer.id } }),
    prisma.readingProgress.findMany({ where: { profileId: id } }),
  ]);

  const switcherProfiles = allProfiles.map((p) => ({
    id: p.id,
    name: p.name,
    avatarEmoji: p.avatarEmoji,
    color: p.color,
    hasPin: Boolean(p.pinHash),
  }));

  const todayStr = new Date().toISOString().slice(0, 10);
  const booksCompletedThisMonth = progressEntries.filter((p) => {
    const now = new Date();
    return (
      p.completed &&
      p.updatedAt.getMonth() === now.getMonth() &&
      p.updatedAt.getFullYear() === now.getFullYear()
    );
  }).length;
  const completedBooksTotal = progressEntries.filter((p) => p.completed).length;
  const pagesReadTotal = progressEntries.reduce((sum, p) => sum + p.page + 1, 0);
  const currentStreak =
    profile.lastReadDate === todayStr ||
    profile.lastReadDate === new Date(Date.now() - 86400000).toISOString().slice(0, 10)
      ? profile.readingStreak
      : 0;
  const { level, xpIntoLevel, xpForNext, percent: levelPercent } = computeLevel(
    profile.totalMinutesRead,
    completedBooksTotal,
    currentStreak
  );
  const milestones = [
    { emoji: "📖", label: "Premier livre terminé", achieved: completedBooksTotal >= 1 },
    { emoji: "📚", label: "10 livres terminés", achieved: completedBooksTotal >= 10 },
    { emoji: "🔥", label: "7 jours de suite", achieved: currentStreak >= 7 },
    { emoji: "⏱️", label: "10 h de lecture", achieved: profile.totalMinutesRead >= 600 },
    { emoji: "🌙", label: "50 h de lecture", achieved: profile.totalMinutesRead >= 3000 },
    {
      emoji: "🎯",
      label: "Objectif du mois atteint",
      achieved: profile.monthlyBookGoal ? booksCompletedThisMonth >= profile.monthlyBookGoal : false,
    },
  ];

  return (
    <div className="lumina-shell pb-24">
      <header className="flex items-center justify-between px-6 py-6 sm:px-10">
        <Link href={`/p/${id}`} className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight">
          <LogoMark className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] text-white" />
          LUMINA
        </Link>
        <div className="flex items-center gap-4">
          <ProfileSwitcher profiles={switcherProfiles} activeProfileId={id} />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 sm:px-10">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href={`/p/${id}`}
            className="text-sm font-semibold text-[color:var(--color-lumina-text-muted)] transition hover:text-white"
          >
            ← Retour
          </Link>
        </div>

        <h1 className="mb-6 text-2xl font-extrabold tracking-tight">
          Objectifs & temps de lecture
        </h1>

        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          <div className="lumina-card rounded-2xl p-5">
            <ReadingGoalSetting
              profileId={id}
              initialGoal={profile.monthlyBookGoal}
              booksCompletedThisMonth={booksCompletedThisMonth}
            />
          </div>
          <div className="lumina-card rounded-2xl p-5">
            <p className="mb-1 text-xs font-semibold text-[color:var(--color-lumina-text-muted)]">
              ⏱️ Temps de lecture
            </p>
            <p className="mb-1 text-2xl font-extrabold">{formatMinutes(profile.totalMinutesRead)}</p>
            <p className="text-xs text-[color:var(--color-lumina-text-muted)]">
              {`au total, dont ${formatMinutes(
                profile.limitResetDate === todayStr ? profile.minutesReadToday : 0
              )} aujourd'hui`}
            </p>
          </div>
          <div className="lumina-card rounded-2xl p-5">
            <p className="mb-1 text-xs font-semibold text-[color:var(--color-lumina-text-muted)]">
              🔥 Jours consécutifs
            </p>
            <p className="text-2xl font-extrabold">{currentStreak}</p>
          </div>
        </div>

        <section className="mb-10">
          <h2 className="lumina-gold-text mb-4 text-sm font-extrabold uppercase tracking-wider">
            Ton parcours
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Livres lus", value: completedBooksTotal },
              { label: "Pages lues", value: pagesReadTotal },
              { label: "Temps de lecture", value: formatMinutes(profile.totalMinutesRead) },
              { label: "Série actuelle", value: `${currentStreak} j` },
            ].map((stat) => (
              <div key={stat.label} className="lumina-card-premium rounded-2xl p-5 text-center">
                <p className="text-2xl font-extrabold">{stat.value}</p>
                <p className="mt-1 text-xs font-semibold text-[color:var(--color-lumina-text-muted)]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="lumina-card mb-10 rounded-[22px] p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold">{`Niveau ${level}`}</h2>
              <p className="text-sm text-[color:var(--color-lumina-text-muted)]">
                {`${xpIntoLevel} / ${xpForNext} XP vers le niveau ${level + 1}`}
              </p>
            </div>
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] text-xl font-extrabold shadow-[0_10px_28px_rgba(124,92,255,0.4)]">
              {level}
            </span>
          </div>
          <div className="mb-6 h-2.5 w-full overflow-hidden rounded-full lumina-progress-track">
            <div
              className="h-full lumina-progress-fill transition-all duration-700"
              style={{ width: `${levelPercent}%` }}
            />
          </div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[color:var(--color-lumina-text-muted)]">
            Badges
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {milestones.map((m) => (
              <div
                key={m.label}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border p-4 text-center transition ${
                  m.achieved
                    ? "border-[#7c5cff]/40 bg-[#7c5cff]/10"
                    : "border-white/10 bg-white/[0.02] opacity-40"
                }`}
              >
                <span className="text-2xl">{m.achieved ? m.emoji : "🔒"}</span>
                <span className="text-xs font-bold leading-tight">{m.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="lumina-card rounded-[22px] p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold">{customer.name}</h2>
              <p className="text-sm text-[color:var(--color-lumina-text-muted)]">{customer.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/profiles"
                className="rounded-xl border border-white/15 px-4 py-2 text-sm font-bold transition hover:border-[#a78bfa]"
              >
                ⚙️ Gérer les profils
              </Link>
              <SignOutButton />
            </div>
          </div>
          {subscription?.status === "active" ? (
            <p className="text-sm text-[#c9bdff]">
              ✅ Premium actif ({subscription.plan === "yearly" ? "annuel" : "mensuel"}) — accès
              illimité à toute la bibliothèque, sur tous les profils.
            </p>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-[color:var(--color-lumina-text-muted)]">
                Tu n&apos;as pas encore d&apos;abonnement Premium.
              </p>
              <Link
                href="/premium"
                className="rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-5 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5"
              >
                Découvrir Premium
              </Link>
            </div>
          )}
          <div className="mt-5 border-t border-white/10 pt-5">
            <ReadingReminderSetting profileId={id} initialReminderTime={profile.reminderTime} />
          </div>
        </section>
      </main>
    </div>
  );
}
