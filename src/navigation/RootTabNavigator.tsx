import React from "react";
import { Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MarketsStackNavigator } from "./MarketsStackNavigator";
import { TelemetryScreen } from "../screens/TelemetryScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { TerminalPlaceholderScreen } from "../screens/TerminalPlaceholderScreen";
import { RootTabParamList } from "./types";
import { theme } from "../theme";

const Tab = createBottomTabNavigator<RootTabParamList>();

// Text-glyph tab icons for now — avoids an icon font dependency.
function TabIcon({ glyph, focused }: { glyph: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 18, color: focused ? theme.colors.positive : theme.colors.textMuted }}>{glyph}</Text>
  );
}

/** Bottom tabs: Terminal / Markets / Telemetry / Settings. */
export function RootTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="MarketsStack"
      screenOptions={{
        headerShown: false,
        animation: "shift",
        lazy: true,
        tabBarStyle: { backgroundColor: theme.colors.background, borderTopColor: theme.palette.neutral[800] },
        tabBarActiveTintColor: theme.colors.positive,
        tabBarInactiveTintColor: theme.colors.textMuted,
      }}
    >
      <Tab.Screen
        name="Terminal"
        component={TerminalPlaceholderScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon glyph="T" focused={focused} /> }}
      />
      <Tab.Screen
        name="MarketsStack"
        component={MarketsStackNavigator}
        options={{ title: "Markets", tabBarIcon: ({ focused }) => <TabIcon glyph="M" focused={focused} /> }}
      />
      <Tab.Screen
        name="Telemetry"
        component={TelemetryScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon glyph="Tm" focused={focused} /> }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon glyph="S" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}
