// Mirrors the backend's default PAIRS env var. In a larger system this
// would come from the server (e.g. derived from the first /pairs/meta
// response), but a fixed, known set keeps the watchlist populated
// immediately on cold start, before the first REST/WS response arrives.
export const SUPPORTED_PAIRS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "DOGEUSDT", "XRPUSDT"];
