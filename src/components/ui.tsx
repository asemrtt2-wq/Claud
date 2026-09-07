import { View, Text, StyleSheet, Pressable, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts, radius, spacing, touchTarget, type } from "@/theme";

/** Petite étiquette arrondie, comme « Histoire · Leadership · Foi » sur la maquette. */
export function Tag({ label }: { label: string }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>{label}</Text>
    </View>
  );
}

/** En-tête de rangée avec son lien « Voir tout ». */
export function SectionHeader({
  title,
  onSeeAll,
  style,
}: {
  title: string;
  onSeeAll?: () => void;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.sectionHeader, style]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <Pressable onPress={onSeeAll} hitSlop={10} style={styles.seeAll}>
          <Text style={styles.seeAllText}>Voir tout</Text>
          <Ionicons name="chevron-forward" size={13} color={colors.textMuted} />
        </Pressable>
      )}
    </View>
  );
}

/** Barre de progression dorée. `value` va de 0 à 1. */
export function ProgressBar({ value, height = 3 }: { value: number; height?: number }) {
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <View style={[styles.track, { height, borderRadius: height }]}>
      <View
        style={[
          styles.fill,
          { width: `${clamped * 100}%`, height, borderRadius: height },
        ]}
      />
    </View>
  );
}

/** Le bouton principal, doré et plein. */
export function GoldButton({
  label,
  icon,
  onPress,
  style,
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.goldButton, pressed && { opacity: 0.85 }, style]}
    >
      {icon && <Ionicons name={icon} size={15} color="#231B0C" />}
      <Text style={styles.goldButtonLabel}>{label}</Text>
    </Pressable>
  );
}

/** Bouton rond secondaire (le « + » de la maquette). */
export function CircleButton({
  icon,
  onPress,
  active = false,
  size = touchTarget,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  active?: boolean;
  size?: number;
  /** Lu par VoiceOver et TalkBack : un bouton en icône seule doit se nommer. */
  label: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.circle,
        { width: size, height: size, borderRadius: size / 2 },
        active && styles.circleActive,
        pressed && { opacity: 0.7 },
      ]}
    >
      <Ionicons
        name={icon}
        size={size * 0.45}
        color={active ? colors.goldLight : colors.text}
      />
    </Pressable>
  );
}

/** Message affiché quand une liste est vide — jamais un écran nu. */
export function EmptyState({
  icon = "book-outline",
  title,
  hint,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  hint?: string;
}) {
  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={26} color={colors.textFaint} />
      <Text style={styles.emptyTitle}>{title}</Text>
      {hint && <Text style={styles.emptyHint}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.lineSoft,
  },
  tagText: { fontFamily: fonts.body, fontSize: 11, color: colors.text },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  sectionTitle: { ...type.h3, fontSize: 16, fontWeight: "600" },
  seeAll: { flexDirection: "row", alignItems: "center", gap: 2, paddingVertical: 4 },
  seeAllText: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  track: { width: "100%", backgroundColor: "rgba(255,255,255,0.14)", overflow: "hidden" },
  fill: { backgroundColor: colors.gold },
  goldButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    height: touchTarget,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    backgroundColor: colors.gold,
  },
  goldButtonLabel: { fontFamily: fonts.body, fontSize: 14, fontWeight: "700", color: "#231B0C" },
  circle: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.lineSoft,
  },
  circleActive: { backgroundColor: colors.goldGlow, borderColor: colors.gold },
  empty: { alignItems: "center", gap: spacing.sm, paddingVertical: spacing.xxl },
  emptyTitle: { ...type.body, color: colors.textMuted, textAlign: "center" },
  emptyHint: { ...type.caption, textAlign: "center", maxWidth: 260 },
});
