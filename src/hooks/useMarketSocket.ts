import { useEffect, useMemo, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { decode } from "@msgpack/msgpack";
import { config } from "../config";
import { useMarketStore } from "../store/marketStore";
import { useTelemetryStore } from "../store/telemetryStore";
import { useSubscriptionStore } from "../store/subscriptionStore";
import { ClientMessage, ServerMessage } from "../types/market";
import { wsDebug } from "../utils/wsDebug";
import { computeAdaptiveIntervalMs } from "../utils/adaptivePolling";
import { useFrameRate } from "./useFrameRate";

/** Owns the app's single WebSocket connection: reconnect/backoff, the "configure" control channel, and FPS sampling. Mount once near the app root. */
export function useMarketSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closedByUsRef = useRef(false); // true = we closed it on purpose (unmount), so onclose shouldn't reconnect

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
        config.reconnectBaseDelayMs * 2 ** Math.min(reconnectAttemptRef.current, 5) // cap the exponent so it doesn't keep growing forever
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
        pairs: useSubscriptionStore.getState().pairScope,
      };
    }

    function connect() {
      if (closedByUsRef.current) return; // a stale reconnect timer could still fire after cleanup
      if (reconnectAttemptRef.current === 0) setSocketStatus("connecting"); // later attempts show "reconnecting" instead (set in scheduleReconnect)
      const ws = new WebSocket(config.wsUrl);
      ws.binaryType = "arraybuffer"; // so msgpack frames arrive as ArrayBuffer, not Blob
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectAttemptRef.current = 0;
        setSocketStatus("open");
        wsDebug.open(config.wsUrl);

        // Re-sync the fresh socket to the user's current settings (initial message).
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
          if (msg.type === "snapshot") applySnapshot(msg.data);//sets the marketStore.pairs state
        } catch (err) {
          wsDebug.parseError(err, typeof event.data === "string" ? event.data : "<binary>");
        }
      };

      ws.onerror = (event) => {
        wsDebug.error((event as any)?.message ?? "unknown error");
        // "close" fires right after and drives reconnection.
      };

      ws.onclose = (event) => {
        wsDebug.close(event.code, event.reason);
        setSocketStatus("closed");
        if (!closedByUsRef.current) scheduleReconnect(); // don't reconnect if we closed it ourselves
      };
    }

    connect();

    // Force a reconnect on foreground — the OS can silently drop a backgrounded socket without ever firing onclose.
    const appStateSub = AppState.addEventListener("change", (state: AppStateStatus) => {
      useTelemetryStore.getState().setAppState(state);
      if (state === "active" && wsRef.current?.readyState !== WebSocket.OPEN) {
        if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
        reconnectAttemptRef.current = 0;
        connect();
      }
    });

    return () => {
      closedByUsRef.current = true; // set before .close() so onclose sees it and skips reconnecting
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      wsRef.current?.close();
      appStateSub.remove();
    };
    // Runs once — the socket is managed imperatively via refs, not re-created on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-send "configure" (debounced) whenever a relevant setting changes.
  const updateIntervalMs = useTelemetryStore((s) => s.updateIntervalMs);
  const compressionEnabled = useTelemetryStore((s) => s.compressionEnabled);
  const adaptivePolling = useTelemetryStore((s) => s.adaptivePolling);
  const appState = useTelemetryStore((s) => s.appState);
  const pairScope = useSubscriptionStore((s) => s.pairScope);

  const effectiveIntervalMs = useMemo(
    () => (adaptivePolling ? computeAdaptiveIntervalMs(fps, appState) : updateIntervalMs),
    [adaptivePolling, fps, appState, updateIntervalMs]
  );

  useEffect(() => {
    // 200ms debounce so a slider drag or a pair-scope change sends one configure(), not one per step.
    const handle = setTimeout(() => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;
      const message: ClientMessage = {
        type: "configure",
        intervalMs: effectiveIntervalMs,
        format: compressionEnabled ? "msgpack" : "json",
        pairs: pairScope,
      };
      ws.send(JSON.stringify(message));//send the configure message to the server via the websocket when config/pair changes.
      wsDebug.configureSent(message);
    }, 200);
    return () => clearTimeout(handle);
  }, [effectiveIntervalMs, compressionEnabled, pairScope]);
}
