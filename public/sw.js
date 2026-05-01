const CACHE = "naqlgo-v1";
const STATIC = ["/", "/login", "/register", "/manifest.json", "/favicon.svg"];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  if (e.request.url.includes("/api/")) return; // never cache API calls

  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
