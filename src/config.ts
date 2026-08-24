import { Platform } from "react-native";

// Android emulator needs the 10.0.2.2 alias to reach the host machine; override with EXPO_PUBLIC_BACKEND_HOST otherwise.
const DEFAULT_HOST = Platform.select({
  android: "10.0.2.2",
  default: "localhost",
});

const HOST = process.env.EXPO_PUBLIC_BACKEND_HOST ?? DEFAULT_HOST;
const PORT = process.env.EXPO_PUBLIC_BACKEND_PORT ?? "8080";
// Set EXPO_PUBLIC_BACKEND_SECURE=true for a TLS backend (uat/prd); unset for local dev.
const SECURE = process.env.EXPO_PUBLIC_BACKEND_SECURE === "true";

export const config = {
  wsUrl: `${SECURE ? "wss" : "ws"}://${HOST}:${PORT}/ws`,
  restBaseUrl: `${SECURE ? "https" : "http"}://${HOST}:${PORT}`,
  // Reconnect backoff schedule for the WS client, mirrors the backend's.
  reconnectBaseDelayMs: 1000,
  reconnectMaxDelayMs: 30000,
  // How long a price-change flash highlight stays visible.
  flashDurationMs: 600,
  // EXPO_PUBLIC_DEBUG_WS=true logs WS lifecycle/messages; off by default (100ms interval would flood the console).
  debugWs: process.env.EXPO_PUBLIC_DEBUG_WS === "true",
};
