import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customerSession";
import { isProfileUnlocked } from "@/lib/profileUnlock";
import ProfileSwitcher from "@/components/ProfileSwitcher";
import ReadingReminderSetting from "@/components/ReadingReminderSetting";
import ReadingGoalSetting from "@/components/ReadingGoalSetting";
import SignOutButton from "@/components/SignOutButton";

function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
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

  return (
    <div className="lumina-shell pb-24">
      <header className="flex items-center justify-between px-6 py-6 sm:px-10">
        <Link href={`/p/${id}`} className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] text-white">
            ✦
          </span>
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
            <p className="text-2xl font-extrabold">
              {profile.lastReadDate === todayStr ||
              profile.lastReadDate === new Date(Date.now() - 86400000).toISOString().slice(0, 10)
                ? profile.readingStreak
                : 0}
            </p>
          </div>
        </div>

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
