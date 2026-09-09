import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, radius, spacing, type, touchTarget } from "@/theme";
import { Divider } from "@/components/Ornament";
import { everythingIn, PLAN_LIST, rankOf, type PlanId } from "@/data/plans";
import { useLibrary } from "@/store/library";

/**
 * L'écran des abonnements.
 *
 * La charte impose « prix clair, résiliation claire, aucune pratique trompeuse ». Trois
 * choses en découlent, et aucune n'est négociable :
 *
 * - chaque formule affiche son prix, sa périodicité et **tout** ce qu'elle contient, les
 *   formules précédentes comprises — pas seulement ce qu'elle ajoute ;
 * - la résiliation est expliquée sur le même écran que l'abonnement, pas enfouie ailleurs ;
 * - tant qu'aucun paiement réel n'existe, l'écran le dit. Laisser croire qu'on s'abonne
 *   serait exactement la pratique trompeuse que la charte interdit.
 */
export default function SubscriptionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { plan, setPlan } = useLibrary();

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Retour"
          style={styles.topBarSide}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.topBarTitle}>Abonnements</Text>
        <View style={styles.topBarSide} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxxl }}
      >
        <View style={styles.intro}>
          <Text style={styles.title}>Trois formules</Text>
          <Text style={styles.lede}>
            Chacune contient tout ce que contient la précédente. Le prix affiché est celui qui
            serait facturé, chaque mois, sans engagement.
          </Text>
          <Divider width={30} style={{ marginTop: spacing.md }} />
        </View>

        {/* Rien n'est facturé aujourd'hui : le dire ici, en clair, plutôt que de laisser
            croire à un achat. */}
        <View style={styles.notice}>
          <Ionicons name="information-circle-outline" size={18} color={colors.gold} />
          <Text style={styles.noticeText}>
            Le paiement n'est pas encore en place. Choisir une formule ne débite rien : cela
            active seulement ses fonctions sur cet appareil, pour les essayer.
          </Text>
        </View>

        {PLAN_LIST.map((p) => {
          const current = plan === p.id;
          const included = rankOf(plan) >= rankOf(p.id);
          return (
            <PlanCard
              key={p.id}
              id={p.id}
              name={p.name}
              price={p.price}
              period={p.period}
              features={everythingIn(p.id)}
              current={current}
              included={included && !current}
              onChoose={() => setPlan(p.id)}
            />
          );
        })}

        <View style={styles.cancel}>
          <Text style={styles.cancelTitle}>Résilier</Text>
          <Text style={styles.cancelText}>
            L'abonnement se résilie à tout moment, et reste actif jusqu'à la fin du mois déjà
            payé. Il n'y a ni durée minimale ni frais de résiliation.
          </Text>
          <Text style={styles.cancelText}>
            Quand le paiement sera en place, il passera par l'App Store et par Google Play, qui
            l'imposent pour ce type de contenu. La résiliation se fera alors dans les réglages
            d'abonnement de ton téléphone — Lumia ne peut pas la faire à ta place, et aucun
            écran de l'app ne cherchera à t'en dissuader.
          </Text>
          {plan !== null && (
            <Pressable
              onPress={() => setPlan(null)}
              accessibilityRole="button"
              style={({ pressed }) => [styles.cancelButton, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.cancelButtonLabel}>Ne plus être abonné</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function PlanCard({
  id,
  name,
  price,
  period,
  features,
  current,
  included,
  onChoose,
}: {
  id: PlanId;
  name: string;
  price: string;
  period: string;
  features: string[];
  /** La formule en cours. */
  current: boolean;
  /** Une formule inférieure, déjà comprise dans celle en cours. */
  included: boolean;
  onChoose: () => void;
}) {
  return (
    <View style={[styles.card, current && styles.cardCurrent]}>
      {current && (
        <LinearGradient
          colors={["rgba(214,178,108,0.14)", "rgba(214,178,108,0.02)"]}
          style={StyleSheet.absoluteFill}
        />
      )}
      <View style={styles.cardHead}>
        <Text style={styles.cardName}>{name}</Text>
        {current && (
          <View style={styles.pill}>
            <Text style={styles.pillText}>Formule actuelle</Text>
          </View>
        )}
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.price}>{price}</Text>
        <Text style={styles.period}>{period}</Text>
      </View>

      <View style={styles.features}>
        {features.map((feature) => (
          <View key={feature} style={styles.feature}>
            <Ionicons name="checkmark" size={15} color={colors.gold} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <Pressable
        onPress={onChoose}
        disabled={current}
        accessibilityRole="button"
        accessibilityLabel={`Choisir ${name}, ${price} ${period}`}
        style={({ pressed }) => [
          styles.choose,
          current && styles.chooseCurrent,
          pressed && !current && { opacity: 0.9 },
        ]}
      >
        <Text style={[styles.chooseLabel, current && styles.chooseLabelCurrent]}>
          {current ? "En cours" : included ? "Revenir à cette formule" : `Choisir ${name}`}
        </Text>
      </Pressable>

      {id === "extra" && !current && (
        <Text style={styles.cardFoot}>
          Les langues et le mode bilingue ne sont disponibles que dans cette formule.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.night },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  topBarSide: { width: 60 },
  topBarTitle: {
    flex: 1,
    textAlign: "center",
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.text,
  },
  intro: { paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  title: { ...type.h1 },
  lede: { ...type.bodyMuted, marginTop: spacing.sm, lineHeight: 22 },
  notice: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start",
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderLeftWidth: 2,
    borderLeftColor: colors.gold,
  },
  noticeText: { flex: 1, ...type.caption, lineHeight: 19 },
  card: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    padding: spacing.xl,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.lineSoft,
  },
  cardCurrent: { borderColor: colors.gold },
  cardHead: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  cardName: { flex: 1, fontFamily: fonts.display, fontSize: 20, color: colors.text },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.goldGlow,
  },
  pillText: { fontFamily: fonts.body, fontSize: 10, color: colors.goldLight },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: spacing.sm, marginTop: spacing.sm },
  price: { fontFamily: fonts.display, fontSize: 28, color: colors.goldLight },
  period: { ...type.caption },
  features: { marginTop: spacing.lg, gap: spacing.sm },
  feature: { flexDirection: "row", gap: spacing.md, alignItems: "flex-start" },
  featureText: { flex: 1, ...type.body, color: colors.textMuted, lineHeight: 21 },
  choose: {
    height: touchTarget,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.lg,
    backgroundColor: colors.gold,
  },
  chooseCurrent: { backgroundColor: colors.surfaceRaised },
  chooseLabel: { fontFamily: fonts.body, fontSize: 14, fontWeight: "700", color: "#231B0C" },
  chooseLabelCurrent: { color: colors.textMuted },
  cardFoot: { ...type.caption, marginTop: spacing.md, fontSize: 11 },
  cancel: { paddingHorizontal: spacing.xl, marginTop: spacing.xxl, gap: spacing.sm },
  cancelTitle: { ...type.h3 },
  cancelText: { ...type.bodyMuted, lineHeight: 22 },
  cancelButton: {
    height: touchTarget,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.lineSoft,
  },
  cancelButtonLabel: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted },
});
