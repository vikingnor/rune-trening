const CACHE='rune-trening-v3';
const FILES=['./','index.html','styles.css','app.js','manifest.json','assets/tirsdag.jpg','assets/torsdag.jpg','assets/sondag.jpg',
'assets/tirsdag-1.jpg','assets/tirsdag-2.jpg','assets/tirsdag-3.jpg','assets/tirsdag-4.jpg','assets/tirsdag-5.jpg',
'assets/torsdag-1.jpg','assets/torsdag-2.jpg','assets/torsdag-3.jpg','assets/torsdag-4.jpg','assets/torsdag-5.jpg',
'assets/sondag-1.jpg','assets/sondag-2.jpg','assets/sondag-3.jpg','assets/sondag-4.jpg','assets/sondag-5.jpg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
