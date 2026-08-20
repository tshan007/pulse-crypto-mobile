import { config } from "../config";
import { PairState, ServerMessage } from "../types/market";

/**
 * Compact, human-scannable log lines for WS traffic — deliberately not a
 * full JSON.stringify of every payload, since at a 100ms broadcast interval
 * that would scroll the terminal unreadably fast. Enable via
 * EXPO_PUBLIC_DEBUG_WS=true.
 */
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
    // Errors are always logged, debug flag or not — they're rare and
    // actionable, not noise.
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

  parseError(err: unknown, raw: string) {
    // Always logged — a malformed payload is a real bug, not noise.
    console.error("[ws] ✕ failed to parse message:", err, "\n  raw:", raw.slice(0, 200));
  },
};
