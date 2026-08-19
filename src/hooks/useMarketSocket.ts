import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { config } from "../config";
import { useMarketStore } from "../store/marketStore";
import { ServerMessage } from "../types/market";

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
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as ServerMessage;
          if (msg.type === "snapshot") applySnapshot(msg.data);
        } catch (err) {
          console.error("[ws] failed to parse message", err);
        }
      };

      ws.onerror = () => {
        // "close" fires right after for RN's WebSocket, which drives
        // reconnection — nothing additional to do here.
      };

      ws.onclose = () => {
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
