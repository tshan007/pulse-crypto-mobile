import React from "react";
import { View, StyleSheet } from "react-native";

interface ConnectionDotProps {
  connected: boolean;
}

export const ConnectionDot = React.memo(function ConnectionDot({ connected }: ConnectionDotProps) {
  return <View style={[styles.dot, connected ? styles.connected : styles.disconnected]} />;
});

const styles = StyleSheet.create({
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connected: {
    backgroundColor: "#22c55e",
  },
  disconnected: {
    backgroundColor: "#71717a",
  },
});
