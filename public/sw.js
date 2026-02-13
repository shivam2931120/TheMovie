// TheMovie Service Worker — Caches images, API responses, and app shell for offline use
const CACHE_NAME = "themovie-v1";
const IMAGE_CACHE = "themovie-images-v1";
const API_CACHE = "themovie-api-v1";

// App shell files to pre-cache
const APP_SHELL = ["/", "/offline"];

// Install: pre-cache app shell
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
    );
    self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME && key !== IMAGE_CACHE && key !== API_CACHE)
                    .map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// Fetch handler with different strategies per request type
self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== "GET") return;

    // Skip chrome-extension, dev server HMR, and other non-http
    if (!url.protocol.startsWith("http")) return;

    // 1. TMDB Images: Cache-first (images rarely change)
    if (url.hostname === "image.tmdb.org" || url.hostname === "img.youtube.com") {
        event.respondWith(
            caches.open(IMAGE_CACHE).then((cache) =>
                cache.match(request).then((cached) => {
                    if (cached) return cached;
                    return fetch(request).then((response) => {
                        if (response.ok) {
                            cache.put(request, response.clone());
                        }
                        return response;
                    });
                })
            )
        );
        return;
    }

    // 2. TMDB API: Stale-while-revalidate (show cached data, update in background)
    if (url.hostname === "api.themoviedb.org" || url.hostname === "www.omdbapi.com") {
        event.respondWith(
            caches.open(API_CACHE).then((cache) =>
                cache.match(request).then((cached) => {
                    const fetchPromise = fetch(request)
                        .then((response) => {
                            if (response.ok) {
                                cache.put(request, response.clone());
                            }
                            return response;
                        })
                        .catch(() => {
                            // Network failed, return cached if available
                            if (cached) return cached;
                            return new Response(JSON.stringify({ error: "offline" }), {
                                headers: { "Content-Type": "application/json" },
                            });
                        });

                    // Return cached immediately if available, otherwise wait for network
                    return cached || fetchPromise;
                })
            )
        );
        return;
    }

    // 3. Navigation requests: Network-first with offline fallback
    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request).catch(() => caches.match("/offline") || caches.match("/"))
        );
        return;
    }

    // 4. Everything else (app assets): Stale-while-revalidate
    if (url.origin === self.location.origin) {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) =>
                cache.match(request).then((cached) => {
                    const fetchPromise = fetch(request).then((response) => {
                        if (response.ok) {
                            cache.put(request, response.clone());
                        }
                        return response;
                    }).catch(() => cached);
                    return cached || fetchPromise;
                })
            )
        );
    }
});

// Periodic cleanup: limit image cache to 500 entries
self.addEventListener("message", (event) => {
    if (event.data === "CLEANUP") {
        caches.open(IMAGE_CACHE).then((cache) =>
            cache.keys().then((keys) => {
                if (keys.length > 500) {
                    // Delete oldest 100 entries
                    keys.slice(0, 100).forEach((key) => cache.delete(key));
                }
            })
        );
        // API cache: limit to 200 entries
        caches.open(API_CACHE).then((cache) =>
            cache.keys().then((keys) => {
                if (keys.length > 200) {
                    keys.slice(0, 50).forEach((key) => cache.delete(key));
                }
            })
        );
    }
});
