import { View, Text, StyleSheet, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, fonts, radius, fillObject } from "@/theme";
import { LatticePattern, Rule, StarMotif } from "@/components/Ornament";
import { COVER_RATIO, getCover } from "@/data/covers";
import type { CoverTheme } from "@/data/types";

/**
 * La couverture d'un livre Lumia.
 *
 * Deux rendus, dans cet ordre :
 *
 * 1. **La couverture dessinée par l'auteur**, quand `slug` en désigne une dans
 *    `src/data/covers.ts`. C'est le cas des 28 livres du catalogue.
 * 2. **Une couverture composée en code** sinon — dégradé, motif géométrique, filets dorés et
 *    titre à empattements, sans aucune image. Elle sert de repli, et fait qu'un livre a une
 *    couverture correcte le jour où il est créé, avant que la vraie soit dessinée.
 *
 * La maquette d'origine posait des portraits (Saladin, Ibn Sina, Marc Aurèle) : ceux-là
 * restent exclus. Les couvertures fournies ne montrent ni personnage ni visage — voir la
 * note sur la représentation figurative dans CLAUDE.md.
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
  slug,
}: {
  title: string;
  theme?: CoverTheme;
  /** Petite mention en bas : « Tome 2 », la catégorie… */
  label?: string | null;
  width: number;
  /** Allège l'ornementation sur les toutes petites vignettes. */
  compact?: boolean;
  /** Identifiant du livre : sert à retrouver sa couverture dessinée, s'il en a une. */
  slug?: string;
}) {
  const artwork = slug ? getCover(slug) : undefined;
  /* Toutes les couvertures partagent le même cadre, sans quoi les rangées se décalent. Sans
     image, on garde le ratio d'un livre de poche, celui de la maquette. */
  const height = width * (artwork ? COVER_RATIO : 1.5);
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

  if (artwork) {
    return (
      <View
        style={[styles.frame, { width, height, borderRadius: compact ? radius.md : radius.lg }]}
      >
        {/* Le dégradé reste derrière : les deux couvertures un peu moins hautes que les autres
            sont centrées dessus plutôt que rognées. */}
        <LinearGradient colors={THEMES[theme]} style={StyleSheet.absoluteFill} />
        {/* Dimensions explicites : `absoluteFill` seul laisse l'image à sa taille naturelle
            au rendu web, et elle déborde alors du cadre. */}
        <Image
          source={artwork}
          resizeMode="contain"
          style={styles.artwork}
          accessible
          accessibilityRole="image"
          accessibilityLabel={`Couverture de ${title}`}
        />
        <View
          pointerEvents="none"
          style={[styles.bezel, { borderRadius: compact ? radius.md : radius.lg }]}
        />
      </View>
    );
  }

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
  artwork: { width: "100%", height: "100%" },
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
