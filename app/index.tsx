import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, radius, spacing, type } from "@/theme";
import { Divider, LatticePattern } from "@/components/Ornament";
import { CATEGORIES, CATEGORY_ICONS } from "@/data/types";
import { FREE_PICKS } from "@/data/plans";
import { useLibrary } from "@/store/library";

/**
 * L'écran d'ouverture de la maquette : le logo, la promesse, les sept catégories, la devise.
 *
 * La maquette pose tout cela sur une photo de montagnes et de coupoles. Ici le décor est
 * un dégradé nocturne et une trame géométrique — même intention, aucune image figurative.
 */
export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { freeBookAvailable } = useLibrary();

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={["#1A1710", "#100F13", "#0B0B0F"]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      {/* La lueur basse de la maquette, là où le soleil se couche derrière les montagnes. */}
      <LinearGradient
        colors={["transparent", "rgba(214,178,108,0.18)", "transparent"]}
        style={styles.horizon}
        pointerEvents="none"
      />
      <LatticePattern rows={8} columns={5} opacity={0.05} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.xxl, paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Ionicons name="book-outline" size={38} color={colors.goldLight} />
          <Text style={styles.logo}>LUMIA</Text>
          <Text style={styles.tagline}>
            DES LIVRES QUI{"\n"}ÉCLAIRENT VOTRE MONDE
          </Text>
          <Divider width={40} style={{ marginTop: spacing.lg }} />
        </View>

        <View style={styles.categories}>
          {CATEGORIES.map((category) => (
            <View key={category} style={styles.categoryRow}>
              <Ionicons
                name={CATEGORY_ICONS[category] as never}
                size={20}
                color={colors.gold}
                style={styles.categoryIcon}
              />
              <Text style={styles.categoryLabel}>{category}</Text>
            </View>
          ))}
        </View>

        <View style={styles.motto}>
          <Divider width={26} />
          <Text style={styles.mottoText}>LIRE{"\n"}COMPRENDRE{"\n"}ÉVOLUER</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerLine}>UN MEILLEUR TOI,</Text>
          <Text style={styles.footerLine}>POUR UN MEILLEUR DEMAIN.</Text>
        </View>

        <Pressable
          onPress={() => router.replace("/(tabs)")}
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
        >
          <LinearGradient
            colors={["#EAD3A0", "#D6B26C"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.ctaLabel}>Entrer dans la bibliothèque</Text>
          <Ionicons name="arrow-forward" size={16} color="#231B0C" />
        </Pressable>

        {/* Le cadeau est annoncé dès l'ouverture, pas caché derrière un écran d'abonnement :
            c'est la première chose que Lumia donne, avant de demander quoi que ce soit. */}
        {freeBookAvailable && (
          <Pressable
            onPress={() => router.push("/cadeau")}
            accessibilityRole="button"
            accessibilityLabel="Choisir mon livre offert"
            style={({ pressed }) => [styles.gift, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="gift-outline" size={15} color={colors.gold} />
            <Text style={styles.giftLabel}>
              {`Un livre offert, à choisir parmi ${FREE_PICKS.length}`}
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.night },
  horizon: { position: "absolute", left: 0, right: 0, bottom: 0, height: 320 },
  content: { paddingHorizontal: spacing.xl, flexGrow: 1, justifyContent: "space-between" },
  header: { alignItems: "center", gap: spacing.md },
  logo: { ...type.logo, fontSize: 38, letterSpacing: 14, marginTop: spacing.xs },
  tagline: {
    ...type.label,
    fontSize: 10,
    letterSpacing: 2.4,
    textAlign: "center",
    lineHeight: 18,
    color: colors.textMuted,
  },
  categories: { marginTop: spacing.xxxl, gap: spacing.lg, alignSelf: "center" },
  categoryRow: { flexDirection: "row", alignItems: "center", gap: spacing.lg },
  categoryIcon: { width: 24, textAlign: "center" },
  categoryLabel: { fontFamily: fonts.display, fontSize: 17, color: colors.text },
  motto: { marginTop: spacing.xxxl, gap: spacing.md },
  mottoText: {
    fontFamily: fonts.display,
    fontSize: 13,
    letterSpacing: 3,
    lineHeight: 24,
    color: colors.textMuted,
  },
  footer: { marginTop: spacing.xxxl, alignItems: "center", gap: 2 },
  footerLine: {
    ...type.label,
    fontSize: 10,
    letterSpacing: 2.2,
    color: colors.goldLight,
    textAlign: "center",
  },
  cta: {
    marginTop: spacing.xl,
    height: 52,
    borderRadius: radius.pill,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  ctaPressed: { opacity: 0.85 },
  ctaLabel: { fontFamily: fonts.body, fontSize: 15, fontWeight: "700", color: "#231B0C" },
  gift: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
  giftLabel: { fontFamily: fonts.body, fontSize: 13, color: colors.gold },
});
