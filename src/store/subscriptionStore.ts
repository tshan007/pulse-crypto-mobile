import { create } from "zustand";

export type PairScope = "all" | string[];

interface SubscriptionState {
  // Which pairs the currently-focused screen actually needs live data for.
  // useMarketSocket sends this to the backend via the "configure" control
  // message, so screens that don't render pair data (Settings/Telemetry)
  // don't pay the cost of receiving/processing it, and a detail screen only
  // pays for its own pair instead of every tracked pair.
  pairScope: PairScope;
  setPairScope: (scope: PairScope) => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  pairScope: "all",
  setPairScope: (scope) => set({ pairScope: scope }),
}));
