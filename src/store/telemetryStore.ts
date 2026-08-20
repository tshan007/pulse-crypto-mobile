import { create } from "zustand";

const WINDOW_MS = 5000; // rolling window used to compute msgs/sec

interface TelemetryState {
  messageTimestamps: number[];
  messagesPerSecond: number;
  recordMessage: () => void;
  recomputeRate: () => void;
}

/**
 * Tracks real WebSocket message arrivals so the telemetry screen can show
 * an actual ingestion rate, not a mocked number. `recordMessage()` is
 * called once per message inside `useMarketSocket`; `recomputeRate()` is
 * called on a timer by whichever screen is displaying the rate, so we're
 * not doing unnecessary work when nobody's looking at it.
 */
export const useTelemetryStore = create<TelemetryState>((set, get) => ({
  messageTimestamps: [],
  messagesPerSecond: 0,

  recordMessage: () => {
    const now = Date.now();
    const trimmed = get().messageTimestamps.filter((t) => now - t < WINDOW_MS);
    trimmed.push(now);
    set({ messageTimestamps: trimmed });
  },

  recomputeRate: () => {
    const now = Date.now();
    const trimmed = get().messageTimestamps.filter((t) => now - t < WINDOW_MS);
    const rate = trimmed.length / (WINDOW_MS / 1000);
    set({ messageTimestamps: trimmed, messagesPerSecond: rate });
  },
}));
