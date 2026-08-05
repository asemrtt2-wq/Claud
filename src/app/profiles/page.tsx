import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customerSession";
import ProfilePicker from "@/components/ProfilePicker";

export default async function ProfilesPage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/login");

  const profiles = await prisma.profile.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: "asc" },
  });

  const profileSummaries = profiles.map((p) => ({
    id: p.id,
    name: p.name,
    avatarEmoji: p.avatarEmoji,
    color: p.color,
    type: p.type,
    hasPin: Boolean(p.pinHash),
    dailyLimitMinutes: p.dailyLimitMinutes,
  }));

  return (
    <div className="lumina-shell flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <Link href="/" className="mb-10 flex items-center gap-2.5 text-lg font-extrabold tracking-tight">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] text-white">
          ✦
        </span>
        LUMINA
      </Link>
      <h1 className="mb-10 text-2xl font-extrabold tracking-tight text-white">
        Qui lit aujourd&apos;hui ?
      </h1>
      <ProfilePicker profiles={profileSummaries} />
    </div>
  );
}
