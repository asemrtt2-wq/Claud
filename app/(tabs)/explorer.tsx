import { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, radius, spacing, type } from "@/theme";
import { EmptyState, SectionHeader } from "@/components/ui";
import BookCover from "@/components/BookCover";
import { BOOKS } from "@/data/books";
import { CATEGORIES, CATEGORY_ICONS, type Book, type Category } from "@/data/types";

/** L'écran « Explorer » : recherche, grille de catégories, Nouveautés, Les plus populaires. */
export default function ExplorerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BOOKS.filter((book) => {
      if (category && book.category !== category) return false;
      if (!q) return true;
      return (
        book.title.toLowerCase().includes(q) ||
        book.subtitle.toLowerCase().includes(q) ||
        book.category.toLowerCase().includes(q) ||
        book.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [query, category]);

  const searching = query.trim().length > 0 || category !== null;

  const newest = useMemo(
    () => [...BOOKS].sort((a, b) => b.addedAt.localeCompare(a.addedAt)).slice(0, 8),
    []
  );

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: insets.top + spacing.md,
          paddingBottom: spacing.xxxl,
        }}
      >
        <Text style={styles.pageTitle}>Explorer</Text>

        <View style={styles.searchWrap}>
          <Ionicons name="search" size={16} color={colors.textFaint} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Rechercher un livre, un thème, un auteur..."
            placeholderTextColor={colors.textFaint}
            style={styles.searchInput}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={10}>
              <Ionicons name="close-circle" size={16} color={colors.textFaint} />
            </Pressable>
          )}
        </View>

        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => {
            const active = category === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => setCategory(active ? null : cat)}
                style={[styles.categoryTile, active && styles.categoryTileActive]}
              >
                <View style={[styles.categoryBadge, active && styles.categoryBadgeActive]}>
                  <Ionicons
                    name={CATEGORY_ICONS[cat] as never}
                    size={20}
                    color={active ? "#231B0C" : colors.gold}
                  />
                </View>
                <Text numberOfLines={2} style={styles.categoryLabel}>
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {searching ? (
          <View style={styles.section}>
            <SectionHeader
              title={`${results.length} résultat${results.length > 1 ? "s" : ""}`}
              onSeeAll={
                category
                  ? () => {
                      setCategory(null);
                      setQuery("");
                    }
                  : undefined
              }
            />
            {results.length === 0 ? (
              <EmptyState
                icon="search-outline"
                title="Aucun livre ne correspond"
                hint="Essaie un autre mot, ou retire le filtre de catégorie."
              />
            ) : (
              <View style={styles.grid}>
                {results.map((book) => (
                  <GridCard
                    key={book.slug}
                    book={book}
                    onPress={() => router.push(`/livre/${book.slug}`)}
                  />
                ))}
              </View>
            )}
          </View>
        ) : (
          <>
            <Row
              title="Nouveautés"
              books={newest}
              onOpen={(slug) => router.push(`/livre/${slug}`)}
            />
            <Row
              title="Les plus populaires"
              books={BOOKS}
              onOpen={(slug) => router.push(`/livre/${slug}`)}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

function Row({
  title,
  books,
  onOpen,
}: {
  title: string;
  books: Book[];
  onOpen: (slug: string) => void;
}) {
  if (books.length === 0) return null;
  return (
    <View style={styles.section}>
      <SectionHeader title={title} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rowContent}
      >
        {books.map((book) => (
          <Pressable key={book.slug} onPress={() => onOpen(book.slug)} style={styles.rowCard}>
            <BookCover
              title={book.title}
              theme={book.theme}
              width={118}
              label={book.series ? `Tome ${book.series.volume}` : null}
            />
            <Text numberOfLines={2} style={styles.rowTitle}>
              {book.title}
            </Text>
            <Text numberOfLines={1} style={styles.rowMeta}>
              {book.category}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function GridCard({ book, onPress }: { book: Book; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.gridCard}>
      <BookCover title={book.title} theme={book.theme} width={104} />
      <Text numberOfLines={2} style={styles.rowTitle}>
        {book.title}
      </Text>
      <Text numberOfLines={1} style={styles.rowMeta}>
        {book.category}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.night },
  pageTitle: { ...type.h1, paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  searchWrap: {
    marginHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    height: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.lineSoft,
  },
  searchInput: { flex: 1, fontFamily: fonts.body, fontSize: 14, color: colors.text, padding: 0 },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    rowGap: spacing.lg,
  },
  categoryTile: { width: "33.33%", alignItems: "center", gap: spacing.sm, paddingHorizontal: 4 },
  categoryTileActive: { opacity: 1 },
  categoryBadge: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  categoryBadgeActive: { backgroundColor: colors.gold, borderColor: colors.goldLight },
  categoryLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 15,
  },
  section: { marginTop: spacing.xl, paddingHorizontal: spacing.lg },
  rowContent: { gap: spacing.md, paddingRight: spacing.lg },
  rowCard: { width: 118, gap: 6 },
  rowTitle: { fontFamily: fonts.display, fontSize: 13, color: colors.text, lineHeight: 17 },
  rowMeta: { ...type.caption },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  gridCard: { width: 104, gap: 6 },
});
