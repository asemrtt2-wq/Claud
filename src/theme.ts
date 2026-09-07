import { Platform } from "react-native";

/**
 * Le langage visuel de Lumia : nuit profonde + or chaud, typographie à empattements.
 *
 * Règle de contenu qui gouverne tout le reste de l'app : **aucune représentation
 * figurative** — ni personnage, ni visage, ni silhouette, ni animal. Les couvertures et
 * les illustrations sont donc typographiques, géométriques ou ornementales. Voir
 * `src/components/BookCover.tsx`, qui compose une couverture sans image.
 */
export const colors = {
  /** Fond principal, presque noir avec une pointe de bleu nuit. */
  night: "#0B0B0F",
  /** Fond des cartes et des panneaux. */
  surface: "#15151C",
  surfaceRaised: "#1D1D26",
  /** Bordures discrètes. */
  line: "rgba(214, 178, 108, 0.16)",
  lineSoft: "rgba(255, 255, 255, 0.08)",

  /** L'or de la marque, du plus clair au plus profond. */
  gold: "#D6B26C",
  goldLight: "#EAD3A0",
  goldDeep: "#A8813F",
  goldGlow: "rgba(214, 178, 108, 0.14)",

  text: "#F4EFE6",
  textMuted: "#A79E90",
  textFaint: "#6E6862",

  success: "#7BAE7F",
  danger: "#C4736B",
} as const;

/**
 * Une pile à empattements disponible sur les deux plateformes, sans police à télécharger.
 * `fonts.display` sert aux titres et au logo, `fonts.body` au texte courant.
 */
export const fonts = {
  display: Platform.select({ ios: "Georgia", android: "serif", default: "serif" }),
  displayItalic: Platform.select({
    ios: "Georgia-Italic",
    android: "serif",
    default: "serif",
  }),
  body: Platform.select({ ios: "System", android: "sans-serif", default: "System" }),
  /** Le texte des livres : à empattements, comme un livre imprimé. */
  reading: Platform.select({ ios: "Georgia", android: "serif", default: "serif" }),
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

export const type = {
  /** « LUMIA » : lettres espacées, comme sur la maquette. */
  logo: {
    fontFamily: fonts.display,
    fontSize: 30,
    letterSpacing: 10,
    color: colors.goldLight,
  },
  h1: { fontFamily: fonts.display, fontSize: 30, lineHeight: 38, color: colors.text },
  h2: { fontFamily: fonts.display, fontSize: 22, lineHeight: 29, color: colors.text },
  h3: { fontFamily: fonts.display, fontSize: 17, lineHeight: 23, color: colors.text },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: colors.text },
  bodyMuted: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: "uppercase" as const,
    color: colors.textMuted,
  },
  caption: { fontFamily: fonts.body, fontSize: 11, color: colors.textFaint },
} as const;

/** Dégradés réutilisables (expo-linear-gradient attend un tuple figé). */
export const gradients = {
  night: ["#14141B", "#0B0B0F"] as const,
  gold: ["#EAD3A0", "#D6B26C", "#A8813F"] as const,
  scrim: ["transparent", "rgba(11,11,15,0.55)", "#0B0B0F"] as const,
  cardGlow: ["rgba(214,178,108,0.10)", "rgba(214,178,108,0.02)"] as const,
} as const;

/**
 * Équivalent de `StyleSheet.absoluteFillObject`, qui n'est pas exposé par les types de
 * React Native 0.86 — on le redéclare une fois plutôt que de le réécrire partout.
 */
export const fillObject = {
  position: "absolute" as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

/**
 * Taille minimale d'une zone tactile. Apple demande 44 pt, Android 48 dp : on prend le
 * plus exigeant des deux, une seule valeur pour les deux plateformes.
 */
export const touchTarget = 48;
