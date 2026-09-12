import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, radius, spacing, type } from "@/theme";
import { Divider } from "@/components/Ornament";
import BookCover from "@/components/BookCover";
import { GoldButton } from "@/components/ui";
import { BOOK_PRICE, FREE_PICKS, PLANS } from "@/data/plans";
import { useCatalog } from "@/store/catalog";
import { useLibrary } from "@/store/library";

/**
 * Le livre offert : cinq livres proposés, un seul à garder.
 *
 * Le choix est **définitif**, et l'écran le dit deux fois — dans le texte d'accueil et dans
 * la confirmation. Un cadeau dont on découvre la limite après l'avoir consommé est
 * exactement la pratique trompeuse que la charte interdit ; il n'y a donc rien à découvrir
 * après coup.
 *
 * La sélection elle-même vit dans `src/data/plans.ts` : cet écran ne fait que l'afficher.
 */
export default function GiftScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getBook } = useCatalog();
  const { freeBooks, freeBookAvailable, claimFreeBook } = useLibrary();

  const picks = FREE_PICKS.map((slug) => getBook(slug)).filter((book) => book != null);
  const claimed = freeBooks.length > 0 ? getBook(freeBooks[0]) : null;

  const take = (slug: string, title: string) => {
    Alert.alert(
      "Prendre ce livre gratuitement ?",
      `« ${title} » sera à vous, définitivement et sans abonnement. C'est le seul livre offert : il ne pourra pas être échangé contre un autre ensuite.`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Le prendre",
          onPress: () => {
            claimFreeBook(slug);
            router.replace(`/lecture/${slug}`);
          },
        },
      ]
    );
  };

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
        <Text style={styles.topBarTitle}>Votre livre offert</Text>
        <View style={styles.topBarSide} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxxl }}
      >
        <View style={styles.intro}>
          <Text style={styles.title}>
            {freeBookAvailable ? "Un livre, offert" : "Votre livre offert"}
          </Text>
          <Text style={styles.lede}>
            {freeBookAvailable
              ? "Cinq livres, un seul à garder. Celui que vous choisirez sera à vous pour toujours, sans abonnement et sans rien payer — mais le choix ne se reprend pas."
              : "Vous avez fait votre choix. Ce livre reste à vous, abonnement ou pas."}
          </Text>
          <Divider width={30} style={{ marginTop: spacing.md }} />
        </View>

        {claimed && (
          <View style={styles.claimed}>
            <BookCover
              slug={claimed.slug}
              title={claimed.title}
              theme={claimed.theme}
              width={92}
              label={claimed.category}
            />
            <View style={styles.claimedBody}>
              <Text style={styles.claimedLabel}>Votre livre</Text>
              <Text style={styles.claimedTitle}>{claimed.title}</Text>
              <GoldButton
                label="L'ouvrir"
                icon="book"
                onPress={() => router.push(`/lecture/${claimed.slug}`)}
                style={styles.claimedCta}
              />
            </View>
          </View>
        )}

        {freeBookAvailable && (
          <View style={styles.list}>
            {picks.map((book) => (
              <View key={book.slug} style={styles.card}>
                <Pressable
                  onPress={() => router.push(`/livre/${book.slug}`)}
                  accessibilityRole="button"
                  accessibilityLabel={`Voir la fiche de ${book.title}`}
                  style={({ pressed }) => [styles.cardHead, pressed && { opacity: 0.85 }]}
                >
                  <BookCover
                    slug={book.slug}
                    title={book.title}
                    theme={book.theme}
                    width={84}
                    compact
                  />
                  <View style={styles.cardBody}>
                    <Text style={styles.cardCategory}>{book.category}</Text>
                    <Text style={styles.cardTitle}>{book.title}</Text>
                    <Text numberOfLines={4} style={styles.cardDescription}>
                      {book.description}
                    </Text>
                  </View>
                </Pressable>
                <Pressable
                  onPress={() => take(book.slug, book.title)}
                  accessibilityRole="button"
                  accessibilityLabel={`Choisir ${book.title} comme livre offert`}
                  style={({ pressed }) => [styles.cardCta, pressed && { opacity: 0.85 }]}
                >
                  <Ionicons name="gift-outline" size={16} color={colors.goldLight} />
                  <Text style={styles.cardCtaLabel}>Choisir celui-ci</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* Ce que l'offre n'est pas : dit ici plutôt que découvert au premier livre verrouillé. */}
        <View style={styles.after}>
          <Text style={styles.afterTitle}>Et les autres livres</Text>
          <Text style={styles.afterText}>
            {`Les autres livres du catalogue s'achètent ${BOOK_PRICE} l'unité, gardés eux aussi pour toujours, ou se lisent tous avec un abonnement à partir de ${PLANS.plus.price} par mois.`}
          </Text>
          <Pressable
            onPress={() => router.push("/abonnement")}
            accessibilityRole="button"
            style={({ pressed }) => [styles.afterLink, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="albums-outline" size={16} color={colors.gold} />
            <Text style={styles.afterLinkText}>Voir les formules</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.textFaint} />
          </Pressable>
        </View>
      </ScrollView>
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

  claimed: {
    flexDirection: "row",
    gap: spacing.lg,
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  claimedBody: { flex: 1, justifyContent: "center", gap: spacing.xs },
  claimedLabel: { ...type.label },
  claimedTitle: { ...type.h3 },
  claimedCta: { alignSelf: "flex-start", marginTop: spacing.sm },

  list: { marginTop: spacing.xl, paddingHorizontal: spacing.xl, gap: spacing.lg },
  card: {
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.lineSoft,
    overflow: "hidden",
  },
  cardHead: { flexDirection: "row", gap: spacing.lg, padding: spacing.lg },
  cardBody: { flex: 1, gap: 4 },
  cardCategory: { ...type.label, fontSize: 10 },
  cardTitle: { fontFamily: fonts.display, fontSize: 18, lineHeight: 24, color: colors.text },
  cardDescription: { ...type.caption, lineHeight: 17 },
  cardCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    height: 46,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    backgroundColor: colors.goldGlow,
  },
  cardCtaLabel: { fontFamily: fonts.body, fontSize: 14, fontWeight: "700", color: colors.goldLight },

  after: { paddingHorizontal: spacing.xl, marginTop: spacing.xxl, gap: spacing.sm },
  afterTitle: { ...type.h3 },
  afterText: { ...type.bodyMuted, lineHeight: 22 },
  afterLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
  },
  afterLinkText: { flex: 1, ...type.body, color: colors.gold },
});
