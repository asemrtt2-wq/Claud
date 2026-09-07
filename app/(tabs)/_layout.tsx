import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, touchTarget } from "@/theme";

/**
 * La barre d'onglets de la maquette : Accueil, Explorer, Bibliothèque, Profil.
 *
 * L'onglet Profil utilise une icône de badge plutôt que la silhouette de la maquette :
 * la règle « pas de représentation physique » s'applique aussi aux pictogrammes.
 */
export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.goldLight,
        tabBarInactiveTintColor: colors.textFaint,
        // La hauteur suit l'encoche du bas (iPhone) ou la barre de navigation gestuelle
        // (Android edge-to-edge) au lieu d'une valeur figée par plateforme.
        tabBarStyle: [
          styles.bar,
          { height: touchTarget + 12 + insets.bottom, paddingBottom: insets.bottom + 6 },
        ],
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: { paddingTop: 6 },
        sceneStyle: { backgroundColor: colors.night },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explorer"
        options={{
          title: "Explorer",
          tabBarIcon: ({ color }) => <Ionicons name="search-outline" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bibliotheque"
        options={{
          title: "Bibliothèque",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "library" : "library-outline"} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "ribbon" : "ribbon-outline"} size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: "#0E0E14",
    borderTopColor: colors.lineSoft,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  label: { fontFamily: fonts.body, fontSize: 10, letterSpacing: 0.2 },
});
