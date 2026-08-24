import { AppStateStatus } from "react-native";

// Reasonable defaults — tune based on real-device observation.
export const ADAPTIVE_BACKGROUND_INTERVAL_MS = 2000;
export const ADAPTIVE_LOW_FPS_INTERVAL_MS = 500;
export const ADAPTIVE_HEALTHY_INTERVAL_MS = 100;
export const ADAPTIVE_LOW_FPS_THRESHOLD = 45;

/** Backs off the update interval when backgrounded or when FPS is low. */
export function computeAdaptiveIntervalMs(fps: number, appState: AppStateStatus): number {
  if (appState !== "active") return ADAPTIVE_BACKGROUND_INTERVAL_MS;
  if (fps < ADAPTIVE_LOW_FPS_THRESHOLD) return ADAPTIVE_LOW_FPS_INTERVAL_MS;
  return ADAPTIVE_HEALTHY_INTERVAL_MS;
}
