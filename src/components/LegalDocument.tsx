import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, radius, spacing, type } from "@/theme";
import { Divider } from "@/components/Ornament";
import { LEGAL_UPDATED, PUBLISHER, publisherMissing } from "@/data/legal";

/**
 * La mise en page commune aux deux textes juridiques : conditions d'utilisation et
 * politique de confidentialité.
 *
 * Ils se ressemblent assez pour partager une coquille, et ils doivent se ressembler : un
 * lecteur qui ouvre l'un doit reconnaître l'autre. Le contenu, lui, est écrit une fois par
 * texte dans `app/conditions.tsx` et `app/confidentialite.tsx`.
 */

export type Section = {
  heading: string;
  /** Paragraphes du corps. Une chaîne commençant par « - » devient une puce. */
  body: string[];
};

export function LegalDocument({
  screenTitle,
  title,
  lede,
  sections,
}: {
  /** Le titre court de la barre du haut. */
  screenTitle: string;
  title: string;
  lede: string;
  sections: Section[];
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
        <Text style={styles.topBarTitle}>{screenTitle}</Text>
        <View style={styles.topBarSide} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxxl }}
      >
        <View style={styles.intro}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.updated}>{`Dernière mise à jour : ${LEGAL_UPDATED}`}</Text>
          <Text style={styles.lede}>{lede}</Text>
          <Divider width={30} style={{ marginTop: spacing.md }} />
        </View>

        {/* Un texte juridique signé « À COMPLÉTER » ne doit pas partir à la validation sans
            que personne ne s'en aperçoive : on le dit à l'écran, pas seulement en commentaire. */}
        {publisherMissing && (
          <View style={styles.warn}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.danger} />
            <Text style={styles.warnText}>
              L&apos;éditeur de l&apos;app n&apos;est pas encore renseigné. À compléter dans
              src/data/legal.ts avant toute publication : les deux boutiques refusent des
              conditions sans éditeur identifiable ni adresse de contact.
            </Text>
          </View>
        )}

        {sections.map((section) => (
          <View key={section.heading} style={styles.section}>
            <Text style={styles.heading}>{section.heading}</Text>
            {section.body.map((paragraph) =>
              paragraph.startsWith("- ") ? (
                <View key={paragraph} style={styles.bullet}>
                  <Text style={styles.bulletDot}>·</Text>
                  <Text style={styles.bulletText}>{paragraph.slice(2)}</Text>
                </View>
              ) : (
                <Text key={paragraph} style={styles.paragraph}>
                  {paragraph}
                </Text>
              )
            )}
          </View>
        ))}

        <View style={styles.contact}>
          <Text style={styles.heading}>Nous écrire</Text>
          <Text style={styles.paragraph}>
            {`Une question sur ce texte, ou une demande à formuler : ${PUBLISHER.email}.`}
          </Text>
          <Text style={styles.signature}>{`Lumia est édité par ${PUBLISHER.name}.`}</Text>
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
  updated: { ...type.caption, marginTop: spacing.sm },
  lede: { ...type.bodyMuted, marginTop: spacing.md, lineHeight: 22 },

  warn: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start",
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderLeftWidth: 2,
    borderLeftColor: colors.danger,
  },
  warnText: { flex: 1, ...type.caption, lineHeight: 19 },

  section: { paddingHorizontal: spacing.xl, marginTop: spacing.xxl, gap: spacing.sm },
  heading: { ...type.h3 },
  paragraph: { ...type.body, color: colors.textMuted, lineHeight: 23 },
  bullet: { flexDirection: "row", gap: spacing.md, alignItems: "flex-start" },
  bulletDot: { ...type.body, color: colors.gold, lineHeight: 23 },
  bulletText: { flex: 1, ...type.body, color: colors.textMuted, lineHeight: 23 },

  contact: { paddingHorizontal: spacing.xl, marginTop: spacing.xxl, gap: spacing.sm },
  signature: { ...type.caption, lineHeight: 18 },
});
