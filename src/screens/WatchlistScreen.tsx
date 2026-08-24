import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { WatchlistRow } from "../components/watchlist/WatchlistRow";
import { ConnectionStatusBadge } from "../components/common/ConnectionStatusBadge";
import { useMarketStore } from "../store/marketStore";
import { usePairsMeta } from "../hooks/usePairsMeta";
import { usePairScope } from "../hooks/usePairScope";
import { displayPairName } from "../utils/format";
import { RootStackParamList } from "../navigation/types";
import { theme } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Watchlist">;

export function WatchlistScreen({ navigation }: Props) {
  const [query, setQuery] = useState("");
  const favorites = useMarketStore((s) => s.favorites);
  const socketStatus = useMarketStore((s) => s.socketStatus);
  const supportedPairs = useMarketStore((s) => s.supportedPairs);
  const { refreshing, refresh } = usePairsMeta();
  usePairScope("all");

  const listRef = useRef<FlashListRef<string>>(null);
  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, []);

  const filteredPairs = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = q
      ? supportedPairs.filter(
          (p) => p.toLowerCase().includes(q) || displayPairName(p).toLowerCase().includes(q)
        )
      : supportedPairs;

    // Favorites first, stable order otherwise.
    return [...matches].sort((a, b) => {
      const favA = favorites[a] ? 1 : 0;
      const favB = favorites[b] ? 1 : 0;
      return favB - favA;
    });
  }, [query, favorites, supportedPairs]);

  const handleOpenDetail = useCallback(
    (pair: string) => navigation.navigate("Detail", { pair }),
    [navigation]
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Text style={styles.title}>PulseCrypto</Text>
        <ConnectionStatusBadge status={socketStatus} />
      </View>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search..."
        placeholderTextColor={theme.colors.textFaint}
        style={styles.search}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <FlashList<string>
        ref={listRef}
        data={filteredPairs}
        keyExtractor={(item) => item}
        renderItem={({ item }) => <WatchlistRow pair={item} onPress={handleOpenDetail} />}
        refreshing={refreshing}
        onRefresh={refresh}
        // Doubled from the 250dp default to cut blank cells on fast scrolls.
        drawDistance={500}
        ListEmptyComponent={<Text style={styles.empty}>No pairs match "{query}"</Text>}
      />
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    color: theme.colors.textStrong,
    fontSize: 22,
    fontWeight: "700",
  },
  search: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 10,
    color: theme.colors.textStrong,
    fontSize: 15,
  },
  empty: {
    color: theme.colors.textFaint,
    textAlign: "center",
    marginTop: 40,
  },
});
