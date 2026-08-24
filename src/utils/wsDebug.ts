import { config } from "../config";
import { ClientMessage, PairState, ServerMessage } from "../types/market";

/** Compact log lines for WS traffic — not a full JSON.stringify, too noisy at a 100ms interval. Enable via EXPO_PUBLIC_DEBUG_WS=true. */
export const wsDebug = {
  open(url: string) {
    if (!config.debugWs) return;
    console.log(`[ws] ▲ open  ${url}`);
  },

  close(code: number, reason: string) {
    if (!config.debugWs) return;
    console.log(`[ws] ▼ close code=${code} reason="${reason}"`);
  },

  error(message: string) {
    // Always logged, debug flag or not — rare and actionable.
    console.warn(`[ws] ✕ error: ${message}`);
  },

  message(msg: ServerMessage) {
    if (!config.debugWs) return;
    if (msg.type !== "snapshot") {
      console.log(`[ws] ◆ ${msg.type}`, msg);
      return;
    }
    const summary = msg.data
      .map((p: PairState) => `${p.pair}=${p.price ?? "—"}${p.connected ? "" : "(offline)"}`)
      .join(" ");
    console.log(`[ws] ◆ snapshot (${msg.data.length}) ${summary}`);
  },

  configureSent(msg: ClientMessage) {
    if (!config.debugWs) return;
    const pairs = msg.pairs === undefined ? "(unchanged)" : msg.pairs === "all" ? "all" : `[${msg.pairs.join(",")}]`;
    console.log(
      `[ws] ▶ configure format=${msg.format ?? "(unchanged)"} intervalMs=${msg.intervalMs ?? "(unchanged)"} pairs=${pairs}`
    );
  },

  parseError(err: unknown, raw: string) {
    // Always logged — a malformed payload is a real bug, not noise.
    console.error("[ws] ✕ failed to parse message:", err, "\n  raw:", raw.slice(0, 200));
  },
};
