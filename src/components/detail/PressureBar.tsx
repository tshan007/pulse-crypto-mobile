import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { theme } from "../../theme";

interface PressureBarProps {
  buyPressure: number | null;
  sellPressure: number | null;
}

// Same per-instance Animated.Value approach as FlashingPrice.
export const PressureBar = React.memo(function PressureBar({ buyPressure, sellPressure }: PressureBarProps) {
  const buy = buyPressure ?? 50;
  const sell = sellPressure ?? 50;
  const widthAnim = useRef(new Animated.Value(buy)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: buy,
      duration: 300,
      useNativeDriver: false, // width isn't supported by the native driver
    }).start();
  }, [buy, widthAnim]);

  return (
    <View>
      <View style={styles.pressureBarTrack}>
        <Animated.View
          style={[
            styles.pressureBarFill,
            {
              width: widthAnim.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }),
              backgroundColor: theme.colors.success,
            },
          ]}
        />
      </View>
      <View style={styles.pressureLabels}>
        <Text style={styles.pressureLabelBuy}>Buy {buy.toFixed(0)}%</Text>
        <Text style={styles.pressureLabelSell}>Sell {sell.toFixed(0)}%</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  pressureBarTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.dangerOverlay,
    overflow: "hidden",
  },
  pressureBarFill: {
    height: "100%",
  },
  pressureLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  pressureLabelBuy: {
    color: theme.colors.successBright,
    fontSize: 12,
  },
  pressureLabelSell: {
    color: theme.colors.dangerBright,
    fontSize: 12,
  },
});
