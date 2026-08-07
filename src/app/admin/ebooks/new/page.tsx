import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminNav from "@/components/AdminNav";
import EbookForm from "@/components/EbookForm";
import { createEbook } from "@/lib/actions";

export default async function NewEbookPage({
  searchParams,
}: {
  searchParams: Promise<{ audience?: string }>;
}) {
  const [session, { audience }, catalogs] = await Promise.all([
    getServerSession(authOptions),
    searchParams,
    prisma.catalog.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="lumina-shell">
      <AdminNav email={session?.user?.email} />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-white">
          Nouvel eBook {audience === "kids" ? "(Enfants)" : "(Adultes)"}
        </h1>
        <EbookForm
          action={createEbook}
          defaults={{ audience: audience === "kids" ? "kids" : "adults" }}
          submitLabel="Créer l'eBook"
          catalogs={catalogs}
        />
      </div>
    </div>
  );
}
