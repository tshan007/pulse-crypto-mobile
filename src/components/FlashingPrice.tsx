import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, TextStyle } from "react-native";
import { config } from "../config";

interface FlashingPriceProps {
  value: number | null;
  formatted: string;
  style?: TextStyle;
}

/**
 * Renders a price and briefly flashes its background green/red when the
 * value changes direction. Uses the Animated API (not Reanimated) — for a
 * background-color fade at 100ms-scale update frequency, the JS-driven
 * Animated timing is more than sufficient and avoids an extra native
 * dependency. Each instance owns its own Animated.Value, so flashing one
 * row never touches React state/render work in any other row.
 */
export const FlashingPrice = React.memo(function FlashingPrice({ value, formatted, style }: FlashingPriceProps) {
  const flashAnim = useRef(new Animated.Value(0)).current; // 0 = no flash
  const prevValueRef = useRef<number | null>(value);
  const directionRef = useRef<"up" | "down">("up");

  useEffect(() => {
    const prev = prevValueRef.current;
    if (prev !== null && value !== null && value !== prev) {
      directionRef.current = value > prev ? "up" : "down";
      flashAnim.setValue(1);
      Animated.timing(flashAnim, {
        toValue: 0,
        duration: config.flashDurationMs,
        useNativeDriver: false, // backgroundColor isn't supported by the native driver
      }).start();
    }
    prevValueRef.current = value;
  }, [value, flashAnim]);

  const backgroundColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      "rgba(0,0,0,0)",
      directionRef.current === "up" ? "rgba(34,197,94,0.35)" : "rgba(239,68,68,0.35)",
    ],
  });

  return (
    <Animated.Text style={[styles.text, style, { backgroundColor }]}>{formatted}</Animated.Text>
  );
});

const styles = StyleSheet.create({
  text: {
    fontVariant: ["tabular-nums"],
  },
});
