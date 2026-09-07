import { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, radius, spacing, type } from "@/theme";
import { Divider } from "@/components/Ornament";
import { EmptyState, GoldButton, ProgressBar } from "@/components/ui";
import { getBook } from "@/data/books";
import { useLibrary } from "@/store/library";

/** Les trois tailles de texte proposées par le bouton « Aa » de la maquette. */
const TEXT_SIZES = [16, 18, 21] as const;
const THEMES = {
  nuit: { bg: colors.night, paper: colors.surface, text: colors.text, muted: colors.textMuted },
  sepia: { bg: "#1A1610", paper: "#241E15", text: "#EFE3CE", muted: "#B0A48C" },
  clair: { bg: "#F5F1E8", paper: "#FFFFFF", text: "#1B1A17", muted: "#6B675E" },
} as const;
type ReaderTheme = keyof typeof THEMES;

/** Le lecteur : un chapitre par écran, la progression enregistrée en continu. */
export default function ReaderScreen() {
  const { slug, chapter: chapterParam } = useLocalSearchParams<{
    slug: string;
    chapter?: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { saveProgress, progress, addMinutes } = useLibrary();

  const book = getBook(String(slug));
  const saved = book ? progress[book.slug] : undefined;

  const [chapter, setChapter] = useState(() => {
    const fromParam = chapterParam ? Number(chapterParam) : NaN;
    if (Number.isFinite(fromParam)) return fromParam;
    return saved?.chapter ?? 0;
  });
  const [sizeIndex, setSizeIndex] = useState(1);
  const [theme, setTheme] = useState<ReaderTheme>("nuit");
  const [menuOpen, setMenuOpen] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const [offset, setOffset] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const palette = THEMES[theme];
  const total = book?.chapters.length ?? 0;

  /* Le temps de lecture s'incrémente d'une minute toutes les soixante secondes passées
     dans le lecteur — mesuré, pas estimé. */
  useEffect(() => {
    const id = setInterval(() => addMinutes(1), 60_000);
    return () => clearInterval(id);
  }, [addMinutes]);

  // Chaque changement de chapitre ou de position est enregistré : rouvrir le livre reprend ici.
  useEffect(() => {
    if (!book) return;
    saveProgress(book.slug, chapter, offset, chapter >= total - 1 && offset > 0.98);
  }, [book, chapter, offset, total, saveProgress]);

  const blocks = useMemo(() => {
    if (!book) return [];
    return book.chapters[chapter]?.body.split(/\n\n+/).filter(Boolean) ?? [];
  }, [book, chapter]);

  if (!book) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + spacing.xxl }]}>
        <EmptyState title="Ce livre n'existe pas" />
        <GoldButton label="Retour" onPress={() => router.back()} style={styles.centerCta} />
      </View>
    );
  }

  function goTo(next: number) {
    if (next < 0 || next >= total) return;
    setChapter(next);
    setOffset(0);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }

  function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const scrollable = Math.max(1, contentSize.height - layoutMeasurement.height);
    setOffset(Math.min(1, Math.max(0, contentOffset.y / scrollable)));
  }

  const current = book.chapters[chapter];

  return (
    <View style={[styles.screen, { backgroundColor: palette.bg }]}>
      {/* L'ambiance « Clair » a un fond blanc : l'heure et la batterie doivent repasser en
          noir, sans quoi la barre d'état devient illisible. */}
      <StatusBar style={theme === "clair" ? "dark" : "light"} />
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Fermer le livre"
          style={styles.topBarSide}
        >
          <Ionicons name="arrow-back" size={22} color={palette.text} />
        </Pressable>
        <Text style={[styles.topBarTitle, { color: palette.muted }]}>Lecture</Text>
        <View style={[styles.topBarSide, styles.topBarActions]}>
          <Pressable
            onPress={() => setMenuOpen(true)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Réglages d'affichage"
          >
            <Text style={[styles.aa, { color: palette.text }]}>Aa</Text>
          </Pressable>
          <Pressable
            onPress={() => setTocOpen(true)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Sommaire"
          >
            <Ionicons name="ellipsis-vertical" size={19} color={palette.text} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        onScroll={onScroll}
        scrollEventThrottle={64}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.page}
      >
        <Text style={[styles.chapterLabel, { color: palette.muted }]}>
          {`Chapitre ${chapter + 1}`}
        </Text>
        <Text style={[styles.chapterTitle, { color: palette.text }]}>{current.title}</Text>
        <Divider width={34} style={{ marginTop: spacing.lg, marginBottom: spacing.xl }} />

        {blocks.map((block, i) => {
          if (block.startsWith("> ")) {
            return (
              <View key={i} style={[styles.quote, { backgroundColor: palette.paper }]}>
                <Text
                  style={[
                    styles.quoteText,
                    { color: palette.text, fontSize: TEXT_SIZES[sizeIndex] },
                  ]}
                >
                  {`« ${block.replace(/^>\s?/, "")} »`}
                </Text>
              </View>
            );
          }
          const lines = block.split("\n").filter(Boolean);
          if (lines.length > 0 && lines.every((l) => l.trimStart().startsWith("- "))) {
            return (
              <View key={i} style={styles.list}>
                {lines.map((line, j) => (
                  <View key={j} style={styles.listItem}>
                    <View style={[styles.bullet, { backgroundColor: colors.gold }]} />
                    <Text
                      style={[
                        styles.paragraph,
                        { color: palette.text, fontSize: TEXT_SIZES[sizeIndex], flex: 1 },
                      ]}
                    >
                      {line.trimStart().replace(/^-\s?/, "")}
                    </Text>
                  </View>
                ))}
              </View>
            );
          }
          return (
            <Text
              key={i}
              style={[styles.paragraph, { color: palette.text, fontSize: TEXT_SIZES[sizeIndex] }]}
            >
              {block}
            </Text>
          );
        })}

        {chapter === total - 1 && (
          <View style={[styles.end, { backgroundColor: palette.paper }]}>
            <Text style={[styles.endTitle, { color: palette.text }]}>Fin du livre</Text>
            <Text style={[styles.endHint, { color: palette.muted }]}>
              {`Tu as terminé « ${book.title} ».`}
            </Text>
            <GoldButton
              label="Retour à la bibliothèque"
              onPress={() => router.replace("/(tabs)/bibliotheque")}
              style={{ marginTop: spacing.lg }}
            />
          </View>
        )}
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.sm }]}>
        <ProgressBar value={(chapter + offset) / total} />
        <View style={styles.bottomRow}>
          <Pressable
            onPress={() => goTo(chapter - 1)}
            hitSlop={16}
            disabled={chapter === 0}
            accessibilityRole="button"
            accessibilityLabel="Chapitre précédent"
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={chapter === 0 ? colors.textFaint : palette.text}
            />
          </Pressable>
          <Text style={[styles.pageCount, { color: palette.muted }]}>
            {`${chapter + 1} / ${total}`}
          </Text>
          <Pressable
            onPress={() => goTo(chapter + 1)}
            hitSlop={16}
            disabled={chapter === total - 1}
            accessibilityRole="button"
            accessibilityLabel="Chapitre suivant"
          >
            <Ionicons
              name="chevron-forward"
              size={22}
              color={chapter === total - 1 ? colors.textFaint : palette.text}
            />
          </Pressable>
        </View>
      </View>

      {/* Réglages d'affichage — feuille du bas, comme sur un lecteur natif. */}
      <Sheet visible={menuOpen} onClose={() => setMenuOpen(false)} title="Affichage">
        <Text style={styles.sheetLabel}>Taille du texte</Text>
        <View style={styles.sheetRow}>
          {TEXT_SIZES.map((size, i) => (
            <Pressable
              key={size}
              onPress={() => setSizeIndex(i)}
              style={[styles.chip, sizeIndex === i && styles.chipActive]}
            >
              <Text style={[styles.chipText, { fontSize: 12 + i * 2 }]}>Aa</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.sheetLabel}>Ambiance</Text>
        <View style={styles.sheetRow}>
          {(Object.keys(THEMES) as ReaderTheme[]).map((key) => (
            <Pressable
              key={key}
              onPress={() => setTheme(key)}
              style={[styles.chip, theme === key && styles.chipActive]}
            >
              <Text style={styles.chipText}>
                {key === "nuit" ? "Nuit" : key === "sepia" ? "Sépia" : "Clair"}
              </Text>
            </Pressable>
          ))}
        </View>
      </Sheet>

      {/* Sommaire */}
      <Sheet visible={tocOpen} onClose={() => setTocOpen(false)} title="Sommaire">
        <ScrollView style={styles.toc}>
          {book.chapters.map((c, i) => (
            <Pressable
              key={c.title}
              onPress={() => {
                goTo(i);
                setTocOpen(false);
              }}
              style={styles.tocRow}
            >
              <Text style={styles.tocNumber}>{String(i + 1).padStart(2, "0")}</Text>
              <Text
                numberOfLines={2}
                style={[styles.tocTitle, i === chapter && styles.tocTitleActive]}
              >
                {c.title}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </Sheet>
    </View>
  );
}

function Sheet({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.grabber} />
        <Text style={styles.sheetTitle}>{title}</Text>
        {children}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  centerCta: { alignSelf: "center", marginTop: spacing.lg },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  topBarSide: { width: 60 },
  topBarActions: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: spacing.lg },
  topBarTitle: { flex: 1, textAlign: "center", fontFamily: fonts.body, fontSize: 13 },
  aa: { fontFamily: fonts.display, fontSize: 17 },
  page: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xxxl },
  chapterLabel: { ...type.label, fontSize: 10 },
  chapterTitle: { fontFamily: fonts.display, fontSize: 27, lineHeight: 35, marginTop: spacing.sm },
  paragraph: {
    fontFamily: fonts.reading,
    lineHeight: 30,
    marginBottom: spacing.lg,
    textAlign: "left",
  },
  quote: {
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderLeftWidth: 2,
    borderLeftColor: colors.gold,
  },
  quoteText: { fontFamily: fonts.display, lineHeight: 28, fontStyle: "italic" },
  list: { marginBottom: spacing.lg, gap: spacing.sm },
  listItem: { flexDirection: "row", gap: spacing.md, alignItems: "flex-start" },
  bullet: { width: 5, height: 5, borderRadius: 3, marginTop: 12 },
  end: { marginTop: spacing.xl, padding: spacing.xl, borderRadius: radius.lg, alignItems: "center" },
  endTitle: { fontFamily: fonts.display, fontSize: 20 },
  endHint: { ...type.caption, marginTop: 6, textAlign: "center" },
  bottomBar: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    gap: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.lineSoft,
  },
  bottomRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  pageCount: { fontFamily: fonts.body, fontSize: 12 },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    gap: spacing.md,
    maxHeight: "70%",
  },
  grabber: {
    alignSelf: "center",
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.lineSoft,
    marginBottom: spacing.sm,
  },
  sheetTitle: { ...type.h3, marginBottom: spacing.xs },
  sheetLabel: { ...type.label, marginTop: spacing.sm },
  sheetRow: { flexDirection: "row", gap: spacing.sm },
  chip: {
    flex: 1,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceRaised,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.lineSoft,
  },
  chipActive: { borderColor: colors.gold, backgroundColor: colors.goldGlow },
  chipText: { fontFamily: fonts.body, fontSize: 13, color: colors.text },
  toc: { maxHeight: 380 },
  tocRow: { flexDirection: "row", gap: spacing.lg, paddingVertical: spacing.md, alignItems: "center" },
  tocNumber: { fontFamily: fonts.display, fontSize: 14, color: colors.goldDeep, width: 24 },
  tocTitle: { flex: 1, fontFamily: fonts.display, fontSize: 15, color: colors.textMuted, lineHeight: 20 },
  tocTitleActive: { color: colors.goldLight },
});
