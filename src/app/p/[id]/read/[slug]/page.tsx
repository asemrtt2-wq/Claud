import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customerSession";
import { hasAccessToEbook } from "@/lib/access";
import { getReadingStatus } from "@/lib/profileActions";
import { paginateContent } from "@/lib/paginate";
import Reader from "@/components/Reader";
import KidsReader from "@/components/KidsReader";

export default async function ProfileReadPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id, slug } = await params;
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/login");

  const profile = await prisma.profile.findUnique({ where: { id } });
  if (!profile || profile.customerId !== customer.id) redirect("/profiles");

  const ebook = await prisma.eBook.findUnique({ where: { slug } });
  if (!ebook) notFound();

  if (profile.type === "kids") {
    if (ebook.audience !== "kids") notFound();

    const [progress, status] = await Promise.all([
      prisma.readingProgress.findUnique({
        where: { profileId_ebookId: { profileId: id, ebookId: ebook.id } },
      }),
      getReadingStatus(id),
    ]);

    const pages = paginateContent(ebook.content);

    return (
      <KidsReader
        profileId={id}
        ebookId={ebook.id}
        kidsHomeHref={`/p/${id}`}
        title={ebook.title}
        coverTheme={ebook.coverTheme}
        pages={pages}
        initialPage={progress?.page ?? 0}
        initialLimitReached={status.limitReached}
        dailyLimitMinutes={status.dailyLimitMinutes}
      />
    );
  }

  if (ebook.audience !== "adults") notFound();

  const allowed = await hasAccessToEbook(customer.id, ebook.id);
  if (!allowed) redirect(`/ebooks/${slug}`);

  const progress = await prisma.readingProgress.findUnique({
    where: { profileId_ebookId: { profileId: id, ebookId: ebook.id } },
  });

  const pages = paginateContent(ebook.content);

  return (
    <Reader
      profileId={id}
      ebookId={ebook.id}
      slug={ebook.slug}
      title={ebook.title}
      coverTheme={ebook.coverTheme}
      pages={pages}
      initialPage={progress?.page ?? 0}
    />
  );
}
