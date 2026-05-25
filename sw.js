const CACHE = "cinelog-v1";

self.addEventListener("install", function(e){
  self.skipWaiting();
});

self.addEventListener("activate", function(e){
  e.waitUntil(clients.claim());
});

self.addEventListener("fetch", function(e){
  // Only handle http/https requests
  if(!e.request.url.startsWith("http")) return;

  if(e.request.url.includes("themoviedb.org") || e.request.url.includes("image.tmdb.org")){
    e.respondWith(fetch(e.request).catch(function(){ return new Response("", {status:503}); }));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(function(cached){
      return cached || fetch(e.request).then(function(resp){
        return caches.open(CACHE).then(function(cache){
          cache.put(e.request, resp.clone());
          return resp;
        });
      });
    })
  );
});