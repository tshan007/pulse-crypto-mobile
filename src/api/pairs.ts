import { config } from "../config";

export async function fetchPairs(): Promise<string[]> {
  const res = await fetch(`${config.restBaseUrl}/pairs`, {
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) throw new Error(`Failed to fetch /pairs: ${res.status}`);
  return (await res.json()) as string[];
}
