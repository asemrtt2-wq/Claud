import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminNav from "@/components/AdminNav";
import AdminEbookComposer from "@/components/AdminEbookComposer";
import { createEbook } from "@/lib/actions";

export default async function NewEbookPage({
  searchParams,
}: {
  searchParams: Promise<{ audience?: string }>;
}) {
  const [session, { audience }] = await Promise.all([
    getServerSession(authOptions),
    searchParams,
  ]);

  return (
    <div className="lumina-shell">
      <AdminNav email={session?.user?.email} />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-white">
          Nouvel eBook {audience === "kids" ? "(Enfants)" : "(Adultes)"}
        </h1>
        <AdminEbookComposer
          action={createEbook}
          initialAudience={audience === "kids" ? "kids" : "adults"}
          submitLabel="Créer l'eBook"
        />
      </div>
    </div>
  );
}
