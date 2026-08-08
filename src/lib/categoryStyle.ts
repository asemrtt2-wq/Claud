const CATEGORY_STYLES: Record<string, { emoji: string; gradient: string }> = {
  "Neurosciences": { emoji: "🧠", gradient: "from-[#6d3fd6] to-[#2a1a5e]" },
  "Bien-être": { emoji: "🧘", gradient: "from-[#2f9e8f] to-[#1a2a5e]" },
  "Bien-Être & Méditation": { emoji: "🧘", gradient: "from-[#2f9e8f] to-[#1a2a5e]" },
  "Biologie": { emoji: "🦂", gradient: "from-[#d6693f] to-[#5e2a4a]" },
  "Histoire & récit": { emoji: "🏛", gradient: "from-[#b8863f] to-[#3a2a12]" },
  "Développement personnel": { emoji: "❤️", gradient: "from-[#e0568c] to-[#3a1a3a]" },
  "Fitness & Santé": { emoji: "🏋️", gradient: "from-[#2f6bff] to-[#0d3ac9]" },
  "Sport & musculation": { emoji: "🏋️", gradient: "from-[#2f6bff] to-[#0d3ac9]" },
  "Productivité": { emoji: "⚡", gradient: "from-[#eab308] to-[#7c5cff]" },
  "Cuisine & Nutrition": { emoji: "🍽", gradient: "from-[#65a30d] to-[#1a2a5e]" },
  "Aventure & Voyage": { emoji: "🌍", gradient: "from-[#0891b2] to-[#1a2a5e]" },
};

const FALLBACK_GRADIENTS = [
  "from-[#7c5cff] to-[#5b3df0]",
  "from-[#0d3ac9] to-[#081b45]",
  "from-[#2f9e8f] to-[#1a2a5e]",
  "from-[#d6693f] to-[#5e2a4a]",
];

export function getCategoryStyle(category: string, index: number) {
  const known = CATEGORY_STYLES[category];
  if (known) return known;
  return { emoji: "📚", gradient: FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length] };
}
