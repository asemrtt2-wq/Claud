import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customerSession";
import { getReadingStatus } from "@/lib/childActions";
import { paginateContent } from "@/lib/paginate";
import KidsReader from "@/components/KidsReader";

export default async function KidsReadPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id, slug } = await params;
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/login");

  const profile = await prisma.childProfile.findUnique({ where: { id } });
  if (!profile || profile.parentId !== customer.id) redirect("/account");

  const ebook = await prisma.eBook.findUnique({ where: { slug } });
  if (!ebook || ebook.audience !== "kids") notFound();

  const [progress, status] = await Promise.all([
    prisma.childReadingProgress.findUnique({
      where: { childProfileId_ebookId: { childProfileId: id, ebookId: ebook.id } },
    }),
    getReadingStatus(id),
  ]);

  const pages = paginateContent(ebook.content);

  return (
    <KidsReader
      childId={id}
      ebookId={ebook.id}
      kidsHomeHref={`/kids/${id}`}
      title={ebook.title}
      coverTheme={ebook.coverTheme}
      pages={pages}
      initialPage={progress?.page ?? 0}
      initialLimitReached={status.limitReached}
      dailyLimitMinutes={status.dailyLimitMinutes}
    />
  );
}
