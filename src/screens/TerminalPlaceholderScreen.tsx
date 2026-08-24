import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePairScope } from "../hooks/usePairScope";
import { theme } from "../theme";

/** Placeholder for the not-yet-built Terminal screen. */
export function TerminalPlaceholderScreen() {
  usePairScope([]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <Text style={styles.title}>Terminal</Text>
      <Text style={styles.body}>Coming soon — deep order book ladder and market depth chart.</Text>
    </SafeAreaView>
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
