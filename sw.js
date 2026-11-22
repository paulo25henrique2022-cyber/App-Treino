const VERSAO = 'treino-v2.0.0';
const ARQ = ['./','index.html','style.css','data.js','core.js','karate.js','outros.js','telas.js','manifest.json',
 'img/inicial.jpg','img/karate_menu.jpg','img/karate_treino.jpg','img/kumite_menu.jpg','img/musc_menu.jpg','img/nat_menu.jpg','img/yoga.jpg','img/calendario.jpg','img/mapa.jpg','img/icon-192.png','img/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQ))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => {
    const rede = fetch(e.request).then(res => { if (res.ok && new URL(e.request.url).origin === location.origin) { const cp = res.clone(); caches.open(VERSAO).then(c => c.put(e.request, cp)); }; return res; }).catch(() => r);
    return r || rede;
  }));
});
