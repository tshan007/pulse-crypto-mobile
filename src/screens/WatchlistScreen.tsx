import React, { useCallback, useMemo, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { WatchlistRow } from "../components/WatchlistRow";
import { ConnectionStatusBadge } from "../components/ConnectionStatusBadge";
import { useMarketStore } from "../store/marketStore";
import { usePairsMeta } from "../hooks/usePairsMeta";
import { SUPPORTED_PAIRS } from "../constants";
import { displayPairName } from "../utils/format";
import { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Watchlist">;

export function WatchlistScreen({ navigation }: Props) {
  const [query, setQuery] = useState("");
  const favourites = useMarketStore((s) => s.favourites);
  const socketStatus = useMarketStore((s) => s.socketStatus);
  const { refreshing, refresh } = usePairsMeta();

  const filteredPairs = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = q
      ? SUPPORTED_PAIRS.filter(
          (p) => p.toLowerCase().includes(q) || displayPairName(p).toLowerCase().includes(q)
        )
      : SUPPORTED_PAIRS;

    // Favourites first, stable order otherwise.
    return [...matches].sort((a, b) => {
      const favA = favourites[a] ? 1 : 0;
      const favB = favourites[b] ? 1 : 0;
      return favB - favA;
    });
  }, [query, favourites]);

  const handleOpenDetail = useCallback(
    (pair: string) => navigation.navigate("Detail", { pair }),
    [navigation]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>PulseCrypto</Text>
        <ConnectionStatusBadge status={socketStatus} />
      </View>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search..."
        placeholderTextColor="#71717a"
        style={styles.search}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <FlatList
        data={filteredPairs}
        keyExtractor={(item) => item}
        renderItem={({ item }) => <WatchlistRow pair={item} onPress={handleOpenDetail} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#fafafa" />
        }
        ListEmptyComponent={<Text style={styles.empty}>No pairs match "{query}"</Text>}
      />
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    color: "#fafafa",
    fontSize: 22,
    fontWeight: "700",
  },
  search: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#18181b",
    borderRadius: 10,
    color: "#fafafa",
    fontSize: 15,
  },
  empty: {
    color: "#71717a",
    textAlign: "center",
    marginTop: 40,
  },
});
