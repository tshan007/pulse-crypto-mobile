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

  // Mirrored from useMarketSocket's AppState listener.
  appState: AppStateStatus;
  setAppState: (s: AppStateStatus) => void;
}

/** Real WS message rate, FPS, and the data-throttling settings — single source of truth for `useMarketSocket` and the Settings/Telemetry screens. */
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
