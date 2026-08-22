import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "../theme";

interface MetricProps {
  label: string;
  value: string;
}

export const Metric = React.memo(function Metric({ label, value }: MetricProps) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  metric: {
    alignItems: "center",
    flex: 1,
  },
  metricLabel: {
    color: theme.colors.textFaint,
    fontSize: 12,
    marginBottom: 4,
  },
  metricValue: {
    color: theme.colors.textStrong,
    fontSize: 15,
    fontWeight: "600",
  },
});
