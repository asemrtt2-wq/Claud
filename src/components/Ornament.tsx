import { View, StyleSheet } from "react-native";
import { colors } from "@/theme";

/**
 * Motifs décoratifs non figuratifs — la seule imagerie que Lumia s'autorise.
 *
 * Tout est construit avec des vues et des rotations plutôt qu'avec des images ou du SVG :
 * aucune dépendance native supplémentaire, et le motif reste net à n'importe quelle taille.
 */

/** Étoile à huit branches : deux carrés superposés, l'un tourné de 45°. */
export function StarMotif({
  size = 120,
  color = colors.gold,
  opacity = 0.14,
  thickness = 1,
}: {
  size?: number;
  color?: string;
  opacity?: number;
  thickness?: number;
}) {
  const square = {
    position: "absolute" as const,
    width: size,
    height: size,
    borderWidth: thickness,
    borderColor: color,
  };
  return (
    <View
      pointerEvents="none"
      style={{ width: size, height: size, opacity, alignItems: "center", justifyContent: "center" }}
    >
      <View style={square} />
      <View style={[square, { transform: [{ rotate: "45deg" }] }]} />
      <View
        style={[
          square,
          {
            width: size * 0.62,
            height: size * 0.62,
            transform: [{ rotate: "22.5deg" }],
          },
        ]}
      />
    </View>
  );
}

/** Filet doré centré, avec un losange au milieu — le séparateur de la maquette. */
export function Divider({ width = 56, style }: { width?: number; style?: object }) {
  return (
    <View style={[styles.dividerRow, style]}>
      <View style={[styles.dividerLine, { width }]} />
      <View style={styles.dividerDiamond} />
      <View style={[styles.dividerLine, { width }]} />
    </View>
  );
}

/** Simple filet horizontal, sans losange. */
export function Rule({ width = 40, style }: { width?: number; style?: object }) {
  return <View style={[styles.dividerLine, { width }, style]} />;
}

/**
 * Trame de losanges en fond de carte. Purement géométrique : elle donne de la matière
 * là où la maquette utilisait une photo.
 */
export function LatticePattern({
  rows = 4,
  columns = 3,
  opacity = 0.1,
}: {
  rows?: number;
  columns?: number;
  opacity?: number;
}) {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity, overflow: "hidden" }]}>
      {Array.from({ length: rows }).map((_, r) => (
        <View key={r} style={styles.latticeRow}>
          {Array.from({ length: columns }).map((__, c) => (
            <View key={c} style={styles.latticeCell} />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  dividerLine: { height: StyleSheet.hairlineWidth * 2, backgroundColor: colors.goldDeep },
  dividerDiamond: {
    width: 5,
    height: 5,
    backgroundColor: colors.gold,
    transform: [{ rotate: "45deg" }],
  },
  latticeRow: { flex: 1, flexDirection: "row" },
  latticeCell: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.gold,
    transform: [{ rotate: "45deg" }],
  },
});
