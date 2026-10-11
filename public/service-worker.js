// Movlo Movies High-Performance Service Worker
// Strategy: Dedicated caching for movie posters, thumbnails, catalog data & PWA app shell
const STATIC_CACHE = 'movlo-static-v2';
const IMAGE_CACHE = 'movlo-posters-v2';
const CATALOG_CACHE = 'movlo-catalog-v2';

// Keep max 250 images cached to balance instant loading with device storage
const MAX_CACHED_IMAGES = 250;

// Essential core assets precached on installation
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/falcon-icon.jpg',
  '/icon-192.png',
  '/icon-512.png',
  '/movlo-share-poster.jpg',
  '/movie-placeholder.svg',
  '/data/english-movies.json',
  '/data/indian-movies.json',
  '/data/chinese-movies.json',
  '/data/dramas-movies.json',
  '/data/historical-movies.json'
];

// Helper: Detect if a request is for an image, poster, or video thumbnail
function isImageRequest(request, url) {
  if (request.destination === 'image') return true;
  const path = url.pathname.toLowerCase();
  if (/\.(jpg|jpeg|png|webp|avif|svg|gif|ico)(\?.*)?$/i.test(path)) return true;
  
  // Movie poster and thumbnail CDNs
  const host = url.hostname.toLowerCase();
  if (
    host.includes('ytimg.com') ||
    host.includes('youtube.com') ||
    host.includes('tmdb.org') ||
    host.includes('unsplash.com') ||
    host.includes('image.')
  ) {
    return true;
  }
  return false;
}

// Helper: Exclude advertising networks, analytics, and dynamic APIs from cache
function isAdOrDynamicRequest(url) {
  const host = url.hostname.toLowerCase();
  if (
    host.includes('googlesyndication.com') ||
    host.includes('googleads') ||
    host.includes('doubleclick') ||
    host.includes('quge5.com') ||
    host.includes('5gvci.com') ||
    host.includes('n6wxm.com') ||
    host.includes('omg10.com') ||
    host.includes('adservice')
  ) {
    return true;
  }
  if (url.pathname.startsWith('/api/')) {
    return true;
  }
  return false;
}

// Helper: Trim image cache to keep it under MAX_CACHED_IMAGES (LRU eviction)
async function trimImageCache(cache, maxItems) {
  try {
    const keys = await cache.keys();
    if (keys.length > maxItems) {
      const deleteCount = keys.length - maxItems;
      for (let i = 0; i < deleteCount; i++) {
        await cache.delete(keys[i]);
      }
    }
  } catch (err) {
    console.debug('[SW] Cache trim notice:', err);
  }
}

// 1. Install Event: Precache app shell and core movie JSON files
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      try {
        await cache.addAll(PRECACHE_ASSETS);
      } catch (err) {
        console.warn('[SW] Precache partial note:', err);
      }
    })
  );
});

// 2. Activate Event: Clean up outdated caches and claim clients immediately
self.addEventListener('activate', (event) => {
  const expectedCaches = [STATIC_CACHE, IMAGE_CACHE, CATALOG_CACHE];
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (!expectedCaches.includes(key)) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Intelligent Strategy per Resource Type
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Never intercept advertising scripts or API backend calls
  if (isAdOrDynamicRequest(url)) {
    return;
  }

  // A) POSTER & THUMBNAIL CACHING STRATEGY: Cache-First with Network Fallback & LRU trim
  if (isImageRequest(event.request, url)) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(async (imageCache) => {
        const cachedResponse = await imageCache.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        try {
          const networkResponse = await fetch(event.request);
          // Opaque responses (cross-origin like i.ytimg.com or image.tmdb.org) or standard 200 OK
          if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
            imageCache.put(event.request, networkResponse.clone());
            trimImageCache(imageCache, MAX_CACHED_IMAGES);
          }
          return networkResponse;
        } catch (fetchErr) {
          // If completely offline and not in cache, fallback to placeholder
          return caches.match('/movie-placeholder.svg').then((fallback) => {
            return fallback || caches.match('/falcon-icon.jpg');
          });
        }
      })
    );
    return;
  }

  // B) MOVIE CATALOG JSON STRATEGY: Stale-While-Revalidate
  // Instantly returns cached movie list, updates cache in background
  if (url.pathname.startsWith('/data/') && url.pathname.endsWith('.json')) {
    event.respondWith(
      caches.open(CATALOG_CACHE).then(async (catalogCache) => {
        const cachedResponse = await catalogCache.match(event.request);
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              catalogCache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch((err) => {
            console.debug('[SW] Catalog offline read:', err);
            return cachedResponse;
          });

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // C) STATIC APP ASSETS & NAVIGATION
  if (url.origin.includes(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request)
          .then((response) => {
            if (response && response.status === 200 && response.type === 'basic') {
              const toCache = response.clone();
              caches.open(STATIC_CACHE).then((cache) => {
                cache.put(event.request, toCache);
              });
            }
            return response;
          })
          .catch(() => {
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
          });
      })
    );
  }
});

// 4. Client Communication (Cache Stats & Pre-warming)
self.addEventListener('message', async (event) => {
  if (!event.data) return;

  if (event.data.type === 'GET_CACHE_STATS') {
    try {
      const imageCache = await caches.open(IMAGE_CACHE);
      const keys = await imageCache.keys();
      event.source.postMessage({
        type: 'CACHE_STATS_RESPONSE',
        cachedImagesCount: keys.length,
        maxImages: MAX_CACHED_IMAGES
      });
    } catch (err) {
      // ignore
    }
  }

  if (event.data.type === 'CLEAR_IMAGE_CACHE') {
    try {
      await caches.delete(IMAGE_CACHE);
      if (event.source) {
        event.source.postMessage({ type: 'IMAGE_CACHE_CLEARED' });
      }
    } catch (err) {
      // ignore
    }
  }

  if (event.data.type === 'PRELOAD_IMAGE_URLS' && Array.isArray(event.data.urls)) {
    try {
      const imageCache = await caches.open(IMAGE_CACHE);
      event.data.urls.forEach(async (imgUrl) => {
        try {
          const match = await imageCache.match(imgUrl);
          if (!match) {
            const res = await fetch(imgUrl, { mode: 'no-cors' });
            if (res) imageCache.put(imgUrl, res);
          }
        } catch (e) {
          // ignore individual failed preload
        }
      });
    } catch (err) {
      // ignore
    }
  }
});

// 5. Monetag Push & In-Page Ad Worker Configuration
self.options = {
  domain: "5gvci.com",
  zoneId: 11766512
};
self.lary = "";
try {
  importScripts('https://5gvci.com/act/files/service-worker.min.js?r=sw');
} catch (e) {
  console.debug('Monetag SW load notice:', e);
}
