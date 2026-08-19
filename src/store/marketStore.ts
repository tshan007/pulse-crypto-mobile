import { create } from "zustand";
import { PairMeta, PairState, SocketStatus } from "../types/market";
import { saveFavourites } from "./favouritesStorage";

interface MarketStoreState {
  pairs: Record<string, PairState>;
  meta: Record<string, PairMeta>;
  socketStatus: SocketStatus;
  favourites: Record<string, true>;
  favouritesHydrated: boolean;

  applySnapshot: (data: PairState[]) => void;
  setSocketStatus: (status: SocketStatus) => void;
  setMeta: (meta: PairMeta[]) => void;
  toggleFavourite: (pair: string) => void;
  hydrateFavourites: (pairs: string[]) => void;
}

/**
 * Central store for live market data.
 *
 * Performance note: components should always read via a narrow selector,
 * e.g. `useMarketStore(s => s.pairs[pair])`, never the whole `pairs` map.
 * Zustand only re-renders a component when the *selected* value's reference
 * changes. Since `applySnapshot` replaces only the entries that actually
 * changed (see below) and reuses the existing object reference for anything
 * unchanged, a tick that updates BTC's price does not cause ETH's row to
 * re-render — each row's selector return value stays referentially equal.
 */
export const useMarketStore = create<MarketStoreState>((set, get) => ({
  pairs: {},
  meta: {},
  socketStatus: "connecting",
  favourites: {},
  favouritesHydrated: false,

  applySnapshot: (data) => {
    const current = get().pairs;
    let changed = false;
    const next: Record<string, PairState> = { ...current };

    for (const incoming of data) {
      const existing = current[incoming.pair];
      // Skip the update entirely (keep the same object reference) if
      // nothing meaningful changed, so subscribed rows don't re-render.
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

  toggleFavourite: (pair) => {
    const favourites = { ...get().favourites };
    if (favourites[pair]) {
      delete favourites[pair];
    } else {
      favourites[pair] = true;
    }
    set({ favourites });
    saveFavourites(Object.keys(favourites));
  },

  hydrateFavourites: (pairs) => {
    const favourites: Record<string, true> = {};
    for (const p of pairs) favourites[p] = true;
    set({ favourites, favouritesHydrated: true });
  },
}));
