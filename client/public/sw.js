const CACHE_NAME = 'stitch-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // ไม่ต้อง Cache หรือยุ่งกับ API หรือ Redirects จาก Google
  if (event.request.url.includes('/api') || event.request.url.includes('google')) {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request) || new Response('Offline', { status: 504 });
    })
  );
});
