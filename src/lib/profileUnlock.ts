import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const COOKIE_NAME = "unlockedProfiles";

export async function isProfileUnlocked(profileId: string) {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return false;
  try {
    const ids: string[] = JSON.parse(raw);
    return ids.includes(profileId);
  } catch {
    return false;
  }
}

export async function markProfileUnlocked(profileId: string) {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  let ids: string[] = [];
  if (raw) {
    try {
      ids = JSON.parse(raw);
    } catch {
      ids = [];
    }
  }
  if (!ids.includes(profileId)) ids.push(profileId);
  store.set(COOKIE_NAME, JSON.stringify(ids), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 2,
  });
}

export async function hashPin(pin: string) {
  return bcrypt.hash(pin, 10);
}

export async function verifyPin(pin: string, hash: string) {
  return bcrypt.compare(pin, hash);
}
