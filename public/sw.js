// Service Worker for Sonara PWA
// Caches core PWA shell assets and enables background audio continuity & offline fallback.

const CACHE_NAME = "sonara-pwa-v1";

const PRECACHE_ASSETS = [
  "/",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/favicon.ico"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS)).then(() => {
      return (self as unknown as ServiceWorkerGlobalScope).skipWaiting();
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      return (self as unknown as ServiceWorkerGlobalScope).clients.claim();
    })
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Audio streams and API routes should bypass Service Worker cache
  if (url.pathname.startsWith("/api/") || req.destination === "audio" || req.headers.get("range")) {
    return;
  }

  // Network first with cache fallback for navigation / static assets
  if (req.method === "GET") {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes.status === 200 && (url.origin === self.location.origin)) {
            const resClone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone)).catch(() => {});
          }
          return networkRes;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          if (cached) return cached;
          if (req.mode === "navigate") {
            const fallback = await caches.match("/");
            if (fallback) return fallback;
          }
          return new Response("Offline", { status: 503, statusText: "Service Unavailable" });
        })
    );
  }
});

