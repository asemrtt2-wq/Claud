"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { profileGradient } from "@/lib/profileColors";

type ChildProfileSummary = {
  id: string;
  name: string;
  avatarEmoji: string;
  color: string;
};

export default function ProfileSwitcher({
  customerName,
  childProfiles,
  activeLabel,
}: {
  customerName: string;
  childProfiles: ChildProfileSummary[];
  activeLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full transition hover:opacity-80"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#7c5cff] to-[#a78bfa] text-sm font-bold text-white">
          {activeLabel.charAt(0).toUpperCase()}
        </span>
        <span className="hidden text-xs text-white/70 sm:inline">▾</span>
      </button>

      {open && (
        <div className="lumina-card absolute right-0 top-12 z-50 w-64 rounded-2xl p-2 shadow-strong">
          <p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-[color:var(--color-lumina-text-muted)]">
            Changer de profil
          </p>

          <Link
            href="/account"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-white/5"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#7c5cff] to-[#a78bfa] text-sm font-bold text-white">
              {customerName.charAt(0).toUpperCase()}
            </span>
            <span className="text-sm font-semibold text-white">{customerName}</span>
          </Link>

          {childProfiles.map((p) => (
            <Link
              key={p.id}
              href={`/kids/${p.id}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-white/5"
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full text-base"
                style={{ background: profileGradient(p.color) }}
              >
                {p.avatarEmoji}
              </span>
              <span className="text-sm font-semibold text-white">{p.name}</span>
            </Link>
          ))}

          <div className="my-1 border-t border-white/10" />

          <Link
            href="/account#parent"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2 text-sm font-semibold text-[#a78bfa] transition hover:bg-white/5"
          >
            + Ajouter un profil
          </Link>
        </div>
      )}
    </div>
  );
}
