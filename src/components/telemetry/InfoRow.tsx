import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../theme";

interface InfoRowProps {
  icon: string; // single glyph/emoji-free short label rendered in a colored box
  iconBackground: string;
  iconColor: string;
  title: string;
  subtitle: string;
}

/**
 * Matches the design spec's "GPU Acceleration / API Latency / Storage
 * Cache" row style. These three are explicitly placeholders — see the
 * screen's header comment for why (no reliable RN API for GPU pipeline
 * status, JS heap memory, or true network latency without a native module).
 */
export function InfoRow({ icon, iconBackground, iconColor, title, subtitle }: InfoRowProps) {
  return (
    <View style={styles.row}>
      <View style={[styles.iconBox, { backgroundColor: iconBackground }]}>
        <Text style={[styles.iconText, { color: iconColor }]}>{icon}</Text>
      </View>
      <View style={styles.textColumn}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 16,
    fontWeight: "700",
  },
  textColumn: {
    flex: 1,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
});
