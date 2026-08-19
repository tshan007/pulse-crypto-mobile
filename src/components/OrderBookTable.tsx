import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { BookLevel } from "../types/market";
import { formatPrice, formatQuantity } from "../utils/format";

interface OrderBookTableProps {
  bids: BookLevel[];
  asks: BookLevel[];
}

/**
 * Renders bids and asks with a background bar sized to relative volume.
 * Bar widths are plain style values (not Animated) — React Native's layout
 * engine already animates width transitions smoothly enough at our ~100ms
 * update cadence via `LayoutAnimation` triggered once per snapshot in the
 * parent screen; adding per-cell Animated.Value here would be overkill for
 * a value that already redraws on every store update.
 */
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
  return (
    <View style={styles.row}>
      <View
        style={[
          styles.volumeBar,
          { width: `${widthPct}%` },
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
    color: "#a1a1aa",
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
    backgroundColor: "rgba(34,197,94,0.15)",
  },
  askBar: {
    backgroundColor: "rgba(239,68,68,0.15)",
  },
  priceText: {
    fontSize: 13,
    fontVariant: ["tabular-nums"],
  },
  bidText: {
    color: "#4ade80",
  },
  askText: {
    color: "#f87171",
  },
  qtyText: {
    fontSize: 13,
    color: "#d4d4d8",
    fontVariant: ["tabular-nums"],
  },
});
