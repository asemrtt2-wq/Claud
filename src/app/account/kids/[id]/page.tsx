import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customerSession";
import { paginateContent } from "@/lib/paginate";
import ChildSettingsForm from "@/components/ChildSettingsForm";
import AppBottomNav from "@/components/AppBottomNav";

function paceLabel(avgSecondsPerPage: number | null) {
  if (avgSecondsPerPage === null) return null;
  if (avgSecondsPerPage < 8) return { label: "⚡ Lecture très rapide", color: "#ffb020" };
  if (avgSecondsPerPage > 25) return { label: "🐢 Lecture posée", color: "#a78bfa" };
  return { label: "🙂 Rythme normal", color: "#7ee0a8" };
}

function relativeDate(date: Date) {
  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "aujourd'hui";
  if (days === 1) return "hier";
  return `il y a ${days} jours`;
}

export default async function ChildDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/login");

  const profile = await prisma.childProfile.findUnique({ where: { id } });
  if (!profile || profile.parentId !== customer.id) redirect("/account");

  const progress = await prisma.childReadingProgress.findMany({
    where: { childProfileId: id },
    include: { ebook: true },
    orderBy: { updatedAt: "desc" },
  });

  const booksCompleted = progress.filter((p) => p.completed).length;
  const totalPagesRead = progress.reduce((sum, p) => sum + p.page + 1, 0);
  const lastActive = progress[0]?.updatedAt ?? null;
  const today = new Date().toISOString().slice(0, 10);
  const minutesReadToday = profile.limitResetDate === today ? profile.minutesReadToday : 0;

  return (
    <div className="lumina-shell pb-24">
      <header className="flex items-center justify-between px-6 py-6 sm:px-10">
        <Link href="/account" className="text-sm font-semibold text-[#a78bfa] hover:underline">
          ← Mon compte
        </Link>
        <Link
          href={`/kids/${id}`}
          className="rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-4 py-2 text-xs font-bold text-white"
        >
          🧸 Ouvrir en mode enfant
        </Link>
      </header>

      <main className="mx-auto max-w-4xl px-6 sm:px-10">
        <div className="mb-8 flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] text-3xl">
            {profile.avatarEmoji}
          </span>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">{profile.name}</h1>
            <p className="text-sm text-[color:var(--color-lumina-text-muted)]">
              Tableau de bord parent
            </p>
          </div>
        </div>

        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="lumina-card rounded-2xl p-4 text-center">
            <p className="text-2xl font-extrabold">{progress.length}</p>
            <p className="text-xs text-[color:var(--color-lumina-text-muted)]">Livres commencés</p>
          </div>
          <div className="lumina-card rounded-2xl p-4 text-center">
            <p className="text-2xl font-extrabold">{booksCompleted}</p>
            <p className="text-xs text-[color:var(--color-lumina-text-muted)]">Livres terminés</p>
          </div>
          <div className="lumina-card rounded-2xl p-4 text-center">
            <p className="text-2xl font-extrabold">{totalPagesRead}</p>
            <p className="text-xs text-[color:var(--color-lumina-text-muted)]">Pages lues</p>
          </div>
          <div className="lumina-card rounded-2xl p-4 text-center">
            <p className="text-2xl font-extrabold">
              {minutesReadToday}
              {profile.dailyLimitMinutes ? `/${profile.dailyLimitMinutes}` : ""}
            </p>
            <p className="text-xs text-[color:var(--color-lumina-text-muted)]">Min. aujourd&apos;hui</p>
          </div>
        </div>

        <section className="mb-10">
          <h2 className="mb-4 text-lg font-extrabold">Activité de lecture</h2>
          {progress.length === 0 ? (
            <p className="text-sm text-[color:var(--color-lumina-text-muted)]">
              {`${profile.name} n'a pas encore commencé de livre.`}
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {progress.map((p) => {
                const totalPages = paginateContent(p.ebook.content).length;
                const percent = Math.round(((p.page + 1) / totalPages) * 100);
                const pace = paceLabel(p.avgSecondsPerPage);
                return (
                  <div key={p.id} className="lumina-card flex items-center gap-4 rounded-2xl p-4">
                    <span
                      className={`cover-theme-${p.ebook.coverTheme} flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-2xl`}
                    >
                      {p.ebook.coverEmoji}
                    </span>
                    <div className="flex-1">
                      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-bold">{p.ebook.title}</p>
                        {p.completed && (
                          <span className="rounded-full bg-[#7ee0a8]/15 px-2 py-0.5 text-xs font-bold text-[#7ee0a8]">
                            ✓ Terminé
                          </span>
                        )}
                      </div>
                      <div className="mb-1.5 h-1.5 w-full overflow-hidden rounded-full lumina-progress-track">
                        <div
                          className="h-full lumina-progress-fill"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-[color:var(--color-lumina-text-muted)]">
                        <span>
                          Page {p.page + 1}/{totalPages}
                        </span>
                        <span>Dernière lecture {relativeDate(p.updatedAt)}</span>
                        {pace && <span style={{ color: pace.color }}>{pace.label}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {lastActive && (
            <p className="mt-4 text-xs text-[color:var(--color-lumina-text-muted)]">
              Dernière connexion : {relativeDate(lastActive)}
            </p>
          )}
        </section>

        <ChildSettingsForm
          childId={id}
          initialDailyLimitMinutes={profile.dailyLimitMinutes}
          initialReminderTime={profile.reminderTime}
        />
      </main>

      <AppBottomNav />
    </div>
  );
}
