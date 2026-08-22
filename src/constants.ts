// Cold-start fallback only. The authoritative list comes from GET /pairs
// (see src/hooks/usePairs.ts), which overwrites marketStore's
// supportedPairs once it resolves. This mirrors the backend's default
// PAIRS env var so the watchlist has something to render immediately,
// before the first REST response arrives.
export const SUPPORTED_PAIRS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "DOGEUSDT", "XRPUSDT"];
