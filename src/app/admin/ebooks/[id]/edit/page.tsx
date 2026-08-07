import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminNav from "@/components/AdminNav";
import EbookForm from "@/components/EbookForm";
import { updateEbook } from "@/lib/actions";

export default async function EditEbookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [session, ebook, catalogs] = await Promise.all([
    getServerSession(authOptions),
    prisma.eBook.findUnique({ where: { id }, include: { catalogs: true } }),
    prisma.catalog.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!ebook) notFound();

  const boundUpdate = updateEbook.bind(null, id);

  return (
    <div className="lumina-shell">
      <AdminNav email={session?.user?.email} />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-white">
          Modifier « {ebook.title} »
        </h1>
        <EbookForm
          action={boundUpdate}
          defaults={{ ...ebook, catalogIds: ebook.catalogs.map((c) => c.id) }}
          submitLabel="Enregistrer"
          catalogs={catalogs}
        />
      </div>
    </div>
  );
}
