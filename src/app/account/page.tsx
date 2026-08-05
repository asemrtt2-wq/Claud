import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customerSession";
import { paginateContent } from "@/lib/paginate";
import AppBottomNav from "@/components/AppBottomNav";
import SignOutButton from "@/components/SignOutButton";
import ChildProfileManager from "@/components/ChildProfileManager";
import ReadingReminderSetting from "@/components/ReadingReminderSetting";
import ReadingGoalSetting from "@/components/ReadingGoalSetting";
import BedtimeReminder from "@/components/BedtimeReminder";
import ProfileSwitcher from "@/components/ProfileSwitcher";
import CollectionsManager from "@/components/CollectionsManager";
import { getRecommendations } from "@/lib/recommendations";

function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

function relativeDate(date: Date) {
  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "aujourd'hui";
  if (days === 1) return "hier";
  return `il y a ${days} jours`;
}

export default async function AccountPage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/login");

  const [subscription, orders, favorites, progressEntries, childProfiles, collections] =
    await Promise.all([
      prisma.subscription.findUnique({ where: { customerId: customer.id } }),
      prisma.order.findMany({
        where: { customerId: customer.id, status: "paid" },
        include: { ebook: true },
      }),
      prisma.favorite.findMany({
        where: { customerId: customer.id },
        include: { ebook: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.readingProgress.findMany({
        where: { customerId: customer.id },
        include: { ebook: true },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.childProfile.findMany({
        where: { parentId: customer.id },
        orderBy: { createdAt: "asc" },
      }),
      prisma.collection.findMany({
        where: { customerId: customer.id },
        include: { items: { include: { ebook: true } } },
        orderBy: { createdAt: "desc" },
      }),
    ]);

  const progressByEbookId = new Map(progressEntries.map((p) => [p.ebookId, p]));

  const libraryMap = new Map<
    string,
    { ebook: (typeof orders)[number]["ebook"]; page: number; totalPages: number }
  >();

  for (const entry of [...orders, ...favorites, ...progressEntries]) {
    const ebook = entry.ebook;
    if (!libraryMap.has(ebook.id)) {
      const progress = progressByEbookId.get(ebook.id);
      libraryMap.set(ebook.id, {
        ebook,
        page: progress?.page ?? 0,
        totalPages: paginateContent(ebook.content).length,
      });
    }
  }

  const library = Array.from(libraryMap.values());
  const continueReading = progressEntries[0]
    ? libraryMap.get(progressEntries[0].ebookId)
    : null;

  const recommendations = await getRecommendations(customer.id, Array.from(libraryMap.keys()));

  const booksCompletedThisMonth = progressEntries.filter((p) => {
    const now = new Date();
    return (
      p.completed &&
      p.updatedAt.getMonth() === now.getMonth() &&
      p.updatedAt.getFullYear() === now.getFullYear()
    );
  }).length;

  const todayStr = new Date().toISOString().slice(0, 10);
  const hasReadToday = progressEntries.some(
    (p) => p.updatedAt.toISOString().slice(0, 10) === todayStr
  );

  return (
    <div className="lumina-shell pb-24">
      <header id="accueil" className="flex items-center justify-between px-6 py-6 sm:px-10">
        <Link href="/" className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] text-white">
            ✦
          </span>
          LUMINA
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-lg opacity-70">🔍</span>
          <ProfileSwitcher
            customerName={customer.name}
            childProfiles={childProfiles}
            activeLabel={customer.name}
          />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 sm:px-10">
        <h1 className="mb-1 text-2xl font-extrabold tracking-tight">
          {`Bonsoir, ${customer.name.split(" ")[0]} 👋`}
        </h1>
        <p className="mb-8 text-sm text-[color:var(--color-lumina-text-muted)]">
          Prêt pour une nouvelle aventure ?
        </p>

        <BedtimeReminder
          reminderTime={customer.readingReminderTime}
          hasReadToday={hasReadToday}
          name={customer.name.split(" ")[0]}
        />

        {continueReading && (
          <Link
            href={`/read/${continueReading.ebook.slug}`}
            className={`lumina-card cover-theme-${continueReading.ebook.coverTheme} relative mb-10 flex h-48 flex-col justify-end overflow-hidden rounded-[22px] p-6 transition hover:-translate-y-1`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />
            <div className="relative z-10">
              <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                Continuer la lecture
              </span>
              <h2 className="mb-2 text-xl font-extrabold">{continueReading.ebook.title}</h2>
              <div className="mb-2 h-1.5 w-48 overflow-hidden rounded-full lumina-progress-track">
                <div
                  className="h-full lumina-progress-fill"
                  style={{
                    width: `${Math.round(((continueReading.page + 1) / continueReading.totalPages) * 100)}%`,
                  }}
                />
              </div>
              <span className="inline-block rounded-xl bg-white px-4 py-2 text-xs font-bold text-navy">
                Reprendre ▶
              </span>
            </div>
          </Link>
        )}

        {(recommendations.byCategory.length > 0 ||
          recommendations.newest.length > 0 ||
          recommendations.popular.length > 0) && (
          <section id="recommandations" className="mb-12 scroll-mt-24">
            <h2 className="mb-5 text-lg font-extrabold">Recommandé pour toi</h2>
            <div className="flex flex-col gap-8">
              {recommendations.byCategory.length > 0 && (
                <div>
                  <p className="mb-3 text-sm font-semibold text-[color:var(--color-lumina-text-muted)]">
                    Parce que tu aimes {recommendations.topCategory}
                  </p>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {recommendations.byCategory.map((book) => (
                      <Link key={book.id} href={`/ebooks/${book.slug}`} className="group">
                        <div
                          className={`cover-theme-${book.coverTheme} mb-2 flex h-32 items-center justify-center rounded-2xl text-3xl shadow-lg transition group-hover:-translate-y-1`}
                        >
                          {book.coverEmoji}
                        </div>
                        <p className="truncate text-xs font-bold">{book.title}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {recommendations.newest.length > 0 && (
                <div>
                  <p className="mb-3 text-sm font-semibold text-[color:var(--color-lumina-text-muted)]">
                    Nouveautés
                  </p>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {recommendations.newest.map((book) => (
                      <Link key={book.id} href={`/ebooks/${book.slug}`} className="group">
                        <div
                          className={`cover-theme-${book.coverTheme} mb-2 flex h-32 items-center justify-center rounded-2xl text-3xl shadow-lg transition group-hover:-translate-y-1`}
                        >
                          {book.coverEmoji}
                        </div>
                        <p className="truncate text-xs font-bold">{book.title}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {recommendations.popular.length > 0 && (
                <div>
                  <p className="mb-3 text-sm font-semibold text-[color:var(--color-lumina-text-muted)]">
                    Les plus populaires
                  </p>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {recommendations.popular.map((book) => (
                      <Link key={book.id} href={`/ebooks/${book.slug}`} className="group">
                        <div
                          className={`cover-theme-${book.coverTheme} mb-2 flex h-32 items-center justify-center rounded-2xl text-3xl shadow-lg transition group-hover:-translate-y-1`}
                        >
                          {book.coverEmoji}
                        </div>
                        <p className="truncate text-xs font-bold">{book.title}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        <section id="bibliotheque" className="mb-12 scroll-mt-24">
          <h2 className="mb-5 text-lg font-extrabold">Ma bibliothèque</h2>
          {library.length === 0 ? (
            <p className="text-sm text-[color:var(--color-lumina-text-muted)]">
              Ta bibliothèque est vide.{" "}
              <Link href="/#catalogue" className="font-semibold text-[#a78bfa] hover:underline">
                Découvrir des eBooks
              </Link>
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {library.map(({ ebook, page, totalPages }) => (
                <Link
                  key={ebook.id}
                  href={`/read/${ebook.slug}`}
                  className="group"
                >
                  <div
                    className={`cover-theme-${ebook.coverTheme} mb-2 flex h-40 items-center justify-center rounded-2xl text-4xl shadow-lg transition group-hover:-translate-y-1`}
                  >
                    {ebook.coverEmoji}
                  </div>
                  <p className="mb-1 truncate text-sm font-bold">{ebook.title}</p>
                  <div className="h-1 w-full overflow-hidden rounded-full lumina-progress-track">
                    <div
                      className="h-full lumina-progress-fill"
                      style={{ width: `${Math.round(((page + 1) / totalPages) * 100)}%` }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section id="favoris" className="mb-12 scroll-mt-24">
          <h2 className="mb-5 text-lg font-extrabold">Mes favoris</h2>
          {favorites.length === 0 ? (
            <p className="text-sm text-[color:var(--color-lumina-text-muted)]">
              Tu n&apos;as pas encore de favoris.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {favorites.map((f) => (
                <Link key={f.id} href={`/ebooks/${f.ebook.slug}`} className="group">
                  <div
                    className={`cover-theme-${f.ebook.coverTheme} mb-2 flex h-40 items-center justify-center rounded-2xl text-4xl shadow-lg transition group-hover:-translate-y-1`}
                  >
                    {f.ebook.coverEmoji}
                  </div>
                  <p className="truncate text-sm font-bold">{f.ebook.title}</p>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section id="collections" className="mb-12 scroll-mt-24">
          <h2 className="mb-5 text-lg font-extrabold">Mes collections</h2>
          <CollectionsManager collections={collections} />
        </section>

        <section id="historique" className="mb-12 scroll-mt-24">
          <h2 className="mb-5 text-lg font-extrabold">Historique</h2>
          {progressEntries.length === 0 ? (
            <p className="text-sm text-[color:var(--color-lumina-text-muted)]">
              Ton historique de lecture est vide.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {progressEntries.map((p) => {
                const totalPages = paginateContent(p.ebook.content).length;
                const percent = Math.round(((p.page + 1) / totalPages) * 100);
                return (
                  <Link
                    key={p.id}
                    href={`/read/${p.ebook.slug}`}
                    className="lumina-card flex items-center gap-4 rounded-2xl p-3 transition hover:-translate-y-0.5"
                  >
                    <span
                      className={`cover-theme-${p.ebook.coverTheme} flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-xl`}
                    >
                      {p.ebook.coverEmoji}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-bold">{p.ebook.title}</p>
                      <p className="text-xs text-[color:var(--color-lumina-text-muted)]">
                        {p.completed ? "Terminé" : `${percent}% lu`} · {relativeDate(p.updatedAt)}
                      </p>
                    </div>
                    {p.completed && <span className="text-[#7ee0a8]">✓</span>}
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <section id="parent" className="mb-12 scroll-mt-24">
          <h2 className="mb-1 text-lg font-extrabold">Espace parent</h2>
          <p className="mb-5 text-sm text-[color:var(--color-lumina-text-muted)]">
            Crée un profil pour chaque enfant : histoires adaptées, limite de temps de lecture
            et suivi de leur activité.
          </p>
          <ChildProfileManager profiles={childProfiles} />
        </section>

        <section id="objectifs" className="mb-12 scroll-mt-24">
          <h2 className="mb-5 text-lg font-extrabold">Objectifs & temps de lecture</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="lumina-card rounded-2xl p-5">
              <ReadingGoalSetting
                initialGoal={customer.monthlyBookGoal}
                booksCompletedThisMonth={booksCompletedThisMonth}
              />
            </div>
            <div className="lumina-card rounded-2xl p-5">
              <p className="mb-1 text-xs font-semibold text-[color:var(--color-lumina-text-muted)]">
                ⏱️ Temps de lecture
              </p>
              <p className="mb-1 text-2xl font-extrabold">
                {formatMinutes(customer.totalMinutesRead)}
              </p>
              <p className="text-xs text-[color:var(--color-lumina-text-muted)]">
                {`au total, dont ${formatMinutes(
                  customer.readingDate === todayStr ? customer.minutesReadToday : 0
                )} aujourd'hui`}
              </p>
            </div>
          </div>
        </section>

        <section id="profil" className="lumina-card scroll-mt-24 rounded-[22px] p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold">{customer.name}</h2>
              <p className="text-sm text-[color:var(--color-lumina-text-muted)]">{customer.email}</p>
            </div>
            <SignOutButton />
          </div>
          {subscription?.status === "active" ? (
            <p className="text-sm text-[#c9bdff]">
              ✅ Premium actif ({subscription.plan === "yearly" ? "annuel" : "mensuel"}) — accès
              illimité à toute la bibliothèque.
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
            <ReadingReminderSetting initialReminderTime={customer.readingReminderTime} />
          </div>
        </section>
      </main>

      <AppBottomNav />
    </div>
  );
}
