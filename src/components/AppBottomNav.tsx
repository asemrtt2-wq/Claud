import Link from "next/link";

const items = [
  { href: "#accueil", icon: "🏠", label: "Accueil" },
  { href: "#bibliotheque", icon: "📚", label: "Bibliothèque" },
  { href: "/#catalogue", icon: "✨", label: "Découvrir" },
  { href: "#favoris", icon: "❤️", label: "Favoris" },
  { href: "#profil", icon: "👤", label: "Profil" },
];

export default function AppBottomNav() {
  return (
    <nav className="lumina-card fixed inset-x-0 bottom-0 z-40 flex items-center justify-around px-4 py-3 sm:hidden">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="flex flex-col items-center gap-1 px-2 text-[0.65rem] font-semibold text-white/60 transition hover:text-white"
        >
          <span className="text-lg">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
