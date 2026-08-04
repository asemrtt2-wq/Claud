import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customerSession";
import { hasAccessToEbook } from "@/lib/access";
import { paginateContent } from "@/lib/paginate";
import Reader from "@/components/Reader";

export default async function ReadPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ebook = await prisma.eBook.findUnique({ where: { slug } });
  if (!ebook) notFound();

  const customer = await getCurrentCustomer();
  if (!customer) redirect("/login");

  const allowed = await hasAccessToEbook(customer.id, ebook.id);
  if (!allowed) redirect(`/ebooks/${slug}`);

  const progress = await prisma.readingProgress.findUnique({
    where: { customerId_ebookId: { customerId: customer.id, ebookId: ebook.id } },
  });

  const pages = paginateContent(ebook.content);

  return (
    <Reader
      ebookId={ebook.id}
      slug={ebook.slug}
      title={ebook.title}
      coverTheme={ebook.coverTheme}
      pages={pages}
      initialPage={progress?.page ?? 0}
    />
  );
}
