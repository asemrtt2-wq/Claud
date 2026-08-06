import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customerSession";
import { paginateContent } from "@/lib/paginate";
import { isProfileUnlocked } from "@/lib/profileUnlock";
import { getRecommendations } from "@/lib/recommendations";
import AppBottomNav from "@/components/AppBottomNav";
import BookRow from "@/components/BookRow";
import ProfileSwitcher from "@/components/ProfileSwitcher";
import CollectionsManager from "@/components/CollectionsManager";
import ReadingReminderSetting from "@/components/ReadingReminderSetting";
import ReadingGoalSetting from "@/components/ReadingGoalSetting";
import BedtimeReminder from "@/components/BedtimeReminder";
import PinGate from "@/components/PinGate";
import SignOutButton from "@/components/SignOutButton";
import { profileGradient } from "@/lib/profileColors";

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

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/login");

  const profile = await prisma.profile.findUnique({ where: { id } });
  if (!profile || profile.customerId !== customer.id) redirect("/profiles");

  if (profile.pinHash) {
    const unlocked = await isProfileUnlocked(id);
    if (!unlocked) {
      return (
        <PinGate
          profileId={id}
          name={profile.name}
          avatarEmoji={profile.avatarEmoji}
          color={profile.color}
        />
      );
    }
  }

  const allProfiles = await prisma.profile.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: "asc" },
  });
  const switcherProfiles = allProfiles.map((p) => ({
    id: p.id,
    name: p.name,
    avatarEmoji: p.avatarEmoji,
    color: p.color,
    hasPin: Boolean(p.pinHash),
  }));

  const todayStr = new Date().toISOString().slice(0, 10);

  if (profile.type === "kids") {
    const [kidsBooks, progress] = await Promise.all([
      prisma.eBook.findMany({ where: { audience: "kids" }, orderBy: { createdAt: "asc" } }),
      prisma.readingProgress.findMany({
        where: { profileId: id },
        include: { ebook: true },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    const progressByEbookId = new Map(progress.map((p) => [p.ebookId, p]));
    const continueReading = progress.find((p) => !p.completed) ?? null;
    const hasReadToday = progress.some(
      (p) => p.updatedAt.toISOString().slice(0, 10) === todayStr
    );

    return (
      <div className="lumina-shell pb-16">
        <header className="flex items-center justify-between px-6 py-6 sm:px-10">
          <div className="flex items-center gap-3">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-full text-2xl"
              style={{ background: profileGradient(profile.color) }}
            >
              {profile.avatarEmoji}
            </span>
            <h1 className="text-xl font-extrabold tracking-tight">Salut, {profile.name} !</h1>
          </div>
          <ProfileSwitcher profiles={switcherProfiles} activeProfileId={id} />
        </header>

        <main className="mx-auto max-w-5xl px-6 sm:px-10">
          <BedtimeReminder
            reminderTime={profile.reminderTime}
            hasReadToday={hasReadToday}
            name={profile.name}
          />

          {continueReading && (
            <Link
              href={`/p/${id}/read/${continueReading.ebook.slug}`}
              className={`lumina-card ${continueReading.ebook.coverImageUrl ? "" : `cover-theme-${continueReading.ebook.coverTheme}`} relative mb-10 flex h-52 flex-col justify-end overflow-hidden rounded-[26px] p-7 transition hover:-translate-y-1`}
            >
              {continueReading.ebook.coverImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={continueReading.ebook.coverImageUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />
              <div className="relative z-10">
                <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                  Continue ton histoire
                </span>
                <h2 className="mb-3 text-2xl font-extrabold">{continueReading.ebook.title}</h2>
                <span className="inline-block rounded-2xl bg-white px-5 py-2.5 text-sm font-bold text-navy">
                  Reprendre ▶
                </span>
              </div>
            </Link>
          )}

          <h2 className="mb-5 text-lg font-extrabold">Toutes les histoires</h2>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
            {kidsBooks.map((book) => {
              const totalPages = paginateContent(book.content).length;
              const p = progressByEbookId.get(book.id);
              const percent = p ? Math.round(((p.page + 1) / totalPages) * 100) : 0;
              return (
                <Link key={book.id} href={`/p/${id}/read/${book.slug}`} className="group">
                  <div
                    className={`${book.coverImageUrl ? "" : `cover-theme-${book.coverTheme}`} mascot-idle relative mb-3 flex h-44 items-center justify-center overflow-hidden rounded-3xl text-5xl shadow-lg transition group-hover:-translate-y-1.5`}
                  >
                    {book.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={book.coverImageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      book.coverEmoji
                    )}
                  </div>
                  <p className="mb-1 text-sm font-bold">{book.title}</p>
                  {p && (
                    <div className="h-1.5 w-full overflow-hidden rounded-full lumina-progress-track">
                      <div className="h-full lumina-progress-fill" style={{ width: `${percent}%` }} />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  // Adult profile dashboard
  const [subscription, orders, favorites, progressEntries, collections, catalog] =
    await Promise.all([
      prisma.subscription.findUnique({ where: { customerId: customer.id } }),
      prisma.order.findMany({
        where: { customerId: customer.id, status: "paid" },
        include: { ebook: true },
      }),
      prisma.favorite.findMany({
        where: { profileId: id },
        include: { ebook: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.readingProgress.findMany({
        where: { profileId: id },
        include: { ebook: true },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.collection.findMany({
        where: { profileId: id },
        include: { items: { include: { ebook: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.eBook.findMany({ where: { audience: "adults" }, orderBy: { category: "asc" } }),
    ]);

  const categoriesMap = new Map<string, typeof catalog>();
  for (const book of catalog) {
    const list = categoriesMap.get(book.category) ?? [];
    list.push(book);
    categoriesMap.set(book.category, list);
  }
  const categoryRows = Array.from(categoriesMap.entries());

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
  const continueReading = progressEntries[0] ? libraryMap.get(progressEntries[0].ebookId) : null;
  const recommendations = await getRecommendations(id, Array.from(libraryMap.keys()));

  const billboardBook = continueReading?.ebook ?? recommendations.newest[0] ?? library[0]?.ebook ?? null;
  const billboardHref = continueReading
    ? `/p/${id}/read/${continueReading.ebook.slug}`
    : billboardBook
      ? `/ebooks/${billboardBook.slug}`
      : null;
  const billboardPercent = continueReading
    ? Math.round(((continueReading.page + 1) / continueReading.totalPages) * 100)
    : null;

  const booksCompletedThisMonth = progressEntries.filter((p) => {
    const now = new Date();
    return (
      p.completed &&
      p.updatedAt.getMonth() === now.getMonth() &&
      p.updatedAt.getFullYear() === now.getFullYear()
    );
  }).length;

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
          <ProfileSwitcher profiles={switcherProfiles} activeProfileId={id} />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 sm:px-10">
        <h1 className="mb-1 text-2xl font-extrabold tracking-tight">
          {`Bonsoir, ${profile.name} 👋`}
        </h1>
        <p className="mb-8 text-sm text-[color:var(--color-lumina-text-muted)]">
          Prêt pour une nouvelle aventure ?
        </p>

        <BedtimeReminder
          reminderTime={profile.reminderTime}
          hasReadToday={hasReadToday}
          name={profile.name}
        />

        {billboardBook && billboardHref && (
          <Link
            href={billboardHref}
            className={`${billboardBook.coverImageUrl ? "" : `cover-theme-${billboardBook.coverTheme}`} relative mb-12 flex h-[300px] flex-col justify-end overflow-hidden rounded-[26px] p-7 transition hover:-translate-y-1 sm:h-[360px] sm:p-10`}
          >
            {billboardBook.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={billboardBook.coverImageUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute right-8 top-8 text-7xl opacity-80 sm:text-8xl">
                {billboardBook.coverEmoji}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="relative z-10 max-w-md">
              <span className="mb-2 inline-block text-xs font-bold uppercase tracking-wider text-white/70">
                {continueReading ? "Continuer la lecture" : "Notre sélection pour toi"}
              </span>
              <h2 className="mb-3 text-2xl font-extrabold leading-tight sm:text-3xl">
                {billboardBook.title}
              </h2>
              {!continueReading && (
                <p className="mb-4 line-clamp-2 text-sm text-white/80">{billboardBook.subtitle}</p>
              )}
              {billboardPercent !== null && (
                <div className="mb-4 h-1.5 w-48 overflow-hidden rounded-full lumina-progress-track">
                  <div className="h-full lumina-progress-fill" style={{ width: `${billboardPercent}%` }} />
                </div>
              )}
              <span className="inline-block rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-navy">
                {continueReading ? "Reprendre ▶" : "Découvrir →"}
              </span>
            </div>
          </Link>
        )}

        {categoryRows.length > 0 && (
          <section id="parcourir" className="mb-12 scroll-mt-24">
            <h2 className="mb-5 text-lg font-extrabold">Parcourir par catégorie</h2>
            <div className="flex flex-col gap-8">
              {categoryRows.map(([category, books]) => (
                <BookRow key={category} label={category} books={books} />
              ))}
            </div>
          </section>
        )}

        {(recommendations.byCategory.length > 0 ||
          recommendations.byAuthor.length > 0 ||
          recommendations.newest.length > 0 ||
          recommendations.popular.length > 0) && (
          <section id="recommandations" className="mb-12 scroll-mt-24">
            <h2 className="mb-5 text-lg font-extrabold">Recommandé pour toi</h2>
            <div className="flex flex-col gap-8">
              {[
                {
                  label: recommendations.topCategory
                    ? `Parce que tu aimes ${recommendations.topCategory}`
                    : "",
                  books: recommendations.byCategory,
                },
                {
                  label: recommendations.topAuthor ? `Auteurs favoris : ${recommendations.topAuthor}` : "",
                  books: recommendations.byAuthor,
                },
                { label: "Nouveautés", books: recommendations.newest },
                { label: "Les plus populaires", books: recommendations.popular },
              ]
                .filter((row) => row.books.length > 0)
                .map((row) => (
                  <BookRow key={row.label} label={row.label} books={row.books} />
                ))}
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
            <BookRow
              label=""
              books={library.map(({ ebook }) => ebook)}
              hrefBase={`/p/${id}/read`}
              progressByEbookId={
                new Map(
                  library.map(({ ebook, page, totalPages }) => [
                    ebook.id,
                    Math.round(((page + 1) / totalPages) * 100),
                  ])
                )
              }
            />
          )}
        </section>

        <section id="favoris" className="mb-12 scroll-mt-24">
          <h2 className="mb-5 text-lg font-extrabold">Mes favoris</h2>
          {favorites.length === 0 ? (
            <p className="text-sm text-[color:var(--color-lumina-text-muted)]">
              Tu n&apos;as pas encore de favoris.
            </p>
          ) : (
            <BookRow label="" books={favorites.map((f) => f.ebook)} />
          )}
        </section>

        <section id="collections" className="mb-12 scroll-mt-24">
          <h2 className="mb-5 text-lg font-extrabold">Mes collections</h2>
          <CollectionsManager profileId={id} collections={collections} />
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
                    href={`/p/${id}/read/${p.ebook.slug}`}
                    className="lumina-card flex items-center gap-4 rounded-2xl p-3 transition hover:-translate-y-0.5"
                  >
                    <span
                      className={`${p.ebook.coverImageUrl ? "" : `cover-theme-${p.ebook.coverTheme}`} relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg text-xl`}
                    >
                      {p.ebook.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.ebook.coverImageUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        p.ebook.coverEmoji
                      )}
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

        <section id="telechargements" className="mb-12 scroll-mt-24">
          <h2 className="mb-5 text-lg font-extrabold">Téléchargements</h2>
          <p className="text-sm text-[color:var(--color-lumina-text-muted)]">
            Le hors-ligne n&apos;est pas disponible sur le web — lis directement dans le
            navigateur, où que tu sois.
          </p>
        </section>

        <section id="objectifs" className="mb-12 scroll-mt-24">
          <h2 className="mb-5 text-lg font-extrabold">Objectifs & temps de lecture</h2>
          <div className="grid gap-4 sm:grid-cols-3">
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
        </section>

        <section id="profil" className="lumina-card scroll-mt-24 rounded-[22px] p-6">
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

      <AppBottomNav />
    </div>
  );
}
