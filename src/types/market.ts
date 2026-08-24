export type BookLevel = [string, string]; // [price, quantity]

export interface PairState {
  pair: string;
  timestamp: number;
  price: number | null;
  spread: number | null;
  buyPressure: number | null;
  sellPressure: number | null;
  bids: BookLevel[];
  asks: BookLevel[];
  change24h: number | null;
  connected: boolean;
}

export interface PairMeta {
  pair: string;
  tradingStatus: "TRADING" | "BREAK" | "UNKNOWN";
  high24h: number | null;
  low24h: number | null;
  volume24h: number | null;
}

export type ServerMessage =
  | { type: "snapshot"; data: PairState[] }
  | { type: "connection"; pair: string; connected: boolean };

export type SocketStatus = "connecting" | "open" | "closed" | "reconnecting";

export type WireFormat = "json" | "msgpack";

// Outbound WebSocket control message. Sent at any point after connecting to
// change our own broadcast cadence and/or encoding without reconnecting.
// Always sent as JSON regardless of the negotiated data format — this
// channel is low-frequency and stays simple to debug.
export type ClientMessage = {
  type: "configure";
  intervalMs?: number;
  format?: WireFormat;
  // "all" = every tracked pair (default); an array (possibly empty) = only
  // those pairs. Lets the currently-focused screen scope down what the
  // backend bothers sending — e.g. a detail screen only needs its own pair,
  // and a screen with no pair data on it needs none at all.
  pairs?: "all" | string[];
};
