const CACHE_NAME = 'echomesh-v2.0';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Let local network API requests pass directly to router & mesh nodes
  if (event.request.url.includes('/ask') || event.request.url.includes('/sos') || event.request.url.includes('/status')) {
    return;
  }
  
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
