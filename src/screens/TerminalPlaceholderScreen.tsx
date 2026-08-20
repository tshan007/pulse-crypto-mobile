import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "../theme";

/**
 * Stand-in for the Terminal (deep order book + market depth chart) screen
 * from the trading-terminal wireframe. Not yet built — kept as an explicit
 * placeholder rather than omitted from the tab bar, so the nav structure is
 * complete and reviewable even before every screen behind it exists.
 */
export function TerminalPlaceholderScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Terminal</Text>
      <Text style={styles.body}>Coming soon — deep order book ladder and market depth chart.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.xl,
  },
  title: {
    ...theme.typography.headingLarge,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  body: {
    ...theme.typography.bodyMedium,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
});
