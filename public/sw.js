// Service Worker for Diet & Lifestyle PWA (Supports Custom Domains & GitHub Pages Subpaths)
const CACHE_NAME = 'shock-diet-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './doctor.html',
  './download.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icons/shock.jpg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/icon.svg',
  './data/techniques.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => response)
      .catch(() => caches.match(event.request))
  );
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'متد شوک | دکتر مهدیس';
  const options = {
    body: data.body || 'یادآور تکنیک امروز شما آماده است ⚡',
    icon: 'icons/icon-192.png',
    badge: 'icons/icon-192.png',
    dir: 'rtl',
    lang: 'fa-IR',
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
