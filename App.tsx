import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { WatchlistScreen } from "./src/screens/WatchlistScreen";
import { DetailScreen } from "./src/screens/DetailScreen";
import { RootStackParamList } from "./src/navigation/types";
import { useMarketSocket } from "./src/hooks/useMarketSocket";
import { useFavouritesHydration } from "./src/hooks/useFavouritesHydration";

const Stack = createNativeStackNavigator<RootStackParamList>();

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

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: "#09090b" }, headerTintColor: "#fafafa" }}>
          <Stack.Screen name="Watchlist" component={WatchlistScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Detail" component={DetailScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
