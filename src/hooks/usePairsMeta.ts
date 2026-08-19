import { useCallback, useEffect, useState } from "react";
import { fetchPairsMeta } from "../api/pairsMeta";
import { useMarketStore } from "../store/marketStore";

export function usePairsMeta() {
  const setMeta = useMarketStore((s) => s.setMeta);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const meta = await fetchPairsMeta();
      setMeta(meta);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setRefreshing(false);
    }
  }, [setMeta]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { refreshing, error, refresh };
}
