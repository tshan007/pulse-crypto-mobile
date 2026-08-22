import { Platform } from "react-native";

// Android emulator can't reach the host machine via localhost — it needs the
// special 10.0.2.2 alias. iOS simulator and web can use localhost directly.
// Override with EXPO_PUBLIC_BACKEND_HOST if running against a physical
// device or a non-default backend location.
const DEFAULT_HOST = Platform.select({
  android: "10.0.2.2",
  default: "localhost",
});

const HOST = process.env.EXPO_PUBLIC_BACKEND_HOST ?? DEFAULT_HOST;
const PORT = process.env.EXPO_PUBLIC_BACKEND_PORT ?? "8080";
// Set EXPO_PUBLIC_BACKEND_SECURE=true for any backend served over TLS (uat/prd) —
// local dev's plain-HTTP backend leaves this unset.
const SECURE = process.env.EXPO_PUBLIC_BACKEND_SECURE === "true";

export const config = {
  wsUrl: `${SECURE ? "wss" : "ws"}://${HOST}:${PORT}/ws`,
  restBaseUrl: `${SECURE ? "https" : "http"}://${HOST}:${PORT}`,
  // Reconnect backoff schedule for the WS client, mirrors the backend's.
  reconnectBaseDelayMs: 1000,
  reconnectMaxDelayMs: 30000,
  // How long a price-change flash highlight stays visible.
  flashDurationMs: 600,
  // Set EXPO_PUBLIC_DEBUG_WS=true to log every WS lifecycle event and
  // message summary to the Metro/Expo terminal. Off by default since at a
  // 100ms broadcast interval it would otherwise flood the console.
  debugWs: process.env.EXPO_PUBLIC_DEBUG_WS === "true",
};
