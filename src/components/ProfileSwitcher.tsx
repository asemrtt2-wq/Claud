"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
}: {
  profiles: ProfileSummary[];
  activeProfileId: string;
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
        <span className="hidden text-xs text-white/70 sm:inline">▾</span>
      </button>

      {open && (
        <div className="lumina-card absolute right-0 top-12 z-50 w-64 rounded-2xl p-2 shadow-strong">
          <p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-[color:var(--color-lumina-text-muted)]">
            Changer de profil
          </p>

          {profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelect(p)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-white/5 ${
                p.id === activeProfileId ? "bg-white/5" : ""
              }`}
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full text-base"
                style={{ background: profileGradient(p.color) }}
              >
                {p.avatarEmoji}
              </span>
              <span className="flex-1 text-sm font-semibold text-white">{p.name}</span>
              {p.hasPin && <span className="text-xs">🔒</span>}
            </button>
          ))}

          <div className="my-1 border-t border-white/10" />

          <Link
            href="/profiles"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2 text-sm font-semibold text-[#a78bfa] transition hover:bg-white/5"
          >
            ⚙️ Gérer les profils
          </Link>
        </div>
      )}
    </div>
  );
}
