import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Slider from "@react-native-community/slider";
import { theme } from "../../theme";

interface ThrottleSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function ThrottleSlider({ value, onValueChange, min = 10, max = 1000 }: ThrottleSliderProps) {
  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.label}>Update Frequency</Text>
        <Text style={styles.value}>{value}ms</Text>
      </View>
      <Slider
        minimumValue={min}
        maximumValue={max}
        step={10}
        value={value}
        onValueChange={onValueChange}
        minimumTrackTintColor={theme.colors.positive}
        maximumTrackTintColor={theme.palette.neutral[700]}
        thumbTintColor={theme.colors.positive}
      />
      <View style={styles.ticks}>
        <Text style={styles.tickText}>{min}ms</Text>
        <Text style={styles.tickText}>500ms</Text>
        <Text style={styles.tickText}>{max}ms</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    color: theme.colors.textPrimary,
    fontSize: 14,
  },
  value: {
    color: theme.colors.positive,
    fontSize: 14,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  ticks: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  tickText: {
    color: theme.colors.textMuted,
    fontSize: 11,
  },
});
