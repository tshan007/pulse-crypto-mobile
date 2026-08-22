import { AppStateStatus } from "react-native";

// Reasonable defaults, not hard requirements — tune based on real-device
// observation.
export const ADAPTIVE_BACKGROUND_INTERVAL_MS = 2000;
export const ADAPTIVE_LOW_FPS_INTERVAL_MS = 500;
export const ADAPTIVE_HEALTHY_INTERVAL_MS = 100;
export const ADAPTIVE_LOW_FPS_THRESHOLD = 45;

/**
 * Backgrounded: no point pushing frequent updates nobody can see. Foregrounded
 * but the JS thread is struggling (low FPS): back off so we're not adding more
 * work to an already-busy thread. Otherwise: as fast as the data actually
 * updates (matches the backend's own base broadcast tick).
 */
export function computeAdaptiveIntervalMs(fps: number, appState: AppStateStatus): number {
  if (appState !== "active") return ADAPTIVE_BACKGROUND_INTERVAL_MS;
  if (fps < ADAPTIVE_LOW_FPS_THRESHOLD) return ADAPTIVE_LOW_FPS_INTERVAL_MS;
  return ADAPTIVE_HEALTHY_INTERVAL_MS;
}
