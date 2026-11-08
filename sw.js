var C = 'msh-v6';
var FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './icon.svg'];

// Har file alag cache hoti hai: koi file repo mein na ho to bhi service worker install ho jata hai
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(C).then(function (c) {
      return Promise.all(FILES.map(function (f) { return c.add(f).catch(function () {}); }));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== C; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(function (r) {
      if (r && r.ok) { var x = r.clone(); caches.open(C).then(function (c) { c.put(e.request, x); }); }
      return r;
    }).catch(function () {
      return caches.match(e.request).then(function (m) { return m || caches.match('./index.html'); });
    })
