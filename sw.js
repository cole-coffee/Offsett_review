/* Offsett Review — Service Worker v2 */
const CACHE = 'offsett-review-v2';

const PRECACHE = [
  '/Offsett_review/',
  '/Offsett_review/index.html',
  '/Offsett_review/manifest.json',
];

function isCacheable(request) {
  try {
    const url = new URL(request.url);
    if (url.protocol === 'chrome-extension:') return false;
    if (url.protocol === 'data:') return false;
    if (request.method !== 'GET') return false;
    if (url.hostname.includes('allorigins.win')) return false;
    if (!['http:', 'https:'].includes(url.protocol)) return false;
    return true;
  } catch {
    return false;
  }
}

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => Promise.allSettled(
        PRECACHE.map(url => cache.add(url).catch(() => {}))
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (!isCacheable(e.request)) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        const clone = res.clone();
        caches.open(CACHE).then(cache => {
          try { cache.put(e.request, clone); } catch (err) {}
        });
        return res;
      }).catch(() => caches.match('/Offsett_review/index.html'));
    })
  );
});
