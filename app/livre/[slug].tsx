import { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, radius, spacing, type } from "@/theme";
import { CircleButton, EmptyState, GoldButton, ProgressBar, SectionHeader, Tag } from "@/components/ui";
import BookCover from "@/components/BookCover";
import { estimateMinutes, estimatePages } from "@/data/books";
import { useCatalog } from "@/store/catalog";
import { useLibrary } from "@/store/library";
import { BOOK_PRICE, PLANS } from "@/data/plans";

const TABS = ["À propos", "Chapitres", "Avis"] as const;

/** La « Fiche livre » de la maquette. */
export default function BookScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { progress, isFavorite, toggleFavorite, canRead, freeBookAvailable, claimFreeBook, purchaseBook } =
    useLibrary();
  const { books, getBook } = useCatalog();
  const [tab, setTab] = useState<(typeof TABS)[number]>("À propos");

  const book = getBook(String(slug));

  const similar = useMemo(() => {
    if (!book) return [];
    return books.filter(
      (b) => b.slug !== book.slug && (b.category === book.category || b.tags.some((t) => book.tags.includes(t)))
    ).slice(0, 6);
  }, [book, books]);

  if (!book) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + spacing.xxl }]}>
        <EmptyState title="Ce livre n'existe pas" hint="Il a peut-être été retiré du catalogue." />
        <GoldButton label="Retour" onPress={() => router.back()} style={styles.notFoundCta} />
      </View>
    );
  }

  const p = progress[book.slug];
  const percent = p ? (p.chapter + p.offset) / book.chapters.length : 0;
  const favorite = isFavorite(book.slug);
  // Le catalogue est payant : un livre s'ouvre avec un abonnement, avec le livre offert,
  // ou après achat à l'unité.
  const locked = !canRead(book.slug);

  /* Le livre offert ne se rend pas : le dire avant, pas après. Un cadeau dont on découvre
     la limite une fois qu'il est consommé est exactement ce que la charte appelle une
     pratique trompeuse. */
  const offerFreeBook = () => {
    Alert.alert(
      "Prendre ce livre gratuitement ?",
      `« ${book.title} » sera à toi, définitivement et sans abonnement. C'est le seul livre offert : tu ne pourras pas l'échanger contre un autre ensuite.`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Le prendre",
          onPress: () => {
            claimFreeBook(book.slug);
            router.push(`/lecture/${book.slug}`);
          },
        },
      ]
    );
  };

  const offerPurchase = () => {
    Alert.alert(
      `Acheter ce livre — ${BOOK_PRICE}`,
      "Le paiement n'est pas encore en place : rien ne sera débité. Cette action débloque le livre sur cet appareil, pour essayer.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Débloquer",
          onPress: () => {
            purchaseBook(book.slug);
            router.push(`/lecture/${book.slug}`);
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
        <Text style={styles.topBarTitle}>Fiche livre</Text>
        <Pressable
          onPress={() => toggleFavorite(book.slug)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          style={[styles.topBarSide, styles.topBarRight]}
        >
          <Ionicons
            name={favorite ? "heart" : "heart-outline"}
            size={22}
            color={favorite ? colors.gold : colors.text}
          />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxxl }}
      >
        <View style={styles.header}>
          <BookCover
            slug={book.slug}
            title={book.title}
            theme={book.theme}
            width={132}
            label={book.series ? `Tome ${book.series.volume}` : book.category}
          />
          <View style={styles.headerBody}>
            <Text style={styles.title}>{book.title}</Text>
            <Text numberOfLines={4} style={styles.subtitle}>
              {book.subtitle}
            </Text>
            <View style={styles.tags}>
              {book.tags.map((t) => (
                <Tag key={t} label={t} />
              ))}
            </View>
          </View>
        </View>

        {p && !p.finished && (
          <View style={styles.resume}>
            <ProgressBar value={percent} />
            <Text style={styles.resumeText}>
              {`Chapitre ${p.chapter + 1} sur ${book.chapters.length} · ${Math.round(percent * 100)} %`}
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          <GoldButton
            label={
              !locked
                ? p
                  ? "Reprendre"
                  : "Lire"
                : freeBookAvailable
                  ? "Lire gratuitement"
                  : `Acheter — ${BOOK_PRICE}`
            }
            icon={!locked ? "book" : freeBookAvailable ? "gift" : "lock-open"}
            onPress={() =>
              !locked
                ? router.push(`/lecture/${book.slug}`)
                : freeBookAvailable
                  ? offerFreeBook()
                  : offerPurchase()
            }
            style={styles.readButton}
          />
          <CircleButton
            icon={favorite ? "heart" : "add"}
            active={favorite}
            onPress={() => toggleFavorite(book.slug)}
            label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          />
        </View>

        {/* Les autres façons d'accéder au livre, énoncées d'un bloc plutôt que dispersées :
            le lecteur voit d'un coup ce que chaque option coûte. */}
        {locked && (
          <View style={styles.access}>
            {freeBookAvailable ? (
              <Text style={styles.accessLine}>
                {`C'est ton livre offert. Sinon, ce livre seul coûte ${BOOK_PRICE}, et tout le catalogue ${PLANS.plus.price} par mois.`}
              </Text>
            ) : (
              <Text style={styles.accessLine}>
                {`Tu as déjà pris ton livre offert. Ce livre seul coûte ${BOOK_PRICE}, et il reste à toi.`}
              </Text>
            )}
            <Pressable
              onPress={() => router.push("/abonnement")}
              accessibilityRole="button"
              style={({ pressed }) => [styles.accessLink, pressed && { opacity: 0.7 }]}
            >
              <Ionicons name="albums-outline" size={16} color={colors.gold} />
              <Text style={styles.accessLinkText}>
                {`Tout le catalogue à partir de ${PLANS.plus.price} par mois`}
              </Text>
              <Ionicons name="chevron-forward" size={14} color={colors.textFaint} />
            </Pressable>
          </View>
        )}

        <View style={styles.tabs}>
          {TABS.map((label) => {
            const active = tab === label;
            return (
              <Pressable key={label} onPress={() => setTab(label)} style={styles.tab}>
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
                {active && <View style={styles.tabUnderline} />}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.panel}>
          {tab === "À propos" && (
            <>
              <Text style={styles.description}>{book.description}</Text>
              <View style={styles.meta}>
                <Meta icon="document-text-outline" label={`${estimatePages(book)} pages`} />
                <Meta icon="time-outline" label={`${estimateMinutes(book)} min`} />
                <Meta icon="layers-outline" label={`${book.chapters.length} chapitres`} />
              </View>
            </>
          )}

          {tab === "Chapitres" && (
            <View style={styles.chapters}>
              {book.chapters.map((chapter, i) => (
                <Pressable
                  key={chapter.title}
                  onPress={() =>
                    locked
                      ? freeBookAvailable
                        ? offerFreeBook()
                        : offerPurchase()
                      : router.push(`/lecture/${book.slug}?chapter=${i}`)
                  }
                  style={({ pressed }) => [styles.chapterRow, pressed && styles.chapterRowPressed]}
                >
                  <Text style={styles.chapterNumber}>{String(i + 1).padStart(2, "0")}</Text>
                  <Text numberOfLines={2} style={styles.chapterTitle}>
                    {chapter.title}
                  </Text>
                  {p && p.chapter > i && (
                    <Ionicons name="checkmark" size={16} color={colors.gold} />
                  )}
                </Pressable>
              ))}
            </View>
          )}

          {tab === "Avis" && (
            <EmptyState
              icon="chatbubble-outline"
              title="Pas encore d'avis"
              hint="Les avis des lecteurs demanderont un compte et un serveur : ils ne sont pas encore actifs, plutôt que d'afficher des notes inventées."
            />
          )}
        </View>

        {similar.length > 0 && (
          <View style={styles.similar}>
            <SectionHeader title="Livres similaires" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.similarRow}
            >
              {similar.map((other) => (
                <Pressable
                  key={other.slug}
                  onPress={() => router.replace(`/livre/${other.slug}`)}
                  style={styles.similarCard}
                >
                  <BookCover
                    slug={other.slug}
                    title={other.title}
                    theme={other.theme}
                    width={104}
                    compact
                  />
                  <Text numberOfLines={2} style={styles.similarTitle}>
                    {other.title}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function Meta({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon} size={15} color={colors.textMuted} />
      <Text style={styles.metaLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.night },
  notFoundCta: { alignSelf: "center", marginTop: spacing.lg },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  topBarSide: { width: 40 },
  topBarRight: { alignItems: "flex-end" },
  topBarTitle: { flex: 1, textAlign: "center", fontFamily: fonts.body, fontSize: 14, color: colors.text },
  header: { flexDirection: "row", gap: spacing.lg, paddingHorizontal: spacing.lg, marginTop: spacing.md },
  headerBody: { flex: 1, gap: spacing.sm },
  title: { ...type.h2 },
  subtitle: { ...type.bodyMuted },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginTop: spacing.xs },
  resume: { paddingHorizontal: spacing.lg, marginTop: spacing.lg, gap: 6 },
  resumeText: { ...type.caption, color: colors.gold },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  readButton: { flex: 1 },
  tabs: {
    flexDirection: "row",
    gap: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.lineSoft,
  },
  tab: { paddingBottom: spacing.md },
  tabLabel: { fontFamily: fonts.body, fontSize: 14, color: colors.textFaint },
  tabLabelActive: { color: colors.goldLight, fontWeight: "600" },
  tabUnderline: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -StyleSheet.hairlineWidth,
    height: 2,
    borderRadius: 2,
    backgroundColor: colors.gold,
  },
  panel: { paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  description: { ...type.body, color: colors.textMuted, lineHeight: 24 },
  access: { paddingHorizontal: spacing.xl, marginTop: spacing.md, gap: spacing.sm },
  accessLine: { ...type.caption, lineHeight: 19 },
  accessLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  accessLinkText: { flex: 1, fontFamily: fonts.body, fontSize: 13, color: colors.goldLight },
  meta: { flexDirection: "row", gap: spacing.xl, marginTop: spacing.lg, flexWrap: "wrap" },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaLabel: { ...type.caption, color: colors.textMuted },
  chapters: { gap: 2 },
  chapterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  chapterRowPressed: { backgroundColor: colors.surface },
  chapterNumber: { fontFamily: fonts.display, fontSize: 15, color: colors.goldDeep, width: 24 },
  chapterTitle: { flex: 1, fontFamily: fonts.display, fontSize: 15, color: colors.text, lineHeight: 20 },
  similar: { marginTop: spacing.xxl, paddingHorizontal: spacing.lg },
  similarRow: { gap: spacing.md, paddingRight: spacing.lg },
  similarCard: { width: 104, gap: 6 },
  similarTitle: { fontFamily: fonts.display, fontSize: 12, color: colors.text, lineHeight: 16 },
});
