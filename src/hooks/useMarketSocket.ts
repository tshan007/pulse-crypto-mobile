import { useEffect, useMemo, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { decode } from "@msgpack/msgpack";
import { config } from "../config";
import { useMarketStore } from "../store/marketStore";
import { useTelemetryStore } from "../store/telemetryStore";
import { ClientMessage, ServerMessage } from "../types/market";
import { wsDebug } from "../utils/wsDebug";
import { computeAdaptiveIntervalMs } from "../utils/adaptivePolling";
import { useFrameRate } from "./useFrameRate";

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
 *
 * Also owns the client->server "configure" control channel: on open (and
 * whenever the user changes a data-throttling setting) it sends the
 * backend our desired broadcast cadence and wire format (json/msgpack).
 * FPS sampling lives here too (not in the settings screen) so there's a
 * single requestAnimationFrame loop feeding both the adaptive-interval
 * calculation and the RingGauge display, mirrored into telemetryStore.
 */
export function useMarketSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closedByUsRef = useRef(false);

  const applySnapshot = useMarketStore((s) => s.applySnapshot);
  const setSocketStatus = useMarketStore((s) => s.setSocketStatus);

  const fps = useFrameRate();
  useEffect(() => {
    useTelemetryStore.getState().setFps(fps);
  }, [fps]);

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

    function buildConfigureMessage(): ClientMessage {
      const state = useTelemetryStore.getState();
      const intervalMs = state.adaptivePolling
        ? computeAdaptiveIntervalMs(state.fps, state.appState)
        : state.updateIntervalMs;
      return {
        type: "configure",
        intervalMs,
        format: state.compressionEnabled ? "msgpack" : "json",
      };
    }

    function connect() {
      if (closedByUsRef.current) return;
      if (reconnectAttemptRef.current === 0) setSocketStatus("connecting");
      const ws = new WebSocket(config.wsUrl);
      ws.binaryType = "arraybuffer";
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectAttemptRef.current = 0;
        setSocketStatus("open");
        wsDebug.open(config.wsUrl);

        // Re-sync a fresh (or reconnected) socket to whatever the user has
        // currently configured, rather than defaulting back to json/base tick.
        const message = buildConfigureMessage();
        ws.send(JSON.stringify(message));
        wsDebug.configureSent(message);
      };

      ws.onmessage = (event) => {
        useTelemetryStore.getState().recordMessage();
        try {
          const msg: ServerMessage =
            typeof event.data === "string"
              ? (JSON.parse(event.data) as ServerMessage)
              : (decode(new Uint8Array(event.data as ArrayBuffer)) as ServerMessage);
          wsDebug.message(msg);
          if (msg.type === "snapshot") applySnapshot(msg.data);
        } catch (err) {
          wsDebug.parseError(err, typeof event.data === "string" ? event.data : "<binary>");
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
      useTelemetryStore.getState().setAppState(state);
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

  // Re-send "configure" (debounced) whenever a relevant setting changes, so
  // toggling compression/adaptive-polling or dragging the slider takes
  // effect on the live connection without reconnecting.
  const updateIntervalMs = useTelemetryStore((s) => s.updateIntervalMs);
  const compressionEnabled = useTelemetryStore((s) => s.compressionEnabled);
  const adaptivePolling = useTelemetryStore((s) => s.adaptivePolling);
  const appState = useTelemetryStore((s) => s.appState);

  const effectiveIntervalMs = useMemo(
    () => (adaptivePolling ? computeAdaptiveIntervalMs(fps, appState) : updateIntervalMs),
    [adaptivePolling, fps, appState, updateIntervalMs]
  );

  useEffect(() => {
    // Dragging ThrottleSlider fires onValueChange continuously in 10ms
    // steps — debounce so a drag gesture sends one configure(), not one
    // per step.
    const handle = setTimeout(() => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;
      const message: ClientMessage = {
        type: "configure",
        intervalMs: effectiveIntervalMs,
        format: compressionEnabled ? "msgpack" : "json",
      };
      ws.send(JSON.stringify(message));
      wsDebug.configureSent(message);
    }, 200);
    return () => clearTimeout(handle);
  }, [effectiveIntervalMs, compressionEnabled]);
}
