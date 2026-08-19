import { useEffect } from "react";
import { useMarketStore } from "../store/marketStore";
import { loadFavourites } from "../store/favouritesStorage";

export function useFavouritesHydration() {
  const hydrateFavourites = useMarketStore((s) => s.hydrateFavourites);

  useEffect(() => {
    let cancelled = false;
    loadFavourites().then((pairs) => {
      if (!cancelled) hydrateFavourites(pairs);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
