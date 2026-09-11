const CACHE_NAME = 'cancionero-cache-v2';

// Archivos esenciales para que la app y el Modo Director funcionen 100% offline
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/js/peerjs.min.js',
  '/manifest.json',
  '/img/icon-id.png'
];

// 1. INSTALACIÓN: Descarga y guarda todos los archivos locales en la memoria
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Guardando archivos en caché local...');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting()) // Fuerza al nuevo Service Worker a tomar el control de inmediato
  );
});

// 2. ACTIVACIÓN: Elimina cachés antiguas de versiones anteriores para no acumular basura
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Eliminando caché antigua:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // Toma control de todas las pestañas abiertas
  );
});

// 3. PETICIONES (FETCH): Responde con los archivos guardados en el teléfono sin tocar internet
self.addEventListener('fetch', (event) => {
  // Ignorar peticiones que no sean GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Devuelve el archivo local inmediatamente
          return cachedResponse;
        }
        // Si por alguna razón no está en caché, intenta ir a la red
        return fetch(event.request).catch(() => {
          // Fallback opcional si la red falla y no hay caché
          console.warn('[Service Worker] No se pudo obtener el recurso:', event.request.url);
        });
      })
  );
});
