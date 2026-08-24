import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVORITES_KEY = "pulsecrypto:favorites";

export async function loadFavorites(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("[favorites] failed to load", err);
    return [];
  }
}

export async function saveFavorites(pairs: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(pairs));
  } catch (err) {
    console.error("[favorites] failed to save", err);
  }
}
