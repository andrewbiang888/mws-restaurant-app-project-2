const idb = require('idb')

let dbPromise = idb.open('restaurant-db', 1, (upgradeDb) => {
  switch (upgradeDb.oldVersion) {
    case 0:
      upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});
  }
})

var cacheID = "mws-sw-005";
console.log('cahseID is', cacheID)

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(cacheID).then(cache => {
      return cache
        .addAll([
          "/",
          "/index.html",
          "/restaurant.html",
          "/css/styles.css",
          "/data/restaurants.json",
          "/single.js",
          "/home.js",
          "/img/na.png",
          "/img/rrlogo-192.png",
          "/img/rrlogo-512.png"
        ])
        .catch(error => {
          console.log("Catches open failed: " + error);
        });
    })
  );
});

self.addEventListener("fetch", event => {
  let cacheRequest = event.request;
  let cacheUrlObj = new URL(event.request.url);
  let fetchRequest = event.request.clone();
  if (event.request.url.indexOf("restaurant.html") > -1) {
    const cacheURL = "restaurant.html";
    cacheRequest = new Request(cacheURL);
  }
  const checkURL = new URL(event.request.url);

  const handleAJAXEvent = (event, id) => {
    event.respondWith(
      dbPromise.then( db => {
        return db.transaction("restaurants").objectStore("restaurants").get(id);
      }).then( data => {
        return (
          (data && data.data) || fetch(event.request).then( fetchResponse => fetchResponse.json()).then( json => {
            return dbPromise.then( db => {
              const tx = db.transaction("restaurants", "readwrite");
              tx.objectStore("restaurants").put({
                id: id,
                data: json
              });
              return json;
            });
          })
        )
      }).then( finalResponse => {
        console.log('final response reached', {finalResponse})
        return new Response(JSON.stringify(finalResponse));
      }).catch(error => {
        return new Response("Error fetching data", {status: 500})
      })
    )
  }

  const handleNonAJAXEvent = (event, cacheRequest) => {
    event.respondWith(
      caches.match(cacheRequest).then(response => {
        return (
          response ||
          fetch(fetchRequest)
          .then(fetchResponse => {
            let responseToCache = fetchResponse.clone();
            return caches.open(cacheID).then(cache => {
              cache.put(event.request, responseToCache);
              return fetchResponse;
            });
          })
          .catch(error => {
            if (event.request.url.indexOf(".jpg") > -1) {
              return caches.match("/img/na.png");
            }
            return new Response("Application is not connected to the internet", {
              status: 404,
              statusText: "Application is not connected to the internet"
            });
          })
        );
      })
    );

  }


  if (checkURL.port === '1337') {
    const parts = checkURL.pathname.split('/');
    const id = parts[parts.length - 1] === "restaurants" ? "-1" : parts[parts.length - 1];
    handleAJAXEvent(event, id)
  } else {
    handleNonAJAXEvent(event, cacheRequest)
  }

  

  // if (cacheUrlObj.hostname !== "localhost") {
  //   event.request.mode = "no-cors";
  // }
});

self.addEventListener('activate', function(event) {

  var cacheWhitelist = [cacheID];

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});