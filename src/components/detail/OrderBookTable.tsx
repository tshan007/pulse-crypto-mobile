import React, { useEffect, useMemo, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { BookLevel } from "../../types/market";
import { formatPrice, formatQuantity } from "../../utils/format";
import { theme } from "../../theme";

interface OrderBookTableProps {
  bids: BookLevel[];
  asks: BookLevel[];
}

/** Renders bids/asks with a volume bar per row, each animated via its own Animated.Value. */
export const OrderBookTable = React.memo(function OrderBookTable({ bids, asks }: OrderBookTableProps) {
  const maxVolume = useMemo(() => {
    const all = [...bids, ...asks].map(([, qty]) => Number(qty));
    return Math.max(1e-9, ...all);
  }, [bids, asks]);

  return (
    <View style={styles.container}>
      <View style={styles.column}>
        <Text style={styles.columnHeader}>Bids</Text>
        {bids.map(([price, qty], i) => (
          <OrderRow key={`bid-${price}-${i}`} price={price} qty={qty} maxVolume={maxVolume} side="bid" />
        ))}
      </View>
      <View style={styles.column}>
        <Text style={styles.columnHeader}>Asks</Text>
        {asks.map(([price, qty], i) => (
          <OrderRow key={`ask-${price}-${i}`} price={price} qty={qty} maxVolume={maxVolume} side="ask" />
        ))}
      </View>
    </View>
  );
});

const OrderRow = React.memo(function OrderRow({
  price,
  qty,
  maxVolume,
  side,
}: {
  price: string;
  qty: string;
  maxVolume: number;
  side: "bid" | "ask";
}) {
  const widthPct = Math.min(100, (Number(qty) / maxVolume) * 100);
  const widthAnim = useRef(new Animated.Value(widthPct)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: widthPct,
      duration: 300,
      useNativeDriver: false, // width isn't supported by the native driver
    }).start();
  }, [widthPct, widthAnim]);

  return (
    <View style={styles.row}>
      <Animated.View
        style={[
          styles.volumeBar,
          {
            width: widthAnim.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }),
          },
          side === "bid" ? styles.bidBar : styles.askBar,
        ]}
      />
      <Text style={[styles.priceText, side === "bid" ? styles.bidText : styles.askText]}>
        {formatPrice(Number(price))}
      </Text>
      <Text style={styles.qtyText}>{formatQuantity(qty)}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 12,
  },
  column: {
    flex: 1,
  },
  columnHeader: {
    color: theme.colors.textDim,
    fontSize: 12,
    marginBottom: 6,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    paddingHorizontal: 6,
    position: "relative",
    overflow: "hidden",
    borderRadius: 4,
    marginBottom: 2,
  },
  volumeBar: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    borderRadius: 4,
  },
  bidBar: {
    backgroundColor: theme.colors.successWash,
  },
  askBar: {
    backgroundColor: theme.colors.dangerWash,
  },
  priceText: {
    fontSize: 13,
    fontVariant: ["tabular-nums"],
  },
  bidText: {
    color: theme.colors.successBright,
  },
  askText: {
    color: theme.colors.dangerBright,
  },
  qtyText: {
    fontSize: 13,
    color: theme.colors.textDefault,
    fontVariant: ["tabular-nums"],
  },
});
