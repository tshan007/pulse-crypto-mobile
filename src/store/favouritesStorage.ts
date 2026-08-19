import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVOURITES_KEY = "pulsecrypto:favourites";

export async function loadFavourites(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(FAVOURITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("[favourites] failed to load", err);
    return [];
  }
}

export async function saveFavourites(pairs: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(FAVOURITES_KEY, JSON.stringify(pairs));
  } catch (err) {
    console.error("[favourites] failed to save", err);
  }
}
