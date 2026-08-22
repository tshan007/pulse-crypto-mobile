import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../theme";

interface ConnectionStatusBadgeProps {
  status: string; // SocketStatus, kept loose here to avoid a circular import
}

export const ConnectionStatusBadge = React.memo(function ConnectionStatusBadge({
  status,
}: ConnectionStatusBadgeProps) {
  const label =
    status === "open"
      ? "Live"
      : status === "reconnecting"
      ? "Reconnecting…"
      : status === "connecting"
      ? "Connecting…"
      : "Offline";
  const color =
    status === "open" ? theme.colors.positive : status === "closed" ? theme.colors.negative : theme.colors.warning;

  return (
    <View style={styles.badge}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.pill,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  text: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
});
