import { create } from "zustand";

export type PairScope = "all" | string[];

interface SubscriptionState {
  // Pairs the focused screen needs live data for; sent to the backend via useMarketSocket's "configure" message.
  pairScope: PairScope;
  setPairScope: (scope: PairScope) => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  pairScope: "all",
  setPairScope: (scope) => set({ pairScope: scope }),
}));
