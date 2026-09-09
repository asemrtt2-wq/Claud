import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, fonts, radius, fillObject } from "@/theme";
import { LatticePattern, Rule, StarMotif } from "@/components/Ornament";
import type { CoverTheme } from "@/data/types";

/**
 * La couverture d'un livre Lumia.
 *
 * Aucune image : la maquette d'origine posait des portraits (Saladin, Ibn Sina, Marc
 * Aurèle) sur les couvertures, ce que la règle « pas de représentation figurative » interdit.
 * La couverture est donc composée — dégradé, motif géométrique, filets dorés et titre à
 * empattements — et rendue entièrement en code. Avantage secondaire : rien à télécharger,
 * et une couverture correcte existe pour un livre le jour où il est créé.
 */
const THEMES: Record<CoverTheme, readonly [string, string, string]> = {
  nuit: ["#1B1F2E", "#12131C", "#0A0A10"],
  or: ["#3A2E18", "#241C10", "#12100A"],
  encre: ["#151A22", "#0F1319", "#08090D"],
  vin: ["#2C1518", "#1B0E11", "#0D0709"],
  foret: ["#152220", "#0E1715", "#070C0B"],
  sable: ["#2E2519", "#1D1810", "#0F0C08"],
};

export const COVER_THEMES = Object.keys(THEMES) as CoverTheme[];

export default function BookCover({
  title,
  theme = "nuit",
  label,
  width,
  compact = false,
}: {
  title: string;
  theme?: CoverTheme;
  /** Petite mention en bas : « Tome 2 », la catégorie… */
  label?: string | null;
  width: number;
  /** Allège l'ornementation sur les toutes petites vignettes. */
  compact?: boolean;
}) {
  // Ratio d'un livre de poche, celui de la maquette.
  const height = width * 1.5;
  const padding = compact ? 8 : 12;
  /* Le titre ne doit jamais se couper au milieu d'un mot — « MACHIAVEL / LI ». On réduit donc
     la police jusqu'à ce que le mot le plus long tienne sur une ligne. (`adjustsFontSizeToFit`
     fait ce travail sur iOS et Android, mais pas au rendu web.) */
  const longestWord = Math.max(...title.split(/\s+/).map((w) => w.length), 1);
  const letterSpacing = compact ? 0.5 : 1.2;
  const base = compact ? width * 0.115 : width * 0.125;
  // Une capitale de Georgia occupe environ 0,72 em, à quoi s'ajoute l'interlettrage.
  const fitsLongestWord = ((width - padding * 2) / longestWord - letterSpacing) / 0.72;
  const titleSize = Math.max(compact ? 8 : 10, Math.min(base, fitsLongestWord));

  return (
    <View style={[styles.frame, { width, height, borderRadius: compact ? radius.md : radius.lg }]}>
      <LinearGradient colors={THEMES[theme]} style={StyleSheet.absoluteFill} />
      <LatticePattern rows={5} columns={3} opacity={compact ? 0.05 : 0.08} />

      {!compact && (
        <View style={styles.motif}>
          <StarMotif size={width * 0.66} opacity={0.16} />
        </View>
      )}

      <View style={[styles.inner, { padding: compact ? 8 : 12 }]}>
        {!compact && <Rule width={width * 0.3} style={styles.topRule} />}
        <Text
          numberOfLines={4}
          adjustsFontSizeToFit
          style={[styles.title, { fontSize: titleSize, letterSpacing }]}
        >
          {title.toUpperCase()}
        </Text>
        {/* Deux lignes hors vignette : « Développement personnel » ne tient pas sur une. */}
        {label ? (
          <Text
            numberOfLines={compact ? 1 : 2}
            style={[styles.label, { fontSize: compact ? 7 : 9 }]}
          >
            {label.toUpperCase()}
          </Text>
        ) : null}
      </View>

      {/* Liseré intérieur : le cadre doré d'une reliure. */}
      <View
        pointerEvents="none"
        style={[styles.bezel, { borderRadius: compact ? radius.md : radius.lg }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: "hidden",
    backgroundColor: colors.surface,
    justifyContent: "center",
  },
  motif: { ...fillObject, alignItems: "center", justifyContent: "center" },
  inner: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  topRule: { opacity: 0.7 },
  title: {
    fontFamily: fonts.display,
    color: colors.goldLight,
    textAlign: "center",
    lineHeight: undefined,
  },
  label: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    letterSpacing: 1.6,
    textAlign: "center",
  },
  bezel: {
    ...fillObject,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(214,178,108,0.28)",
  },
});
