import { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, radius, spacing, type } from "@/theme";
import { EmptyState, ProgressBar } from "@/components/ui";
import BookCover from "@/components/BookCover";
import { BOOKS, getBook } from "@/data/books";
import { useLibrary } from "@/store/library";
import type { Book } from "@/data/types";

const FILTERS = ["En cours", "Favoris", "Terminés", "Tout"] as const;
type Filter = (typeof FILTERS)[number];

/** « Bibliothèque » : ce que le lecteur a commencé, aimé ou terminé. */
export default function LibraryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { progress, favorites } = useLibrary();
  const [filter, setFilter] = useState<Filter>("En cours");

  const books = useMemo(() => {
    if (filter === "Tout") return BOOKS;
    if (filter === "Favoris") {
      return favorites.map((slug) => getBook(slug)).filter((b): b is Book => Boolean(b));
    }
    const wantFinished = filter === "Terminés";
    return BOOKS.filter((book) => {
      const p = progress[book.slug];
      return p ? p.finished === wantFinished : false;
    });
  }, [filter, progress, favorites]);

  const emptyHint: Record<Filter, string> = {
    "En cours": "Ouvre un livre depuis l'accueil : il apparaîtra ici avec ta progression.",
    Favoris: "Touche le cœur sur la fiche d'un livre pour le retrouver ici.",
    Terminés: "Les livres que tu auras lus jusqu'au bout se rangeront ici.",
    Tout: "Ajoute un livre dans src/data/books.ts pour remplir le catalogue.",
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + spacing.md,
          paddingBottom: spacing.xxxl,
        }}
      >
        <Text style={styles.pageTitle}>Bibliothèque</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                style={[styles.filter, active && styles.filterActive]}
              >
                <Text style={[styles.filterLabel, active && styles.filterLabelActive]}>{f}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {books.length === 0 ? (
          <EmptyState icon="library-outline" title="Rien ici pour l'instant" hint={emptyHint[filter]} />
        ) : (
          <View style={styles.list}>
            {books.map((book) => {
              const p = progress[book.slug];
              const percent = p ? (p.chapter + p.offset) / book.chapters.length : 0;
              return (
                <Pressable
                  key={book.slug}
                  onPress={() => router.push(`/livre/${book.slug}`)}
                  style={styles.item}
                >
                  <BookCover
                    slug={book.slug}
                    title={book.title}
                    theme={book.theme}
                    width={64}
                    compact
                    label={null}
                  />
                  <View style={styles.itemBody}>
                    <Text numberOfLines={2} style={styles.itemTitle}>
                      {book.title}
                    </Text>
                    <Text numberOfLines={1} style={styles.itemMeta}>
                      {book.category}
                      {book.series ? ` · Tome ${book.series.volume}` : ""}
                    </Text>
                    {p && (
                      <View style={styles.itemProgress}>
                        <ProgressBar value={percent} />
                        <Text style={styles.itemPercent}>
                          {p.finished ? "Terminé" : `${Math.round(percent * 100)} %`}
                        </Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.night },
  pageTitle: { ...type.h1, paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  filters: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  filter: {
    paddingHorizontal: spacing.lg,
    height: 34,
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.lineSoft,
  },
  filterActive: { backgroundColor: colors.goldGlow, borderColor: colors.gold },
  filterLabel: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted },
  filterLabelActive: { color: colors.goldLight, fontWeight: "600" },
  list: { paddingHorizontal: spacing.lg, marginTop: spacing.xl, gap: spacing.md },
  item: {
    flexDirection: "row",
    gap: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.lineSoft,
  },
  itemBody: { flex: 1, justifyContent: "center", gap: 4 },
  itemTitle: { fontFamily: fonts.display, fontSize: 16, color: colors.text, lineHeight: 21 },
  itemMeta: { ...type.caption },
  itemProgress: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: 4 },
  itemPercent: { ...type.caption, color: colors.gold, width: 54 },
});
