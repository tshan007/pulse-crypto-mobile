import React, { useEffect, useRef } from "react";
import { LayoutAnimation, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMarketStore } from "../store/marketStore";
import { displayPairName } from "../utils/format";
import { RootStackParamList } from "../navigation/types";
import { DetailContent } from "../components/DetailContent";
import { theme } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Detail">;

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.screenBackground,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.divider,
  },
  backButton: {
    width: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  backArrow: {
    color: theme.colors.textStrong,
    fontSize: 22,
  },
  headerTitle: {
    color: theme.colors.textStrong,
    fontSize: 17,
    fontWeight: "700",
  },
  loading: {
    color: theme.colors.textFaint,
    textAlign: "center",
    marginTop: 40,
  },
});
