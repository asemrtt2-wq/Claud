import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LibraryProvider } from "@/store/library";
import { colors } from "@/theme";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <LibraryProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.night },
            // Une transition sobre, la même sur iOS et Android.
            animation: "fade",
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="livre/[slug]" options={{ animation: "slide_from_right" }} />
          <Stack.Screen
            name="lecture/[slug]"
            options={{ animation: "slide_from_bottom", gestureEnabled: false }}
          />
        </Stack>
      </LibraryProvider>
    </SafeAreaProvider>
  );
}
