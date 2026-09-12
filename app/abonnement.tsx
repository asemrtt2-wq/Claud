import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, radius, spacing, type, touchTarget } from "@/theme";
import { Divider, StarMotif } from "@/components/Ornament";
import { BOOK_PRICE, FREE_PICKS, PLANS, everythingIn, rankOf, type PlanId } from "@/data/plans";
import { useCatalog } from "@/store/catalog";
import { useLibrary } from "@/store/library";

/**
 * L'écran des abonnements, sur la maquette fournie : promesse, quatre arguments, trois
 * formules côte à côte, et les garanties en pied de page.
 *
 * La charte impose « prix clair, résiliation claire, aucune pratique trompeuse ». Trois
 * conséquences, et aucune n'est négociable :
 *
 * - chaque formule affiche son prix et **tout** ce qu'elle contient, formules précédentes
 *   comprises — pas seulement ce qu'elle ajoute ;
 * - la résiliation est expliquée ici, sur l'écran qui vend, et pas ailleurs ;
 * - ce qui n'existe pas encore est marqué comme tel. La maquette portait « le plus
 *   populaire », « rejoignez des milliers de lecteurs » et une note de cinq étoiles :
 *   Lumia n'a ni public mesuré ni avis, et l'app n'affiche aucun chiffre qu'elle n'a pas
 *   mesuré. Ces éléments sont donc remplacés par ce qui est vrai — une recommandation
 *   assumée par l'éditeur, qui n'est pas une statistique déguisée.
 */

/** Chaque formule a sa couleur sur la maquette : sobre, or, bleu. */
const ACCENTS: Record<PlanId, { border: string; tint: readonly [string, string]; label: string }> = {
  plus: { border: colors.lineSoft, tint: ["#15161C", "#101116"], label: colors.text },
  premium: { border: "#D6B26C", tint: ["#241C10", "#15110A"], label: "#EAD3A0" },
  extra: { border: "#5B7FA6", tint: ["#141C26", "#0E1319"], label: "#A9C6E4" },
};

const TAGLINES: Record<PlanId, { subtitle: string; foot: string }> = {
  plus: { subtitle: "L'essentiel pour commencer", foot: "Idéal pour découvrir Lumia" },
  premium: {
    subtitle: "Allez plus loin",
    foot: "Pour peser sur les livres à venir et les lire en premier",
  },
  extra: {
    subtitle: "Sans limites",
    foot: "Pour lire sans frontière de langue",
  },
};

export default function SubscriptionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { plan, setPlan, freeBookAvailable } = useLibrary();
  const { books } = useCatalog();

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
        {/* Promesse. Le motif remplace la photographie de la maquette : elle montrait un
            personnage, ce que la règle sur la représentation figurative exclut. */}
        <View style={styles.hero}>
          <LinearGradient colors={["#1A1408", "#0B0B0F"]} style={StyleSheet.absoluteFill} />
          <View style={styles.heroMotif}>
            <StarMotif size={190} opacity={0.1} />
          </View>
          <Text style={styles.wordmark}>LUMIA</Text>
          <Text style={styles.motto}>Des histoires qui changent votre vie</Text>
          <Text style={styles.heroTitle}>
            {"Investissez dans la\nmeilleure version\nde vous."}
          </Text>
          <Text style={styles.heroLede}>
            {`${books.length} livres courts sur l'histoire, la philosophie, la spiritualité et les sciences. Choisissez la formule qui vous correspond.`}
          </Text>
        </View>

        <View style={styles.promises}>
          <Promise icon="book-outline" title="Des livres courts" detail="12 à 60 pages" />
          <Promise
            icon="school-outline"
            title="Des sources vérifiables"
            detail="chiffres et références"
          />
          <Promise
            icon="leaf-outline"
            title="Un contenu 100 % halal"
            detail="charte respectée livre par livre"
          />
          <Promise
            icon="cloud-offline-outline"
            title="Lecture hors ligne"
            detail="sans compte, sans donnée envoyée"
          />
        </View>

        {/* Rien n'est facturé aujourd'hui : le dire ici, à l'endroit qui vend. */}
        <View style={styles.notice}>
          <Ionicons name="information-circle-outline" size={18} color={colors.gold} />
          <Text style={styles.noticeText}>
            Le paiement n'est pas encore en place. Choisir une formule ne débite rien : cela
            active seulement ses fonctions sur cet appareil, pour les essayer.
          </Text>
        </View>

        {(Object.keys(PLANS) as PlanId[]).map((id) => (
          <PlanCard
            key={id}
            id={id}
            current={plan === id}
            included={rankOf(plan) > rankOf(id)}
            onChoose={() => setPlan(id)}
          />
        ))}

        {/* Sans abonnement : ce que le lecteur peut avoir quand même. */}
        <View style={styles.without}>
          <Text style={styles.withoutTitle}>Sans abonnement</Text>
          <Pressable
            onPress={() => router.push("/cadeau")}
            accessibilityRole="button"
            accessibilityLabel="Voir le livre offert"
            style={({ pressed }) => [styles.withoutRow, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="gift-outline" size={17} color={colors.gold} />
            <Text style={styles.withoutText}>
              {freeBookAvailable
                ? `Un livre offert, à choisir parmi ${FREE_PICKS.length}. Il reste à vous.`
                : "Votre livre offert a été pris. Il reste à vous."}
            </Text>
            <Ionicons name="chevron-forward" size={14} color={colors.textFaint} />
          </Pressable>
          <View style={styles.withoutRow}>
            <Ionicons name="pricetag-outline" size={17} color={colors.gold} />
            <Text style={styles.withoutText}>
              {`Ensuite ${BOOK_PRICE} par livre, achetés un par un et gardés pour toujours.`}
            </Text>
          </View>
        </View>

        <View style={styles.guarantees}>
          <Guarantee icon="close-circle-outline" label="Sans engagement" />
          <Guarantee icon="calendar-outline" label="Annulation à tout moment" />
        </View>

        <View style={styles.cancel}>
          <Text style={styles.cancelTitle}>Renouvellement et résiliation</Text>
          {/* Apple exige que l'écran qui vend un abonnement porte, dans l'app elle-même, sa
              durée, son prix, le caractère automatique du renouvellement, et un lien
              fonctionnel vers les conditions et la confidentialité. Rien de tout cela n'est
              une contrainte gênante ici : c'est ce que la charte demandait déjà. */}
          <Text style={styles.cancelText}>
            Chaque formule dure un mois et se renouvelle automatiquement au même prix, jusqu'à
            ce que vous la résiliiez. La résiliation se fait à tout moment : l'abonnement reste
            actif jusqu'à la fin du mois déjà payé, puis s'arrête. Ni durée minimale, ni frais.
          </Text>
          <Text style={styles.cancelText}>
            Quand le paiement sera en place, il passera par l'App Store et par Google Play, qui
            l'imposent pour ce type de contenu. La résiliation se fera alors dans les réglages
            d'abonnement de votre téléphone — Lumia ne peut pas la faire à votre place, et aucun
            écran de l'app ne cherchera à vous en dissuader.
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

        <View style={styles.legal}>
          <LegalLink label="Conditions d'utilisation" onPress={() => router.push("/conditions")} />
          <Text style={styles.legalSeparator}>·</Text>
          <LegalLink label="Confidentialité" onPress={() => router.push("/confidentialite")} />
        </View>

        <Divider width={30} style={styles.footDivider} />
        <Text style={styles.footMotto}>Lire. Comprendre. Évoluer.</Text>
      </ScrollView>
    </View>
  );
}

function Promise({ icon, title, detail }: { icon: string; title: string; detail: string }) {
  return (
    <View style={styles.promise}>
      <View style={styles.promiseIcon}>
        <Ionicons name={icon as never} size={20} color={colors.gold} />
      </View>
      <Text style={styles.promiseTitle}>{title}</Text>
      <Text style={styles.promiseDetail}>{detail}</Text>
    </View>
  );
}

/** Lien vers un texte juridique, souligné pour qu'on le reconnaisse comme un lien. */
function LegalLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={10} accessibilityRole="link" accessibilityLabel={label}>
      {({ pressed }) => (
        <Text style={[styles.legalLink, pressed && { color: colors.goldLight }]}>{label}</Text>
      )}
    </Pressable>
  );
}

function Guarantee({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.guarantee}>
      <Ionicons name={icon as never} size={16} color={colors.textMuted} />
      <Text style={styles.guaranteeLabel}>{label}</Text>
    </View>
  );
}

function PlanCard({
  id,
  current,
  included,
  onChoose,
}: {
  id: PlanId;
  /** La formule en cours. */
  current: boolean;
  /** Une formule inférieure, déjà comprise dans celle en cours. */
  included: boolean;
  onChoose: () => void;
}) {
  const plan = PLANS[id];
  const accent = ACCENTS[id];
  const tag = TAGLINES[id];

  return (
    <View style={[styles.card, { borderColor: current ? colors.gold : accent.border }]}>
      <LinearGradient colors={accent.tint} style={StyleSheet.absoluteFill} />

      {/* « Recommandé » est un avis d'éditeur, pas une statistique : Lumia n'a pas encore de
          public à compter, et la maquette annonçait « le plus populaire ». */}
      {id === "premium" && (
        <View style={styles.recommended}>
          <Ionicons name="star" size={11} color="#231B0C" />
          <Text style={styles.recommendedText}>Notre recommandation</Text>
        </View>
      )}

      <Text style={styles.cardWordmark}>LUMIA</Text>
      <Text style={[styles.cardName, { color: accent.label }]}>
        {plan.name.replace("Lumia ", "")}
      </Text>
      <Text style={styles.cardSubtitle}>{tag.subtitle}</Text>

      <View style={styles.priceRow}>
        <Text style={[styles.price, { color: accent.label }]}>{plan.price}</Text>
        <Text style={styles.period}>{`/ ${plan.period.replace("par ", "")}`}</Text>
      </View>

      <Pressable
        onPress={onChoose}
        disabled={current}
        accessibilityRole="button"
        accessibilityLabel={`Choisir ${plan.name}, ${plan.price} ${plan.period}`}
        style={({ pressed }) => [
          styles.choose,
          { borderColor: accent.border },
          id === "premium" && styles.chooseFilled,
          current && styles.chooseCurrent,
          pressed && !current && { opacity: 0.9 },
        ]}
      >
        <Text
          style={[
            styles.chooseLabel,
            id === "premium" && styles.chooseLabelFilled,
            current && styles.chooseLabelCurrent,
          ]}
        >
          {current ? "Formule actuelle" : included ? "Revenir à cette formule" : `Choisir ${plan.name}`}
        </Text>
      </Pressable>

      <View style={styles.features}>
        {everythingIn(id).map((feature) => (
          <View key={feature} style={styles.feature}>
            <Ionicons name="checkmark" size={15} color={accent.label} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      {/* Ce qui n'existe pas encore est dit ici, pas caché : vendre une fonction absente
          serait la pratique trompeuse que la charte interdit. */}
      {id === "premium" && (
        <Text style={styles.pending}>
          La demande de livre, le vote et les nouveautés en avance demandent un serveur : ils
          ne fonctionnent pas encore.
        </Text>
      )}
      {id === "extra" && (
        <Text style={styles.pending}>
          Les traductions arrivent langue par langue, par mise à jour de l'app. Le catalogue
          n'existe pour l'instant qu'en français.
        </Text>
      )}

      <View style={styles.cardFoot}>
        <Ionicons name="ellipse-outline" size={13} color={colors.textFaint} />
        <Text style={styles.cardFootText}>{tag.foot}</Text>
      </View>
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

  hero: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.xxl },
  heroMotif: { position: "absolute", right: -40, top: 10, opacity: 0.9 },
  wordmark: { fontFamily: fonts.display, fontSize: 20, letterSpacing: 6, color: colors.goldLight },
  motto: { ...type.caption, marginTop: 4 },
  heroTitle: {
    fontFamily: fonts.display,
    fontSize: 34,
    lineHeight: 42,
    color: colors.text,
    marginTop: spacing.xl,
  },
  heroLede: { ...type.bodyMuted, marginTop: spacing.md, lineHeight: 22 },

  promises: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.lg,
    rowGap: spacing.xl,
  },
  promise: { width: "50%", alignItems: "center", paddingHorizontal: spacing.sm },
  promiseIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.goldDeep,
  },
  promiseTitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.text,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  promiseDetail: { ...type.caption, fontSize: 11, textAlign: "center", marginTop: 2 },

  notice: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start",
    marginHorizontal: spacing.xl,
    marginTop: spacing.xxl,
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
    paddingTop: spacing.xxl,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    alignItems: "center",
  },
  recommended: {
    position: "absolute",
    top: 0,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: spacing.lg,
    paddingVertical: 5,
    borderBottomLeftRadius: radius.md,
    borderBottomRightRadius: radius.md,
    backgroundColor: colors.gold,
  },
  recommendedText: { fontFamily: fonts.body, fontSize: 10, fontWeight: "700", color: "#231B0C" },
  cardWordmark: {
    fontFamily: fonts.display,
    fontSize: 11,
    letterSpacing: 4,
    color: colors.textMuted,
  },
  cardName: { fontFamily: fonts.display, fontSize: 32, marginTop: 2 },
  cardSubtitle: { ...type.caption, marginTop: 2 },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  price: { fontFamily: fonts.display, fontSize: 30 },
  period: { ...type.caption },
  choose: {
    alignSelf: "stretch",
    height: touchTarget,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chooseFilled: { backgroundColor: colors.gold, borderColor: colors.gold },
  chooseCurrent: { backgroundColor: colors.surfaceRaised, borderColor: colors.lineSoft },
  chooseLabel: { fontFamily: fonts.body, fontSize: 14, fontWeight: "700", color: colors.text },
  chooseLabelFilled: { color: "#231B0C" },
  chooseLabelCurrent: { color: colors.textMuted },
  features: { alignSelf: "stretch", marginTop: spacing.xl, gap: spacing.md },
  feature: { flexDirection: "row", gap: spacing.md, alignItems: "flex-start" },
  featureText: { flex: 1, ...type.body, color: colors.textMuted, lineHeight: 21 },
  pending: {
    alignSelf: "stretch",
    ...type.caption,
    fontSize: 11,
    lineHeight: 17,
    marginTop: spacing.lg,
  },
  cardFoot: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.lineSoft,
  },
  cardFootText: { flex: 1, ...type.caption, fontSize: 11, lineHeight: 16 },

  without: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.xxl,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    gap: spacing.md,
  },
  withoutTitle: { ...type.label },
  withoutRow: { flexDirection: "row", gap: spacing.md, alignItems: "flex-start" },
  withoutText: { flex: 1, ...type.body, color: colors.textMuted, lineHeight: 21 },

  guarantees: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.xl,
    marginTop: spacing.xxl,
  },
  guarantee: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  guaranteeLabel: { ...type.caption },

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

  legal: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  legalLink: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.gold,
    textDecorationLine: "underline",
  },
  legalSeparator: { ...type.caption },

  footDivider: { alignSelf: "center", marginTop: spacing.xxl },
  footMotto: { ...type.caption, textAlign: "center", marginTop: spacing.md, letterSpacing: 1 },
});
