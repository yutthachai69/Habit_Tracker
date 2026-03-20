const CACHE_NAME = 'stitch-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/icon-512.png',
  '/manifest.json'
];

self.addEventListener('install', event => {
const CACHE_NAME = 'stitch-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // Network-First strategy for HTML and other assets
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
