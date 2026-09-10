const CACHE_NAME = 'cancionero-v11';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.png',
  './canciones.json'
];

// Instalación del Service Worker y almacenamiento en caché de los activos iniciales
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activación: limpia las versiones viejas de caché (v10, etc.)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Eliminando caché antiguo:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estrategia de respuesta: intenta buscar en la red primero y, si falla (offline), usa el caché
self.addEventListener('fetch', (event) => {
  // Ignorar peticiones a Firestore o Firebase Auth para dejar que la SDK maneje la persistencia
  if (event.request.url.includes('firestore.googleapis.com') || event.request.url.includes('identitytoolkit')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Guarda una copia de la respuesta fresca en el caché
        if (event.request.method === 'GET' && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Si no hay red, sirve la versión de la memoria local
        return caches.match(event.request);
      })
  );
});
