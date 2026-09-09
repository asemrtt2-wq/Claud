import { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, gradients, radius, spacing, type, fillObject } from "@/theme";
import { LatticePattern, StarMotif } from "@/components/Ornament";
import { CircleButton, EmptyState, GoldButton, ProgressBar, SectionHeader, Tag } from "@/components/ui";
import BookCover from "@/components/BookCover";
import { BOOKS } from "@/data/books";
import { getCover } from "@/data/covers";
import { useLibrary } from "@/store/library";
import type { Book } from "@/data/types";

const TABS = ["Pour vous", "Nouveautés", "Populaires"] as const;

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { progress } = useLibrary();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Pour vous");
  const [slide, setSlide] = useState(0);
  const heroRef = useRef<ScrollView>(null);

  const heroWidth = width - spacing.lg * 2;

  const shown = useMemo(() => {
    if (tab === "Nouveautés") {
      return [...BOOKS].sort((a, b) => b.addedAt.localeCompare(a.addedAt));
    }
    if (tab === "Populaires") {
      // Sans statistiques d'usage réelles, « Populaires » suit l'ordre du catalogue plutôt
      // que d'afficher un classement inventé.
      return BOOKS;
    }
    return BOOKS;
  }, [tab]);

  /** Les livres commencés et pas encore finis, du plus récent au plus ancien. */
  const continueReading = useMemo(() => {
    return BOOKS.map((book) => ({ book, p: progress[book.slug] }))
      .filter((entry): entry is { book: Book; p: NonNullable<typeof entry.p> } =>
        Boolean(entry.p && !entry.p.finished)
      )
      .sort((a, b) => b.p.updatedAt.localeCompare(a.p.updatedAt));
  }, [progress]);

  function onHeroScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    setSlide(Math.round(e.nativeEvent.contentOffset.x / (heroWidth + spacing.md)));
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable
          onPress={() => router.replace("/")}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Écran d'accueil Lumia"
          style={styles.topBarSide}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.logo}>LUMIA</Text>
        <Pressable
          onPress={() => router.push("/(tabs)/explorer")}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Rechercher"
          style={[styles.topBarSide, styles.topBarRight]}
        >
          <Ionicons name="search-outline" size={22} color={colors.text} />
        </Pressable>
      </View>

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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xxxl }}
      >
        {shown.length === 0 ? (
          <EmptyState
            title="Le catalogue est vide"
            hint="Ajoute un livre dans src/data/books.ts pour le voir apparaître ici."
          />
        ) : (
          <>
            <ScrollView
              ref={heroRef}
              horizontal
              pagingEnabled
              snapToInterval={heroWidth + spacing.md}
              decelerationRate="fast"
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onHeroScroll}
              contentContainerStyle={styles.heroRow}
            >
              {shown.slice(0, 5).map((book) => (
                <HeroCard
                  key={book.slug}
                  book={book}
                  width={heroWidth}
                  onRead={() => router.push(`/lecture/${book.slug}`)}
                  onOpen={() => router.push(`/livre/${book.slug}`)}
                />
              ))}
            </ScrollView>

            {shown.length > 1 && (
              <View style={styles.dots}>
                {shown.slice(0, 5).map((book, i) => (
                  <View key={book.slug} style={[styles.dot, i === slide && styles.dotActive]} />
                ))}
              </View>
            )}
          </>
        )}

        <View style={styles.section}>
          <SectionHeader
            title="Reprendre la lecture"
            onSeeAll={
              continueReading.length > 0 ? () => router.push("/(tabs)/bibliotheque") : undefined
            }
          />
          {continueReading.length === 0 ? (
            <EmptyState
              icon="bookmark-outline"
              title="Aucune lecture en cours"
              hint="Ouvre un livre : Lumia retiendra la page où tu t'es arrêté."
            />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.rowContent}
            >
              {continueReading.map(({ book, p }) => {
                const percent = (p.chapter + p.offset) / book.chapters.length;
                return (
                  <Pressable
                    key={book.slug}
                    onPress={() => router.push(`/lecture/${book.slug}`)}
                    style={styles.continueCard}
                  >
                    <BookCover
                      slug={book.slug}
                      title={book.title}
                      theme={book.theme}
                      width={104}
                      compact
                      label={book.series ? `Tome ${book.series.volume}` : null}
                    />
                    <View style={styles.continueFooter}>
                      <ProgressBar value={percent} />
                      <Text style={styles.continuePercent}>{Math.round(percent * 100)} %</Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

/** La grande carte du carrousel : « SALADIN » sur la maquette. */
function HeroCard({
  book,
  width,
  onRead,
  onOpen,
}: {
  book: Book;
  width: number;
  onRead: () => void;
  onOpen: () => void;
}) {
  const artwork = getCover(book.slug);
  return (
    <Pressable onPress={onOpen} style={[styles.hero, { width }]}>
      <LinearGradient colors={gradients.night} style={StyleSheet.absoluteFill} />
      <LatticePattern rows={6} columns={4} opacity={0.08} />
      {!artwork && (
        <View style={styles.heroMotif}>
          <StarMotif size={width * 0.55} opacity={0.12} />
        </View>
      )}
      <LinearGradient colors={gradients.scrim} style={StyleSheet.absoluteFill} />

      <View style={styles.heroContent}>
        <View style={styles.heroBody}>
          <Text numberOfLines={3} style={styles.heroTitle}>
            {book.title.toUpperCase()}
          </Text>
          <Text numberOfLines={3} style={styles.heroSubtitle}>
            {book.subtitle}
          </Text>
          <View style={styles.heroTags}>
            {book.tags.slice(0, 2).map((t) => (
              <Tag key={t} label={t} />
            ))}
          </View>
          <View style={styles.heroActions}>
            <GoldButton label="Lire maintenant" icon="play" onPress={onRead} />
            <CircleButton icon="add" onPress={onOpen} label="Voir la fiche du livre" />
          </View>
        </View>
        {/* La couverture entière, jamais rognée : c'est elle qu'on vient regarder. Le titre
            reste écrit à côté, pour rester lisible quelle que soit l'image. */}
        {artwork ? (
          <Image
            source={artwork}
            resizeMode="contain"
            style={styles.heroArt}
            accessible
            accessibilityRole="image"
            accessibilityLabel={`Couverture de ${book.title}`}
          />
        ) : null}
      </View>
    </Pressable>
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
  topBarSide: { width: 40 },
  topBarRight: { alignItems: "flex-end" },
  logo: { ...type.logo, fontSize: 18, letterSpacing: 6, flex: 1, textAlign: "center" },
  tabs: { flexDirection: "row", gap: spacing.xl, paddingHorizontal: spacing.lg },
  tab: { paddingBottom: spacing.sm },
  tabLabel: { fontFamily: fonts.body, fontSize: 14, color: colors.textFaint },
  tabLabelActive: { color: colors.goldLight, fontWeight: "600" },
  tabUnderline: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 2,
    borderRadius: 2,
    backgroundColor: colors.gold,
  },
  heroRow: { paddingHorizontal: spacing.lg, gap: spacing.md, paddingTop: spacing.md },
  hero: {
    height: 320,
    borderRadius: radius.lg,
    overflow: "hidden",
    justifyContent: "flex-end",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  heroMotif: { ...fillObject, alignItems: "center", justifyContent: "center" },
  heroContent: { flex: 1, flexDirection: "row", alignItems: "flex-end" },
  heroBody: { flex: 1, padding: spacing.lg, gap: spacing.sm },
  heroArt: {
    width: 150,
    height: "100%",
    marginRight: spacing.lg,
    marginVertical: spacing.lg,
    borderRadius: radius.md,
  },
  heroTitle: { fontFamily: fonts.display, fontSize: 26, letterSpacing: 1.5, color: colors.text },
  heroSubtitle: {
    fontFamily: fonts.display,
    fontSize: 14,
    letterSpacing: 1,
    color: colors.textMuted,
  },
  heroTags: { flexDirection: "row", gap: spacing.xs, flexWrap: "wrap", marginTop: spacing.xs },
  heroActions: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginTop: spacing.sm },
  dots: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: spacing.md },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.22)" },
  dotActive: { backgroundColor: colors.gold, width: 16 },
  section: { paddingHorizontal: spacing.lg, marginTop: spacing.xl },
  rowContent: { gap: spacing.md, paddingRight: spacing.lg },
  continueCard: { width: 104, gap: spacing.sm },
  continueFooter: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  continuePercent: { ...type.caption, fontSize: 10, color: colors.textMuted },
});
