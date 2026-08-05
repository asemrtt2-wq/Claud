export const PROFILE_COLORS: Record<string, { emoji: string; from: string; to: string }> = {
  yellow: { emoji: "🟡", from: "#f5c542", to: "#e08a1f" },
  blue: { emoji: "🔵", from: "#4d7dff", to: "#1e5bff" },
  green: { emoji: "🟢", from: "#34d399", to: "#059669" },
  purple: { emoji: "🟣", from: "#a78bfa", to: "#7c5cff" },
};

export function profileGradient(color: string) {
  const c = PROFILE_COLORS[color] ?? PROFILE_COLORS.purple;
  return `linear-gradient(135deg, ${c.from}, ${c.to})`;
}
