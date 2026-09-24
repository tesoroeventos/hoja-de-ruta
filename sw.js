const CACHE = 'hojaruta-v3';
const CORE = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(CORE.map(u => c.add(u).catch(() => {})))));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const isPage = e.request.mode === 'navigate';
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(e.request, {ignoreSearch: isPage});
    const net = fetch(e.request).then(res => {
      if (res && (res.ok || res.type === 'opaque')) cache.put(e.request, res.clone());
      return res;
    }).catch(() => cached);
    // La página: primero la red (para recibir actualizaciones), si no hay señal, la guardada.
    if (isPage) return net.then(r => r || cached);
    return cached || net;
  })());
});
