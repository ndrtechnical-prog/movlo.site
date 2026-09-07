import { JsonMovie } from "./jsonMovies";

const STORAGE_KEY = "movlo_recently_watched_v2";

export function getStoredRecentlyWatched(): JsonMovie[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading recently watched:", err);
    return [];
  }
}

export function saveRecentlyWatched(movie: JsonMovie): JsonMovie[] {
  if (typeof window === "undefined") return [];
  try {
    const current = getStoredRecentlyWatched();
    // Filter out existing occurrence with same id or videoUrl
    const filtered = current.filter((m) => m.id !== movie.id && m.videoUrl !== movie.videoUrl);
    // Add new to beginning
    const updated = [movie, ...filtered].slice(0, 24);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error("Error saving recently watched:", err);
    return [];
  }
}
