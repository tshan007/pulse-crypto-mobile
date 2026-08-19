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
  displayName: string;
  tradingStatus: "TRADING" | "BREAK" | "UNKNOWN";
  high24h: number | null;
  low24h: number | null;
  volume24h: number | null;
}

export type ServerMessage =
  | { type: "snapshot"; data: PairState[] }
  | { type: "connection"; pair: string; connected: boolean };

export type SocketStatus = "connecting" | "open" | "closed" | "reconnecting";
