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

// Simple text-glyph tab icons for now, to avoid pulling in an icon font
// dependency for a UI detail that's easy to swap later.
function TabIcon({ glyph, focused }: { glyph: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 18, color: focused ? theme.colors.positive : theme.colors.textMuted }}>{glyph}</Text>
  );
}

/**
 * Bottom tabs: Terminal / Markets / Telemetry / Settings, matching the
 * trading-terminal wireframe's tab bar. Telemetry (read-only performance
 * dashboard) and Settings (network/data ingestion controls) are separate
 * screens — split out from a single combined screen they previously shared.
 */
export function RootTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="MarketsStack"
      screenOptions={{
        headerShown: false,
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
