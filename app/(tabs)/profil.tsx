import { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, radius, spacing, type } from "@/theme";
import { Divider, StarMotif } from "@/components/Ornament";
import { useCatalog } from "@/store/catalog";
import { LOCALES } from "@/data/catalog";
import { PLANS } from "@/data/plans";
import { useLibrary } from "@/store/library";

/**
 * « Mon espace » : les statistiques réelles du lecteur, son abonnement, et les raccourcis.
 *
 * L'avatar de la maquette est un paysage ; ici c'est un médaillon géométrique — pas d'image,
 * conformément à la règle sur les représentations.
 */
export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { progress, favorites, minutesRead, plan, locale, canChangeLanguage, freeBookAvailable, reset } =
    useLibrary();

  const stats = useMemo(() => {
    const entries = Object.values(progress);
    const finished = entries.filter((p) => p.finished).length;
    const inProgress = entries.filter((p) => !p.finished).length;
    const hours = Math.floor(minutesRead / 60);
    return {
      finished,
      inProgress,
      time: hours > 0 ? `${hours} h` : `${minutesRead} min`,
    };
  }, [progress, minutesRead]);

  const menu = [
    {
      icon: "gift-outline",
      label: freeBookAvailable ? "Choisir mon livre offert" : "Mon livre offert",
      onPress: () => router.push("/cadeau"),
    },
    { icon: "book-outline", label: "Mes livres", onPress: () => router.push("/(tabs)/bibliotheque") },
    { icon: "heart-outline", label: "Mes favoris", badge: favorites.length || undefined, onPress: () => router.push("/(tabs)/bibliotheque") },
    { icon: "compass-outline", label: "Explorer le catalogue", onPress: () => router.push("/(tabs)/explorer") },
    {
      icon: "refresh-outline",
      label: "Réinitialiser ma progression",
      onPress: () =>
        Alert.alert(
          "Réinitialiser ?",
          "Ta progression, tes favoris et ton temps de lecture seront effacés de cet appareil.",
          [
            { text: "Annuler", style: "cancel" },
            { text: "Effacer", style: "destructive", onPress: reset },
          ]
        ),
    },
  ] as const;

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + spacing.md,
          paddingBottom: spacing.xxxl,
        }}
      >
        <Text style={styles.pageTitle}>Mon espace</Text>

        <View style={styles.identity}>
          <View style={styles.medallion}>
            <LinearGradient
              colors={["#2A2113", "#15121C"]}
              style={[StyleSheet.absoluteFill, { borderRadius: 44 }]}
            />
            <StarMotif size={56} opacity={0.5} />
          </View>
          <Text style={styles.name}>Lecteur de lumière</Text>
          <Text style={styles.motto}>Toujours apprendre, toujours évoluer.</Text>
          <Divider width={30} style={{ marginTop: spacing.md }} />
        </View>

        <View style={styles.stats}>
          <Stat value={String(stats.finished)} label="Livres lus" />
          <View style={styles.statSeparator} />
          <Stat value={stats.time} label="Temps de lecture" />
          <View style={styles.statSeparator} />
          <Stat value={String(stats.inProgress)} label="En cours" />
        </View>

        <Pressable
          onPress={() => router.push("/abonnement")}
          accessibilityRole="button"
          accessibilityLabel="Voir les abonnements"
          style={({ pressed }) => [styles.pass, pressed && { opacity: 0.9 }]}
        >
          <LinearGradient
            colors={plan ? ["#EAD3A0", "#D6B26C"] : ["#2A2113", "#1B1710"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Ionicons
            name={plan ? "ribbon" : "ribbon-outline"}
            size={22}
            color={plan ? "#231B0C" : colors.gold}
          />
          <View style={styles.passBody}>
            <Text style={[styles.passTitle, plan && styles.passTitleActive]}>
              {plan ? PLANS[plan].name : "S'abonner à Lumia"}
            </Text>
            <Text style={[styles.passHint, plan && styles.passHintActive]}>
              {plan
                ? `${PLANS[plan].price} ${PLANS[plan].period} · résiliable à tout moment`
                : `Trois formules, à partir de ${PLANS.plus.price} par mois`}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={plan ? "#231B0C" : colors.textMuted}
          />
        </Pressable>

        {/* La langue n'apparaît que si elle sert : sans la formule qui la débloque, la
            proposer reviendrait à montrer une porte fermée. */}
        {canChangeLanguage && (
          <Pressable
            onPress={() => router.push("/langue")}
            accessibilityRole="button"
            accessibilityLabel="Changer la langue de lecture"
            style={({ pressed }) => [styles.language, pressed && styles.menuItemPressed]}
          >
            <Ionicons name="language-outline" size={19} color={colors.gold} />
            <Text style={styles.menuLabel}>Langue de lecture</Text>
            <Text style={styles.languageValue}>{LOCALES[locale].endonym}</Text>
            <Ionicons name="chevron-forward" size={15} color={colors.textFaint} />
          </Pressable>
        )}

        <View style={styles.menu}>
          {menu.map((item) => (
            <Pressable
              key={item.label}
              onPress={item.onPress}
              style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
            >
              <Ionicons name={item.icon as never} size={19} color={colors.gold} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              {"badge" in item && item.badge ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              ) : null}
              <Ionicons name="chevron-forward" size={15} color={colors.textFaint} />
            </Pressable>
          ))}
        </View>

        <Text style={styles.footnote}>
          Ta progression est enregistrée sur cet appareil. Lumia ne demande aucun compte et
          n&apos;envoie rien sur Internet.
        </Text>

        {/* Les deux textes juridiques doivent être atteignables sans passer par l'écran qui
            vend : un lecteur qui cherche la politique de confidentialité n'a pas à traverser
            une page d'abonnement pour la trouver. */}
        <View style={styles.legal}>
          <Pressable
            onPress={() => router.push("/conditions")}
            hitSlop={10}
            accessibilityRole="link"
            accessibilityLabel="Conditions d'utilisation"
          >
            <Text style={styles.legalLink}>Conditions d&apos;utilisation</Text>
          </Pressable>
          <Text style={styles.legalSeparator}>·</Text>
          <Pressable
            onPress={() => router.push("/confidentialite")}
            hitSlop={10}
            accessibilityRole="link"
            accessibilityLabel="Politique de confidentialité"
          >
            <Text style={styles.legalLink}>Confidentialité</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.night },
  pageTitle: { ...type.h1, paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  identity: { alignItems: "center", gap: spacing.sm },
  medallion: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  name: { fontFamily: fonts.display, fontSize: 19, color: colors.text, marginTop: spacing.sm },
  motto: { ...type.caption, color: colors.textMuted },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xl,
    marginHorizontal: spacing.lg,
  },
  stat: { flex: 1, alignItems: "center", gap: 4 },
  statValue: { fontFamily: fonts.display, fontSize: 24, color: colors.goldLight },
  statLabel: { ...type.caption, textAlign: "center" },
  statSeparator: { width: StyleSheet.hairlineWidth, height: 30, backgroundColor: colors.lineSoft },
  pass: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    height: 68,
    borderRadius: radius.lg,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.gold,
  },
  passBody: { flex: 1, gap: 2 },
  passTitle: { fontFamily: fonts.body, fontSize: 14, fontWeight: "700", color: colors.goldLight },
  language: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  languageValue: { fontFamily: fonts.body, fontSize: 13, color: colors.goldLight },
  passTitleActive: { color: "#231B0C" },
  passHint: { ...type.caption, color: colors.textMuted },
  passHintActive: { color: "#4A3A18" },
  menu: { marginTop: spacing.xl, marginHorizontal: spacing.lg, gap: 2 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    height: 52,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  menuItemPressed: { backgroundColor: colors.surfaceRaised },
  menuLabel: { flex: 1, fontFamily: fonts.body, fontSize: 14, color: colors.text },
  badge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.goldGlow,
  },
  badgeText: { fontFamily: fonts.body, fontSize: 11, color: colors.goldLight },
  footnote: {
    ...type.caption,
    textAlign: "center",
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xxl,
    lineHeight: 17,
  },
  legal: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  legalLink: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.gold,
    textDecorationLine: "underline",
  },
  legalSeparator: { ...type.caption },
});
