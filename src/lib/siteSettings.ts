"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getSiteSettings() {
  return prisma.siteSettings.findUnique({ where: { id: 1 } });
}

export async function updateSiteSettings(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const heroTitle = String(formData.get("heroTitle") ?? "").trim();
  const heroSubtitle = String(formData.get("heroSubtitle") ?? "").trim();

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {
      heroTitle: heroTitle || null,
      heroSubtitle: heroSubtitle || null,
    },
    create: {
      id: 1,
      heroTitle: heroTitle || null,
      heroSubtitle: heroSubtitle || null,
    },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/");
}
