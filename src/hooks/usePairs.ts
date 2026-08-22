import { useCallback, useEffect, useState } from "react";
import { fetchPairs } from "../api/pairs";
import { useMarketStore } from "../store/marketStore";

export function usePairs() {
  const setSupportedPairs = useMarketStore((s) => s.setSupportedPairs);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const pairs = await fetchPairs();
      setSupportedPairs(pairs);
    } catch (err) {
      // Keep the existing (constants.ts-seeded or previously fetched) list
      // on failure rather than clearing the watchlist.
      setError((err as Error).message);
    }
  }, [setSupportedPairs]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { error, refresh };
}
