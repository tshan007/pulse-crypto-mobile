export function formatPrice(value: number | null, pair?: string): string {
  if (value === null) return "—";
  // Low-priced assets (DOGE, XRP-ish) need more decimals to be meaningful.
  const decimals = value < 10 ? 4 : value < 1000 ? 2 : 2;
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPercent(value: number | null): string {
  if (value === null) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatQuantity(value: string): string {
  const n = Number(value);
  if (n < 1) return n.toFixed(4);
  return n.toFixed(3);
}

export function displayPairName(pair: string): string {
  // "BTCUSDT" -> "BTC / USDT"
  const match = pair.match(/^([A-Z0-9]+)(USDT)$/);
  if (!match) return pair;
  return `${match[1]} / ${match[2]}`;
}

export function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString(undefined, { hour12: false });
}
