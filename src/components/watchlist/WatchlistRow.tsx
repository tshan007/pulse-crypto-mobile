import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useMarketStore } from "../../store/marketStore";
import { FlashingPrice } from "../common/FlashingPrice";
import { ConnectionDot } from "../common/ConnectionDot";
import { displayPairName, formatPercent, formatPrice } from "../../utils/format";
import { theme } from "../../theme";

interface WatchlistRowProps {
  pair: string;
  onPress: (pair: string) => void;
}

/**
 * Each row subscribes only to its own pair's slice of the store (and its
 * own favorite flag). A price tick for BTC updates `pairs.BTCUSDT`'s
 * object reference in the store; Zustand's selector equality check means
 * only the row selecting `pairs.BTCUSDT` re-renders — every other row's
 * selector returns the same reference as before and skips re-render
 * entirely. This is what keeps a 5-100ms tick rate cheap regardless of how
 * many rows are on screen.
 */
export const WatchlistRow = React.memo(function WatchlistRow({ pair, onPress }: WatchlistRowProps) {
  const pairState = useMarketStore((s) => s.pairs[pair]);
  const isFavorite = useMarketStore((s) => Boolean(s.favorites[pair]));
  const toggleFavorite = useMarketStore((s) => s.toggleFavorite);
  // pairState.connected is the backend's last-reported per-pair status —
  // it only updates on an incoming snapshot, so it goes stale once our own
  // socket drops. Gate it on socketStatus too so the dot flips to offline
  // immediately on error/close instead of showing the last good value.
  const socketStatus = useMarketStore((s) => s.socketStatus);

  const handlePress = useCallback(() => onPress(pair), [onPress, pair]);
  const handleToggleFavorite = useCallback(() => toggleFavorite(pair), [toggleFavorite, pair]);

  const price = pairState?.price ?? null;
  const change24h = pairState?.change24h ?? null;
  const connected = socketStatus === "open" && (pairState?.connected ?? false);

  const changeColor = change24h === null ? styles.neutral : change24h >= 0 ? styles.positive : styles.negative;

  return (
    <Pressable onPress={handlePress} style={styles.row}>
      <Pressable onPress={handleToggleFavorite} hitSlop={10} style={styles.star}>
        <Text style={isFavorite ? styles.starActive : styles.starInactive}>{isFavorite ? "★" : "☆"}</Text>
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
    borderBottomColor: theme.colors.divider,
  },
  star: {
    width: 28,
    alignItems: "center",
  },
  starActive: {
    color: theme.colors.favorite,
    fontSize: 18,
  },
  starInactive: {
    color: theme.colors.textFaintest,
    fontSize: 18,
  },
  pairColumn: {
    flex: 1,
    marginLeft: 8,
  },
  pairName: {
    color: theme.colors.textStrong,
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
    color: theme.colors.textDim,
    fontSize: 12,
  },
  priceColumn: {
    alignItems: "flex-end",
  },
  priceText: {
    color: theme.colors.textStrong,
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
    color: theme.colors.success,
  },
  negative: {
    color: theme.colors.danger,
  },
  neutral: {
    color: theme.colors.textDim,
  },
});
