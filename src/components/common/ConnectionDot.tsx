import React from "react";
import { View, StyleSheet } from "react-native";
import { theme } from "../../theme";

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
    backgroundColor: theme.colors.success,
  },
  disconnected: {
    backgroundColor: theme.colors.textFaint,
  },
});
