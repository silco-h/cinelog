const CACHE = "cinelog-v1";

self.addEventListener("install", function(e){
  self.skipWaiting();
});

self.addEventListener("activate", function(e){
  e.waitUntil(clients.claim());
});

self.addEventListener("fetch", function(e){
  // Only handle GET requests — skip POST and others
  if(e.request.method !== "GET") return;

  // Always go to network for TMDB and Firebase
  if(e.request.url.includes("themoviedb.org") ||
     e.request.url.includes("image.tmdb.org") ||
     e.request.url.includes("firestore.googleapis.com") ||
     e.request.url.includes("identitytoolkit.googleapis.com") ||
     e.request.url.includes("firebase") ||
     e.request.url.includes("gstatic.com")){
    e.respondWith(fetch(e.request).catch(function(){ return new Response("", {status:503}); }));
    return;
  }

  // Cache-first for everything else (app files)
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