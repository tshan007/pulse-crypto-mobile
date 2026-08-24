import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, TextStyle } from "react-native";
import { config } from "../../config";
import { theme } from "../../theme";

interface FlashingPriceProps {
  value: number | null;
  formatted: string;
  style?: TextStyle;
}

/** Renders a price and briefly flashes green/red on change. Each instance owns its own Animated.Value. */
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
      "transparent",
      directionRef.current === "up" ? theme.colors.successOverlay : theme.colors.dangerOverlay,
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
