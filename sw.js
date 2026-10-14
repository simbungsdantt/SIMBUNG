/* Service worker SIMBUNG: menyimpan "cangkang" pembungkus agar bisa diinstal.
   Cangkang SELALU diambil dari jaringan lebih dulu (supaya perubahan alamat aplikasi di index.html
   langsung berlaku); salinan tersimpan hanya dipakai bila jaringan tidak ada.
   Aplikasi utama (Apps Script) tidak pernah disentuh dan tetap dimuat dari internet. */
var CACHE = 'simbung-shell-v2';
var FILE = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILE); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;   // jangan sentuh Apps Script
  e.respondWith(
    fetch(req, { cache: 'no-cache' }).then(function (res) {
      if (res && res.ok) { var salinan = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, salinan); }); }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (hit) { return hit || caches.match('index.html'); });
    })
  );
});
