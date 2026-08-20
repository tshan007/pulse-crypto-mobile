import React, { useEffect, useRef } from "react";
import {
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMarketStore } from "../store/marketStore";
import { FlashingPrice } from "../components/FlashingPrice";
import { OrderBookTable } from "../components/OrderBookTable";
import { ConnectionDot } from "../components/ConnectionDot";
import { displayPairName, formatPrice, formatTimestamp } from "../utils/format";
import { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Detail">;

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function DetailScreen({ route, navigation }: Props) {
  const { pair } = route.params;
  const pairState = useMarketStore((s) => s.pairs[pair]);
  const meta = useMarketStore((s) => s.meta[pair]);
  const lastBidsRef = useRef<string>("");

  // Animate order book volume-bar changes smoothly, per spec, without
  // needing an Animated.Value per row — LayoutAnimation batches the visual
  // transition for the whole re-layout triggered by new bid/ask data.
  useEffect(() => {
    if (!pairState) return;
    const signature = JSON.stringify([pairState.bids, pairState.asks]);
    if (lastBidsRef.current && lastBidsRef.current !== signature) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    lastBidsRef.current = signature;
  }, [pairState]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{displayPairName(pair)}</Text>
        <View style={styles.backButton} />
      </View>

      {!pairState ? (
        <Text style={styles.loading}>Waiting for data…</Text>
      ) : (
        <DetailContent pairState={pairState} meta={meta} />
      )}
    </SafeAreaView>
  );
}

function DetailContent({
  pairState,
  meta,
}: {
  pairState: NonNullable<ReturnType<typeof useMarketStore.getState>["pairs"][string]>;
  meta: ReturnType<typeof useMarketStore.getState>["meta"][string] | undefined;
}) {
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function PressureBar({ buyPressure, sellPressure }: { buyPressure: number | null; sellPressure: number | null }) {
  const buy = buyPressure ?? 50;
  const sell = sellPressure ?? 50;
  return (
    <View>
      <View style={styles.pressureBarTrack}>
        <View style={[styles.pressureBarFill, { width: `${buy}%`, backgroundColor: "#22c55e" }]} />
      </View>
      <View style={styles.pressureLabels}>
        <Text style={styles.pressureLabelBuy}>Buy {buy.toFixed(0)}%</Text>
        <Text style={styles.pressureLabelSell}>Sell {sell.toFixed(0)}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090b",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#27272a",
  },
  backButton: {
    width: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  backArrow: {
    color: "#fafafa",
    fontSize: 22,
  },
  headerTitle: {
    color: "#fafafa",
    fontSize: 17,
    fontWeight: "700",
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 20,
  },
  loading: {
    color: "#71717a",
    textAlign: "center",
    marginTop: 40,
  },
  priceRow: {
    alignItems: "center",
    gap: 8,
  },
  priceText: {
    color: "#fafafa",
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
    color: "#a1a1aa",
    fontSize: 13,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#18181b",
    borderRadius: 12,
    padding: 14,
  },
  metric: {
    alignItems: "center",
    flex: 1,
  },
  metricLabel: {
    color: "#71717a",
    fontSize: 12,
    marginBottom: 4,
  },
  metricValue: {
    color: "#fafafa",
    fontSize: 15,
    fontWeight: "600",
  },
  sectionTitle: {
    color: "#d4d4d8",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
  },
  pressureSection: {},
  pressureBarTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(239,68,68,0.35)",
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
    color: "#4ade80",
    fontSize: 12,
  },
  pressureLabelSell: {
    color: "#f87171",
    fontSize: 12,
  },
  orderBookSection: {},
  timestamp: {
    color: "#52525b",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 12,
  },
});
