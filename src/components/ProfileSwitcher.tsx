"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { profileGradient } from "@/lib/profileColors";
import { switchProfile } from "@/lib/profileActions";

type ProfileSummary = {
  id: string;
  name: string;
  avatarEmoji: string;
  color: string;
  hasPin: boolean;
};

export default function ProfileSwitcher({
  profiles,
  activeProfileId,
  light = false,
}: {
  profiles: ProfileSummary[];
  activeProfileId: string;
  light?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const active = profiles.find((p) => p.id === activeProfileId) ?? profiles[0];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(profile: ProfileSummary) {
    setOpen(false);
    if (profile.id === activeProfileId) return;
    if (profile.hasPin) {
      router.push("/profiles");
      return;
    }
    startTransition(() => {
      switchProfile(profile.id);
    });
  }

  const card = light ? "ibook-card" : "lumina-card";
  const muted = light ? "text-[#6e6e73]" : "text-[color:var(--color-lumina-text-muted)]";
  const text = light ? "text-[#1d1d1f]" : "text-white";
  const hoverBg = light ? "hover:bg-black/[0.04]" : "hover:bg-white/5";
  const activeBg = light ? "bg-black/[0.04]" : "bg-white/5";
  const divider = light ? "border-black/10" : "border-white/10";
  const accent = light ? "text-[#5b3df0]" : "text-[#a78bfa]";
  const caret = light ? "text-black/50" : "text-white/70";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        className="flex items-center gap-2 rounded-full transition hover:opacity-80"
      >
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full text-base"
          style={{ background: profileGradient(active?.color ?? "purple") }}
        >
          {active?.avatarEmoji ?? "🙂"}
        </span>
        <span className={`hidden text-xs sm:inline ${caret}`}>▾</span>
      </button>

      {open && (
        <div className={`${card} absolute right-0 top-12 z-50 w-64 rounded-2xl p-2 shadow-strong`}>
          <p className={`px-3 py-2 text-xs font-bold uppercase tracking-wider ${muted}`}>
            Changer de profil
          </p>

          {profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelect(p)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition ${hoverBg} ${
                p.id === activeProfileId ? activeBg : ""
              }`}
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full text-base"
                style={{ background: profileGradient(p.color) }}
              >
                {p.avatarEmoji}
              </span>
              <span className={`flex-1 text-sm font-semibold ${text}`}>{p.name}</span>
              {p.hasPin && <span className="text-xs">🔒</span>}
            </button>
          ))}

          <div className={`my-1 border-t ${divider}`} />

          <Link
            href="/profiles"
            onClick={() => setOpen(false)}
            className={`block rounded-xl px-3 py-2 text-sm font-semibold transition ${hoverBg} ${accent}`}
          >
            ⚙️ Gérer les profils
          </Link>
          <Link
            href={`/p/${activeProfileId}/compte`}
            onClick={() => setOpen(false)}
            className={`block rounded-xl px-3 py-2 text-sm font-semibold transition ${hoverBg} ${text}`}
          >
            👤 Compte
          </Link>

          <div className={`my-1 border-t ${divider}`} />

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className={`block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${hoverBg} ${text}`}
          >
            ↪ Se déconnecter
          </button>
        </div>
      )}
    </div>
  );
}
