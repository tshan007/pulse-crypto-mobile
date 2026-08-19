import { config } from "../config";
import { PairMeta } from "../types/market";

export async function fetchPairsMeta(): Promise<PairMeta[]> {
  const res = await fetch(`${config.restBaseUrl}/pairs/meta`, {
    // Keep this snappy — pull-to-refresh shouldn't hang indefinitely if the
    // backend is unreachable.
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) throw new Error(`Failed to fetch /pairs/meta: ${res.status}`);
  return (await res.json()) as PairMeta[];
}
