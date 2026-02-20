const CACHE_NAME = 'gym-tracker-v2';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './training.html',
  './config.js',
  './lang.js',
  './app.js',
  './styles.css',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then(names => Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('cdnjs.cloudflare.com')) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        fetch(event.request).then(resp => {
          if (resp && resp.status === 200) caches.open(CACHE_NAME).then(c => c.put(event.request, resp.clone()));
        }).catch(() => {});
        return cached;
      }
      return fetch(event.request).then(resp => {
        if (resp && resp.status === 200) { const cl = resp.clone(); caches.open(CACHE_NAME).then(c => c.put(event.request, cl)); }
        return resp;
      });
    })
  );
});