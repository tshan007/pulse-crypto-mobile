import { useEffect } from "react";
import { useMarketStore } from "../store/marketStore";
import { loadFavorites } from "../store/favoritesStorage";

export function useFavoritesHydration() {
  const hydrateFavorites = useMarketStore((s) => s.hydrateFavorites);

  useEffect(() => {
    let cancelled = false;
    loadFavorites().then((pairs) => {
      if (!cancelled) hydrateFavorites(pairs);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
