/**
 * Poster & Thumbnail Cache Manager for Movlo.site
 * Interfaces with Service Worker to monitor cached image count, pre-warm posters,
 * and provide ultra-fast instant rendering for returning visitors.
 */

import { useState, useEffect } from "react";

export interface CacheStats {
  isServiceWorkerReady: boolean;
  cachedImagesCount: number;
  maxImages: number;
}

let cachedStats: CacheStats = {
  isServiceWorkerReady: false,
  cachedImagesCount: 0,
  maxImages: 250
};

const listeners = new Set<(stats: CacheStats) => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener({ ...cachedStats }));
}

// Initialize listener for Service Worker messages
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data && event.data.type === "CACHE_STATS_RESPONSE") {
      cachedStats = {
        isServiceWorkerReady: true,
        cachedImagesCount: event.data.cachedImagesCount || 0,
        maxImages: event.data.maxImages || 250
      };
      notifyListeners();
    } else if (event.data && event.data.type === "IMAGE_CACHE_CLEARED") {
      cachedStats = {
        ...cachedStats,
        cachedImagesCount: 0
      };
      notifyListeners();
    }
  });

  // Query stats once service worker is active
  navigator.serviceWorker.ready.then((reg) => {
    cachedStats.isServiceWorkerReady = true;
    notifyListeners();
    requestCacheStats();
  });
}

/**
 * Request cache stats from the active Service Worker
 */
export function requestCacheStats(): void {
  if (typeof window === "undefined" || !navigator.serviceWorker?.controller) return;
  try {
    navigator.serviceWorker.controller.postMessage({ type: "GET_CACHE_STATS" });
  } catch (e) {
    // ignore
  }
}

/**
 * Preload an array of poster or thumbnail image URLs into service worker cache
 */
export function preloadPosterImages(urls: string[]): void {
  if (typeof window === "undefined" || !urls || urls.length === 0) return;
  const validUrls = urls.filter((u) => u && typeof u === "string" && !u.startsWith("data:"));
  if (validUrls.length === 0) return;

  if (navigator.serviceWorker?.controller) {
    try {
      navigator.serviceWorker.controller.postMessage({
        type: "PRELOAD_IMAGE_URLS",
        urls: validUrls
      });
    } catch (e) {
      // fallback to browser Image constructor
    }
  }

  // Fallback / complement: warm browser cache in idle callback
  const warmIdle = window.requestIdleCallback || ((cb) => setTimeout(cb, 100));
  warmIdle(() => {
    validUrls.slice(0, 12).forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  });
}

/**
 * Clear cached images on user request
 */
export function clearImageCache(): void {
  if (typeof window === "undefined") return;
  if (navigator.serviceWorker?.controller) {
    try {
      navigator.serviceWorker.controller.postMessage({ type: "CLEAR_IMAGE_CACHE" });
    } catch (e) {
      // ignore
    }
  }
  if ("caches" in window) {
    caches.delete("movlo-posters-v2").then(() => {
      cachedStats.cachedImagesCount = 0;
      notifyListeners();
    });
  }
}

/**
 * React hook for components to display cache status or trigger cache updates
 */
export function usePosterCacheStats(): CacheStats {
  const [stats, setStats] = useState<CacheStats>({ ...cachedStats });

  useEffect(() => {
    listeners.add(setStats);
    requestCacheStats();
    return () => {
      listeners.delete(setStats);
    };
  }, []);

  return stats;
}
