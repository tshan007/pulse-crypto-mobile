import { create } from "zustand";
import { PairMeta, PairState, SocketStatus } from "../types/market";
import { saveFavorites } from "./favoritesStorage";
import { SUPPORTED_PAIRS } from "../constants";

interface MarketStoreState {
  pairs: Record<string, PairState>;
  meta: Record<string, PairMeta>;
  socketStatus: SocketStatus;
  favorites: Record<string, true>;
  favoritesHydrated: boolean;
  // Cold-start fallback; replaced with the backend's actual set once GET /pairs resolves.
  supportedPairs: string[];

  applySnapshot: (data: PairState[]) => void;
  setSocketStatus: (status: SocketStatus) => void;
  setMeta: (meta: PairMeta[]) => void;
  setSupportedPairs: (pairs: string[]) => void;
  toggleFavorite: (pair: string) => void;
  hydrateFavorites: (pairs: string[]) => void;
}

/** Central store for live market data. Read via a narrow selector (`s => s.pairs[pair]`), never the whole `pairs` map. */
export const useMarketStore = create<MarketStoreState>((set, get) => ({
  pairs: {},
  meta: {},
  socketStatus: "connecting",
  favorites: {},
  favoritesHydrated: false,
  supportedPairs: SUPPORTED_PAIRS,

  applySnapshot: (data) => {
    const current = get().pairs;
    let changed = false;
    const next: Record<string, PairState> = { ...current };

    for (const incoming of data) {
      const existing = current[incoming.pair];
      // Keep the same object reference if nothing meaningful changed, so subscribed rows don't re-render.
      if (
        existing &&
        existing.price === incoming.price &&
        existing.spread === incoming.spread &&
        existing.buyPressure === incoming.buyPressure &&
        existing.change24h === incoming.change24h &&
        existing.connected === incoming.connected &&
        existing.timestamp === incoming.timestamp
      ) {
        continue;
      }
      next[incoming.pair] = incoming;
      changed = true;
    }

    if (changed) set({ pairs: next });
  },

  setSocketStatus: (status) => set({ socketStatus: status }),

  setMeta: (metaList) => {
    const meta: Record<string, PairMeta> = {};
    for (const m of metaList) meta[m.pair] = m;
    set({ meta });
  },

  setSupportedPairs: (pairs) => set({ supportedPairs: pairs }),

  toggleFavorite: (pair) => {
    const favorites = { ...get().favorites };
    if (favorites[pair]) {
      delete favorites[pair];
    } else {
      favorites[pair] = true;
    }
    set({ favorites });
    saveFavorites(Object.keys(favorites));
  },

  hydrateFavorites: (pairs) => {
    const favorites: Record<string, true> = {};
    for (const p of pairs) favorites[p] = true;
    set({ favorites, favoritesHydrated: true });
  },
}));
