const CACHE='rune-trening-v8';
const FILES=['./','index.html','styles.css','app.js','manifest.json','assets/situps-maskin.jpg',
'assets/tirsdag-1.jpg','assets/tirsdag-2.jpg','assets/tirsdag-3.jpg','assets/tirsdag-4.jpg','assets/tirsdag-5.jpg',
'assets/torsdag-1.jpg','assets/torsdag-2.jpg','assets/torsdag-3.jpg','assets/torsdag-4.jpg','assets/torsdag-5.jpg',
'assets/sondag-1.jpg','assets/sondag-2.jpg','assets/sondag-3.jpg','assets/sondag-4.jpg','assets/sondag-5.jpg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 const url=new URL(e.request.url);
 const shell=/\/(?:$|index\.html|app\.js|styles\.css|manifest\.json)$/.test(url.pathname);
 if(shell){
   e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r;}).catch(()=>caches.match(e.request)));
 }else{
   e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
 }
});