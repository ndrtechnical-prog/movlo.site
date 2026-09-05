import { useState, useEffect, useCallback } from "react";
import { Movie } from "../types";

const STORAGE_KEY = "movlo_my_watchlist";
const EVENT_KEY = "movlo_watchlist_updated";

/**
 * Safely read watchlist from browser storage
 */
export function getSavedWatchlist(): Movie[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Unable to read watchlist from localStorage:", err);
    return [];
  }
}

/**
 * Safely persist watchlist to browser storage and broadcast update
 */
export function saveWatchlist(movies: Movie[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
  } catch (err) {
    console.warn("Unable to save watchlist to localStorage:", err);
  }
  try {
    window.dispatchEvent(
      new CustomEvent(EVENT_KEY, {
        detail: { count: movies.length, movies }
      })
    );
  } catch {
    // Non-critical fallback
  }
}

/**
 * Check if a movie is already in the watchlist
 */
export function isMovieInWatchlist(movieId: number): boolean {
  const list = getSavedWatchlist();
  return list.some((m) => m.id === movieId);
}

/**
 * Add a movie to the watchlist (prepends to top)
 */
export function addMovieToWatchlist(movie: Movie): Movie[] {
  const current = getSavedWatchlist();
  const existingIdx = current.findIndex((m) => m.id === movie.id);

  // Normalize movie object to store necessary fields cleanly
  const normalizedMovie: Movie = {
    id: movie.id,
    title: movie.title,
    year: movie.year,
    poster: movie.poster,
    backdrop: movie.backdrop,
    rating: movie.rating,
    runtime: movie.runtime,
    genres: movie.genres,
    description: movie.description,
    usRating: movie.usRating,
    type: movie.type || "movie",
    trailer: movie.trailer,
    trailerThumbnail: movie.trailerThumbnail
  };

  let updated: Movie[];
  if (existingIdx >= 0) {
    // Already in list, move to top with latest data
    updated = [normalizedMovie, ...current.filter((m) => m.id !== movie.id)];
  } else {
    updated = [normalizedMovie, ...current];
  }

  saveWatchlist(updated);
  return updated;
}

/**
 * Remove a movie from the watchlist
 */
export function removeMovieFromWatchlist(movieId: number): Movie[] {
  const current = getSavedWatchlist();
  const updated = current.filter((m) => m.id !== movieId);
  saveWatchlist(updated);
  return updated;
}

/**
 * Toggle movie in watchlist
 */
export function toggleMovieWatchlist(movie: Movie): { inWatchlist: boolean; list: Movie[] } {
  const current = getSavedWatchlist();
  const exists = current.some((m) => m.id === movie.id);
  if (exists) {
    const list = removeMovieFromWatchlist(movie.id);
    return { inWatchlist: false, list };
  } else {
    const list = addMovieToWatchlist(movie);
    return { inWatchlist: true, list };
  }
}

/**
 * Clear all movies in watchlist
 */
export function clearSavedWatchlist(): void {
  saveWatchlist([]);
}

/**
 * React Hook for real-time synchronized Watchlist across all components
 */
export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<Movie[]>(() => getSavedWatchlist());

  // Re-sync whenever storage or custom event triggers
  useEffect(() => {
    const handleUpdate = () => {
      setWatchlist(getSavedWatchlist());
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setWatchlist(getSavedWatchlist());
      }
    };

    window.addEventListener(EVENT_KEY, handleUpdate);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(EVENT_KEY, handleUpdate);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const isInWatchlist = useCallback(
    (movieId: number) => watchlist.some((m) => m.id === movieId),
    [watchlist]
  );

  const add = useCallback((movie: Movie) => {
    const updated = addMovieToWatchlist(movie);
    setWatchlist(updated);
  }, []);

  const remove = useCallback((movieId: number) => {
    const updated = removeMovieFromWatchlist(movieId);
    setWatchlist(updated);
  }, []);

  const toggle = useCallback((movie: Movie) => {
    const res = toggleMovieWatchlist(movie);
    setWatchlist(res.list);
    return res.inWatchlist;
  }, []);

  const clear = useCallback(() => {
    clearSavedWatchlist();
    setWatchlist([]);
  }, []);

  return {
    watchlist,
    count: watchlist.length,
    isInWatchlist,
    addToWatchlist: add,
    removeFromWatchlist: remove,
    toggleWatchlist: toggle,
    clearWatchlist: clear
  };
}
