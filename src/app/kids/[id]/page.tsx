import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customerSession";
import { paginateContent } from "@/lib/paginate";
import BedtimeReminder from "@/components/BedtimeReminder";

export default async function KidsHomePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/login");

  const profile = await prisma.childProfile.findUnique({ where: { id } });
  if (!profile || profile.parentId !== customer.id) redirect("/account");

  const [kidsBooks, progress] = await Promise.all([
    prisma.eBook.findMany({ where: { audience: "kids" }, orderBy: { createdAt: "asc" } }),
    prisma.childReadingProgress.findMany({
      where: { childProfileId: id },
      include: { ebook: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const progressByEbookId = new Map(progress.map((p) => [p.ebookId, p]));
  const continueReading = progress.find((p) => !p.completed) ?? null;
  const todayStr = new Date().toISOString().slice(0, 10);
  const hasReadToday = progress.some((p) => p.updatedAt.toISOString().slice(0, 10) === todayStr);

  return (
    <div className="lumina-shell pb-16">
      <header className="flex items-center justify-between px-6 py-6 sm:px-10">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] text-2xl">
            {profile.avatarEmoji}
          </span>
          <h1 className="text-xl font-extrabold tracking-tight">Salut, {profile.name} !</h1>
        </div>
        <Link
          href="/account"
          className="rounded-xl border border-white/15 px-3 py-2 text-xs font-bold text-[color:var(--color-lumina-text-muted)] transition hover:border-[#a78bfa] hover:text-white"
        >
          🔐 Espace parent
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-6 sm:px-10">
        <BedtimeReminder
          reminderTime={profile.reminderTime}
          hasReadToday={hasReadToday}
          name={profile.name}
        />

        {continueReading && (
          <Link
            href={`/kids/${id}/read/${continueReading.ebook.slug}`}
            className={`lumina-card cover-theme-${continueReading.ebook.coverTheme} relative mb-10 flex h-52 flex-col justify-end overflow-hidden rounded-[26px] p-7 transition hover:-translate-y-1`}
          >
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
              <Link
                key={book.id}
                href={`/kids/${id}/read/${book.slug}`}
                className="group"
              >
                <div
                  className={`cover-theme-${book.coverTheme} mascot-idle mb-3 flex h-44 items-center justify-center rounded-3xl text-5xl shadow-lg transition group-hover:-translate-y-1.5`}
                >
                  {book.coverEmoji}
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
