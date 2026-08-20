import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../theme";

interface MetricCardProps {
  children: React.ReactNode;
  style?: object;
}

export function MetricCard({ children, style }: MetricCardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionEyebrow({ children, color }: { children: string; color?: string }) {
  return <Text style={[styles.eyebrow, color ? { color } : null]}>{children}</Text>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
  },
  eyebrow: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },
});
