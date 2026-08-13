const CACHE_NAME = 'cancionero-v7';

// Lista completa de archivos de la app + dependencias externas (Firebase y fuentes)
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon.png',
  'https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js'
];

// 1. Instalación: Descarga y guarda los recursos esenciales en caché
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// 2. Activación: Elimina versiones antiguas de caché (v1, v5, etc.) para mantener espacio limpio
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Peticiones (Cache-First): Intenta entregar desde la caché local primero.
// Si no existe en la memoria, va a buscarlo a internet.
self.addEventListener('fetch', event => {
  // Evitamos interceptar peticiones directas a Firestore DB para no interferir con el tiempo real
  if (event.request.url.includes('firestore.googleapis.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then(networkResponse => {
        return networkResponse;
      }).catch(() => {
        // Manejo silencioso en caso de estar totalmente offline
      });
    })
  );
});
