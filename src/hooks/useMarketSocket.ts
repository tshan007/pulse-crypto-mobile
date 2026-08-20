import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { config } from "../config";
import { useMarketStore } from "../store/marketStore";
import { useTelemetryStore } from "../store/telemetryStore";
import { ServerMessage } from "../types/market";
import { wsDebug } from "../utils/wsDebug";

/**
 * Owns the single WebSocket connection to the backend for the app's
 * lifetime. Mount this once near the app root (see App.tsx) — screens read
 * live data via `useMarketStore` selectors, they never touch the socket
 * directly.
 *
 * Reconnection: exponential backoff up to `reconnectMaxDelayMs`, mirroring
 * the backend's own backoff strategy toward Binance. Also reconnects
 * immediately when the app returns to the foreground, since backgrounded
 * sockets are often silently dropped by the OS.
 */
export function useMarketSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closedByUsRef = useRef(false);

  const applySnapshot = useMarketStore((s) => s.applySnapshot);
  const setSocketStatus = useMarketStore((s) => s.setSocketStatus);

  useEffect(() => {
    closedByUsRef.current = false;

    function scheduleReconnect() {
      reconnectAttemptRef.current += 1;
      const delay = Math.min(
        config.reconnectMaxDelayMs,
        config.reconnectBaseDelayMs * 2 ** Math.min(reconnectAttemptRef.current, 5)
      );
      setSocketStatus("reconnecting");
      reconnectTimerRef.current = setTimeout(connect, delay);
    }

    function connect() {
      if (closedByUsRef.current) return;
      if (reconnectAttemptRef.current === 0) setSocketStatus("connecting");
      const ws = new WebSocket(config.wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectAttemptRef.current = 0;
        setSocketStatus("open");
        wsDebug.open(config.wsUrl);
      };

      ws.onmessage = (event) => {
        useTelemetryStore.getState().recordMessage();
        try {
          const msg = JSON.parse(event.data) as ServerMessage;
          wsDebug.message(msg);
          if (msg.type === "snapshot") applySnapshot(msg.data);
        } catch (err) {
          wsDebug.parseError(err, String(event.data));
        }
      };

      ws.onerror = (event) => {
        wsDebug.error((event as any)?.message ?? "unknown error");
        // "close" fires right after for RN's WebSocket, which drives
        // reconnection — nothing additional to do here.
      };

      ws.onclose = (event) => {
        wsDebug.close(event.code, event.reason);
        setSocketStatus("closed");
        if (!closedByUsRef.current) scheduleReconnect();
      };
    }

    connect();

    const appStateSub = AppState.addEventListener("change", (state: AppStateStatus) => {
      if (state === "active" && wsRef.current?.readyState !== WebSocket.OPEN) {
        if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
        reconnectAttemptRef.current = 0;
        connect();
      }
    });

    return () => {
      closedByUsRef.current = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      wsRef.current?.close();
      appStateSub.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
