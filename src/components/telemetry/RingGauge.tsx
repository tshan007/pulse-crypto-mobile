import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { theme } from "../../theme";

interface RingGaugeProps {
  value: number;
  maxValue: number;
  label: string;
  unit: string;
  size?: number;
  color?: string;
}

/** Circular progress ring, e.g. for the JS thread frame rate. */
export const RingGauge = React.memo(function RingGauge({
  value,
  maxValue,
  label,
  unit,
  size = 160,
  color = theme.colors.positive,
}: RingGaugeProps) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(1, Math.max(0, value / maxValue));
  const dashOffset = circumference * (1 - progress);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.palette.neutral[800]}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          fill="none"
          // Start the arc at 12 o'clock instead of svg's default 3 o'clock.
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={styles.value}>{Math.round(value)}</Text>
        <Text style={styles.unit}>{unit}</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    alignItems: "center",
  },
  value: {
    color: theme.colors.textPrimary,
    fontSize: 32,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  unit: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: -2,
  },
  label: {
    position: "absolute",
    bottom: -26,
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
});
