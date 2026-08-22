import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RootTabNavigator } from "./src/navigation/RootTabNavigator";
import { useMarketSocket } from "./src/hooks/useMarketSocket";
import { useFavouritesHydration } from "./src/hooks/useFavouritesHydration";
import { usePairs } from "./src/hooks/usePairs";

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#09090b",
    card: "#09090b",
    text: "#fafafa",
    border: "#27272a",
  },
};

export default function App() {
  // Single WebSocket connection for the whole app lifetime.
  useMarketSocket();
  // Restore favourites from disk on cold start.
  useFavouritesHydration();
  // Fetch the supported pair list from the backend on cold start.
  usePairs();

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer theme={navTheme}>
        <RootTabNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
