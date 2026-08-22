import { create } from "zustand";
import { AppStateStatus } from "react-native";

const WINDOW_MS = 5000; // rolling window used to compute msgs/sec

interface TelemetryState {
  messageTimestamps: number[];
  messagesPerSecond: number;
  recordMessage: () => void;
  recomputeRate: () => void;

  fps: number;
  setFps: (fps: number) => void;

  // Manual slider value — only actually used when adaptivePolling is false.
  updateIntervalMs: number;
  setUpdateIntervalMs: (ms: number) => void;

  compressionEnabled: boolean;
  setCompressionEnabled: (v: boolean) => void;

  adaptivePolling: boolean;
  setAdaptivePolling: (v: boolean) => void;

  // Mirrored from useMarketSocket's AppState listener so adaptive-polling
  // logic and the settings screen can both read it without a second
  // subscription.
  appState: AppStateStatus;
  setAppState: (s: AppStateStatus) => void;
}

/**
 * Tracks real WebSocket message arrivals so the telemetry screen can show
 * an actual ingestion rate, not a mocked number. `recordMessage()` is
 * called once per message inside `useMarketSocket`; `recomputeRate()` is
 * called on a timer by whichever screen is displaying the rate, so we're
 * not doing unnecessary work when nobody's looking at it.
 *
 * Also the single source of truth for the data-throttling settings
 * (`updateIntervalMs`/`compressionEnabled`/`adaptivePolling`) and the live
 * `fps`/`appState` signals that drive adaptive polling — read imperatively
 * from `useMarketSocket` (to build outgoing `configure` messages) and via
 * selectors from `TelemetrySettingsScreen`.
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

  fps: 60,
  setFps: (fps) => set({ fps }),

  updateIntervalMs: 250,
  setUpdateIntervalMs: (ms) => set({ updateIntervalMs: ms }),

  compressionEnabled: true,
  setCompressionEnabled: (v) => set({ compressionEnabled: v }),

  adaptivePolling: false,
  setAdaptivePolling: (v) => set({ adaptivePolling: v }),

  appState: "active",
  setAppState: (s) => set({ appState: s }),
}));
