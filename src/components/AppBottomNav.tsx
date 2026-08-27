import Link from "next/link";

export default function AppBottomNav({ profileId }: { profileId: string }) {
  const items = [
    { href: "#accueil", icon: "🏠", label: "Accueil" },
    { href: "#bibliotheque", icon: "📚", label: "Bibliothèque" },
    { href: "/#catalogue", icon: "✨", label: "Découvrir" },
    { href: "#favoris", icon: "❤️", label: "Favoris" },
    { href: `/p/${profileId}/compte`, icon: "👤", label: "Profil" },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-black/10 bg-white/90 px-4 py-3 backdrop-blur-lg sm:hidden">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="flex flex-col items-center gap-1 px-2 text-[0.65rem] font-semibold text-[#6e6e73] transition hover:text-[#1d1d1f]"
        >
          <span className="text-lg">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
