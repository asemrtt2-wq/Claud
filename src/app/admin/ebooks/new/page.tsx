import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminNav from "@/components/AdminNav";
import EbookForm from "@/components/EbookForm";
import { createEbook } from "@/lib/actions";

export default async function NewEbookPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-gray-light">
      <AdminNav email={session?.user?.email} />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-navy">
          Nouvel eBook
        </h1>
        <EbookForm action={createEbook} submitLabel="Créer l'eBook" />
      </div>
    </div>
  );
}
