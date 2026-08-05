import { prisma } from "@/lib/prisma";

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export async function getOwnedProfile(profileId: string, customerId: string) {
  const profile = await prisma.profile.findUnique({ where: { id: profileId } });
  if (!profile || profile.customerId !== customerId) return null;
  return profile;
}

export function minutesReadToday(profile: { minutesReadToday: number; limitResetDate: string | null }) {
  return profile.limitResetDate === todayStr() ? profile.minutesReadToday : 0;
}

export function updateStreak(profile: { readingStreak: number; lastReadDate: string | null }) {
  const today = todayStr();
  if (profile.lastReadDate === today) {
    return { readingStreak: profile.readingStreak, lastReadDate: today };
  }
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const readingStreak = profile.lastReadDate === yesterday ? profile.readingStreak + 1 : 1;
  return { readingStreak, lastReadDate: today };
}
