import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, radius, spacing, type } from "@/theme";
import { Divider } from "@/components/Ornament";
import { EmptyState, GoldButton } from "@/components/ui";
import { LOCALES, LOCALE_CODES, SOURCE_LOCALE } from "@/data/catalog";
import { LANGUAGES_PLAN, PLANS } from "@/data/plans";
import { useLibrary } from "@/store/library";

/**
 * Le choix de la langue de lecture, réservé à la formule qui le débloque.
 *
 * Une seule langue est proposée tant que le catalogue n'a pas été traduit : l'écran le dit
 * plutôt que d'afficher une liste de langues qui ne feraient rien. Les traductions se
 * produisent hors ligne (`npm run books:translate`) et sont embarquées dans l'app.
 */
export default function LanguageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { locale, setLocale, bilingual, setBilingual, canChangeLanguage } = useLibrary();

  const available = LOCALE_CODES.filter((code) => code !== SOURCE_LOCALE);

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
        <Text style={styles.topBarTitle}>Langue de lecture</Text>
        <View style={styles.topBarSide} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxxl }}
      >
        <View style={styles.intro}>
          <Text style={styles.title}>Dans quelle langue lire</Text>
          <Text style={styles.lede}>
            Le français est la langue d'origine des livres. Les autres en sont des traductions,
            relues avant publication et embarquées dans l'app : elles fonctionnent hors ligne
            comme le reste.
          </Text>
          <Divider width={30} style={{ marginTop: spacing.md }} />
        </View>

        {!canChangeLanguage ? (
          <View style={styles.locked}>
            <EmptyState
              icon="lock-closed-outline"
              title="Réservé à Lumia Extra"
              hint={`Le choix de la langue et le mode bilingue font partie de ${PLANS[LANGUAGES_PLAN].name}, à ${PLANS[LANGUAGES_PLAN].price} par mois.`}
            />
            <GoldButton
              label="Voir les formules"
              onPress={() => router.push("/abonnement")}
              style={styles.lockedCta}
            />
          </View>
        ) : (
          <>
            <View style={styles.list}>
              {LOCALE_CODES.map((code) => {
                const active = locale === code;
                return (
                  <Pressable
                    key={code}
                    onPress={() => setLocale(code)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={LOCALES[code].endonym}
                    style={({ pressed }) => [
                      styles.row,
                      active && styles.rowActive,
                      pressed && { opacity: 0.9 },
                    ]}
                  >
                    <Text style={[styles.rowLabel, active && styles.rowLabelActive]}>
                      {LOCALES[code].endonym}
                    </Text>
                    {code === SOURCE_LOCALE && <Text style={styles.rowNote}>langue d'origine</Text>}
                    {active && <Ionicons name="checkmark" size={18} color={colors.gold} />}
                  </Pressable>
                );
              })}
            </View>

            {available.length === 0 && (
              <Text style={styles.pending}>
                Aucune traduction n'est encore embarquée. Elles arriveront par mise à jour de
                l'app, langue par langue.
              </Text>
            )}

            <View style={styles.bilingual}>
              <View style={styles.bilingualBody}>
                <Text style={styles.bilingualTitle}>Mode bilingue</Text>
                <Text style={styles.bilingualHint}>
                  Chaque paragraphe traduit est suivi du texte français d'origine. Utile pour
                  apprendre, et pour vérifier une phrase qui surprend.
                </Text>
              </View>
              <Switch
                value={bilingual}
                onValueChange={setBilingual}
                disabled={locale === SOURCE_LOCALE}
                accessibilityLabel="Mode bilingue"
                trackColor={{ false: colors.surfaceRaised, true: colors.goldDeep }}
                thumbColor={bilingual ? colors.goldLight : colors.textFaint}
              />
            </View>
            {locale === SOURCE_LOCALE && (
              <Text style={styles.pending}>
                Le mode bilingue demande une langue autre que le français : il compare une
                traduction à son original.
              </Text>
            )}
          </>
        )}
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
  locked: { marginTop: spacing.xxl },
  lockedCta: { alignSelf: "center", marginTop: spacing.lg },
  list: { marginTop: spacing.xl, paddingHorizontal: spacing.xl, gap: spacing.sm },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    height: 56,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.lineSoft,
  },
  rowActive: { borderColor: colors.gold, backgroundColor: colors.goldGlow },
  rowLabel: { flex: 1, fontFamily: fonts.display, fontSize: 17, color: colors.text },
  rowLabelActive: { color: colors.goldLight },
  rowNote: { ...type.caption, fontSize: 11 },
  pending: {
    ...type.caption,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
    lineHeight: 19,
  },
  bilingual: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    marginHorizontal: spacing.xl,
    marginTop: spacing.xxl,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  bilingualBody: { flex: 1, gap: 4 },
  bilingualTitle: { fontFamily: fonts.body, fontSize: 14, fontWeight: "700", color: colors.text },
  bilingualHint: { ...type.caption, lineHeight: 19 },
});
