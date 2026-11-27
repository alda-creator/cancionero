const fs = require('fs');
const assert = require('assert');

const index = fs.readFileSync('index.html', 'utf8');
const serviceWorker = fs.readFileSync('sw.js', 'utf8');

for (const key of [
  'church_songs',
  'church_song_set',
  'church_notation',
  'church_firestore_pending_sync_v1',
  'church_song_set_transpose_v1',
  'church_song_set_sequences_v1'
]) {
  assert(index.includes(key), `Falta la clave local de producción: ${key}`);
}
assert(!index.includes('cancionero_lab_'), 'Producción no debe usar claves locales del laboratorio');
assert(index.includes('projectId: "cancionero-iglesia-7560f"'));
assert(index.includes("const USE_ANONYMOUS_FIREBASE_AUTH = firebaseConfig.projectId === 'cancionero-pruebas'"));

assert(serviceWorker.includes("const CACHE_NAME = 'cancionero-cache-v10'"));
assert(serviceWorker.includes("const LEGACY_CACHE_NAMES = ['cancionero-cache-v9']"));
assert(serviceWorker.includes("cacheName.startsWith('cancionero-cache-')"));
assert(!serviceWorker.includes("cancionero-lab-cache-"));

console.log('Production Firebase, browser storage and cache isolation checks passed.');
