import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useMarketStore } from "../store/marketStore";
import { FlashingPrice } from "./FlashingPrice";
import { ConnectionDot } from "./ConnectionDot";
import { displayPairName, formatPercent, formatPrice } from "../utils/format";

interface WatchlistRowProps {
  pair: string;
  onPress: (pair: string) => void;
}

/**
 * Each row subscribes only to its own pair's slice of the store (and its
 * own favourite flag). A price tick for BTC updates `pairs.BTCUSDT`'s
 * object reference in the store; Zustand's selector equality check means
 * only the row selecting `pairs.BTCUSDT` re-renders — every other row's
 * selector returns the same reference as before and skips re-render
 * entirely. This is what keeps a 5-100ms tick rate cheap regardless of how
 * many rows are on screen.
 */
export const WatchlistRow = React.memo(function WatchlistRow({ pair, onPress }: WatchlistRowProps) {
  const pairState = useMarketStore((s) => s.pairs[pair]);
  const isFavourite = useMarketStore((s) => Boolean(s.favourites[pair]));
  const toggleFavourite = useMarketStore((s) => s.toggleFavourite);

  const handlePress = useCallback(() => onPress(pair), [onPress, pair]);
  const handleToggleFavourite = useCallback(() => toggleFavourite(pair), [toggleFavourite, pair]);

  const price = pairState?.price ?? null;
  const change24h = pairState?.change24h ?? null;
  const connected = pairState?.connected ?? false;

  const changeColor = change24h === null ? styles.neutral : change24h >= 0 ? styles.positive : styles.negative;

  return (
    <Pressable onPress={handlePress} style={styles.row}>
      <Pressable onPress={handleToggleFavourite} hitSlop={10} style={styles.star}>
        <Text style={isFavourite ? styles.starActive : styles.starInactive}>{isFavourite ? "★" : "☆"}</Text>
      </Pressable>

      <View style={styles.pairColumn}>
        <Text style={styles.pairName}>{displayPairName(pair)}</Text>
        <View style={styles.statusRow}>
          <ConnectionDot connected={connected} />
          <Text style={styles.statusText}>{connected ? "Live" : "Offline"}</Text>
        </View>
      </View>

      <View style={styles.priceColumn}>
        <FlashingPrice value={price} formatted={formatPrice(price)} style={styles.priceText} />
        <Text style={[styles.changeText, changeColor]}>{formatPercent(change24h)}</Text>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#27272a",
  },
  star: {
    width: 28,
    alignItems: "center",
  },
  starActive: {
    color: "#facc15",
    fontSize: 18,
  },
  starInactive: {
    color: "#52525b",
    fontSize: 18,
  },
  pairColumn: {
    flex: 1,
    marginLeft: 8,
  },
  pairName: {
    color: "#fafafa",
    fontSize: 16,
    fontWeight: "600",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 6,
  },
  statusText: {
    color: "#a1a1aa",
    fontSize: 12,
  },
  priceColumn: {
    alignItems: "flex-end",
  },
  priceText: {
    color: "#fafafa",
    fontSize: 16,
    fontWeight: "600",
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  changeText: {
    fontSize: 13,
    marginTop: 4,
  },
  positive: {
    color: "#22c55e",
  },
  negative: {
    color: "#ef4444",
  },
  neutral: {
    color: "#a1a1aa",
  },
});
