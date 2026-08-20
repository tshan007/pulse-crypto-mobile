import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { WatchlistScreen } from "../screens/WatchlistScreen";
import { DetailScreen } from "../screens/DetailScreen";
import { MarketsStackParamList } from "./types";
import { theme } from "../theme";

const Stack = createNativeStackNavigator<MarketsStackParamList>();

export function MarketsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.textPrimary,
      }}
    >
      <Stack.Screen name="Watchlist" component={WatchlistScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Detail" component={DetailScreen} />
    </Stack.Navigator>
  );
}
