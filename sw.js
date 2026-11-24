const C = "deric-v4", SHELL = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png"];
const CDN = ["cdn.jsdelivr.net", "storage.googleapis.com"];     // detection scripts and model: cached so later launches are light and work offline
self.addEventListener("install", e => e.waitUntil(caches.open(C).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(
  caches.keys().then(k => Promise.all(k.filter(x => x.startsWith("deric-") && x !== C).map(x => caches.delete(x)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (r.mode === "navigate"){                                    // newest page when online, saved page when offline
    e.respondWith(fetch(r).then(x => { const cp = x.clone(); caches.open(C).then(c => c.put("index.html", cp)); return x; }).catch(() => caches.match("index.html")));
    return;
  }
  if (u.origin === location.origin || CDN.includes(u.hostname))
    e.respondWith(caches.match(r).then(h => h || fetch(r).then(x => {
      if (x.ok || x.type === "opaque"){ const cp = x.clone(); caches.open(C).then(c => c.put(r, cp)); }
      return x;
    })));
});
