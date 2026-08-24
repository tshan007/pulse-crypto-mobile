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
  // Seeded with the actual initial value (not `false`) so the crossfade
  // effect below doesn't fire on first mount when data is already
  // available — that would sweep the screen's whole initial layout
  // (including SafeAreaView's insets) into the animation, causing a
  // visible flash under the status bar/notch before it snaps into place.
  const hasDataRef = useRef(Boolean(pairState));
  usePairScope([pair]);

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

  // Crossfade the "Waiting for data…" ↔ DetailContent swap instead of an
  // abrupt cut — matters more now that pair-scoped subscriptions mean this
  // screen can briefly have no data right after navigating in.
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
