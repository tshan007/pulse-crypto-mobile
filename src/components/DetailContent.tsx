import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { PairMeta, PairState } from "../types/market";
import { theme } from "../theme";
import { FlashingPrice } from "./FlashingPrice";
import { OrderBookTable } from "./OrderBookTable";
import { ConnectionDot } from "./ConnectionDot";
import { Metric } from "./Metric";
import { PressureBar } from "./PressureBar";
import { formatPrice, formatTimestamp } from "../utils/format";

interface DetailContentProps {
  pairState: PairState;
  meta: PairMeta | undefined;
}

export function DetailContent({ pairState, meta }: DetailContentProps) {
  const { price, spread, buyPressure, sellPressure, bids, asks, connected, timestamp } = pairState;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.priceRow}>
        <FlashingPrice value={price} formatted={formatPrice(price)} style={styles.priceText} />
        <View style={styles.statusRow}>
          <ConnectionDot connected={connected} />
          <Text style={styles.statusText}>{connected ? "Live" : "Offline"}</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <Metric label="Spread" value={spread !== null ? formatPrice(spread) : "—"} />
        <Metric label="24h High" value={meta?.high24h !== undefined ? formatPrice(meta.high24h) : "—"} />
        <Metric label="24h Low" value={meta?.low24h !== undefined ? formatPrice(meta.low24h) : "—"} />
      </View>

      <View style={styles.pressureSection}>
        <Text style={styles.sectionTitle}>Buy / sell pressure</Text>
        <PressureBar buyPressure={buyPressure} sellPressure={sellPressure} />
      </View>

      <View style={styles.orderBookSection}>
        <Text style={styles.sectionTitle}>Order book</Text>
        <OrderBookTable bids={bids} asks={asks} />
      </View>

      <Text style={styles.timestamp}>Last updated {formatTimestamp(timestamp)}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 20,
  },
  priceRow: {
    alignItems: "center",
    gap: 8,
  },
  priceText: {
    color: theme.colors.textStrong,
    fontSize: 34,
    fontWeight: "700",
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusText: {
    color: theme.colors.textDim,
    fontSize: 13,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 12,
    padding: 14,
  },
  sectionTitle: {
    color: theme.colors.textDefault,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
  },
  pressureSection: {},
  orderBookSection: {},
  timestamp: {
    color: theme.colors.textFaintest,
    fontSize: 12,
    textAlign: "center",
    marginBottom: 12,
  },
});
