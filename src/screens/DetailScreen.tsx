import React, { useEffect, useRef } from "react";
import { LayoutAnimation, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMarketStore } from "../store/marketStore";
import { usePairScope } from "../hooks/usePairScope";
import { displayPairName } from "../utils/format";
import { RootStackParamList } from "../navigation/types";
import { DetailContent } from "../components/detail/DetailContent";
import { theme } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Detail">;

export function DetailScreen({ route, navigation }: Props) {
  const { pair } = route.params;
  const pairState = useMarketStore((s) => s.pairs[pair]);
  const meta = useMarketStore((s) => s.meta[pair]);
  const lastBidsRef = useRef<string>("");
  // Seeded with the real initial value, not `false` — otherwise the crossfade below fires on first mount and flashes the status-bar/notch area.
  const hasDataRef = useRef(Boolean(pairState));
  usePairScope([pair]);

  // Smooth the order-book re-layout on new bid/ask data.
  useEffect(() => {
    if (!pairState) return;
    const signature = JSON.stringify([pairState.bids, pairState.asks]);
    if (lastBidsRef.current && lastBidsRef.current !== signature) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    lastBidsRef.current = signature;
  }, [pairState]);

  // Crossfade the "Waiting for data…" ↔ DetailContent swap.
  useEffect(() => {
    if (Boolean(pairState) === hasDataRef.current) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    hasDataRef.current = Boolean(pairState);
  }, [pairState]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backButton}>
          <Text style={styles.backArrow}>{'<'}</Text>
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
    paddingLeft: 8,
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
