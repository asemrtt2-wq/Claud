import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "activeProfileId";

export async function getActiveProfile(customerId: string) {
  const store = await cookies();
  const id = store.get(COOKIE_NAME)?.value;
  if (!id) return null;

  const profile = await prisma.profile.findUnique({ where: { id } });
  if (!profile || profile.customerId !== customerId) return null;
  return profile;
}

export async function setActiveProfileCookie(profileId: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, profileId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}
