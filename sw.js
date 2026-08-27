const CACHE='jenny-recuperacion-v5';
const ASSETS=['./index.html?v=5','./manifest.webmanifest?v=5','./icon-192.png','./icon-512.png'];

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache =>
      Promise.all([
        cache.add('./index.html?v=5'),
        cache.add('./manifest.webmanifest?v=5'),
        cache.add('./icon-192.png'),
        cache.add('./icon-512.png')
      ])
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req=event.request;
  if(req.mode==='navigate'){
    event.respondWith(
      fetch(req,{cache:'no-store'})
        .then(res=>{
          const copy=res.clone();
          caches.open(CACHE).then(c=>c.put('./index.html?v=5',copy));
          return res;
        })
        .catch(()=>caches.match('./index.html?v=5'))
    );
    return;
  }
  event.respondWith(
    fetch(req,{cache:'no-store'})
      .then(res=>res)
      .catch(()=>caches.match(req))
  );
});
