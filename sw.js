// service-worker.js
const CACHE_NAME = 'geo-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/script.js',
  '/compress.js',
  '/db.js',
  '/app.webmanifest',
  '/icon-192.png',
  '/icon-512.png',
  '/assets/bootstrap.min.css',
  '/assets/sweetalert2.min.js',
  '/assets/html5-qrcode.min.js'
];


// self.addEventListener('install', e => {
  // e.waitUntil(
    // caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  // );
// });
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      for (const url of urlsToCache) {
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
          await cache.put(url, response);
          console.log('✅ Cached:', url);
        } catch (err) {
          console.error('❌ Gagal cache:', url, err.message);
        }
      }
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});
