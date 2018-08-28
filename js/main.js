const idb = require('idb') 
let restaurants,
  neighborhoods,
  cuisines
// var map
var newMap
var markers = []

/**
 * test idb
 * 
 
let dbPromise = idb.open('test-db', 2, (upgradeDb) => {
  let keyValStore = upgradeDb.createObjectStore('keyval');
  keyValStore.put('world', 'hello');
}).then( (db) => {
  let tx = db.transaction('keyval')
  let keyValStore = tx.objectStore('keyval')
  return keyValStore.get('hello')
}).then( val => console.log('the value is: ', val)
).then( (db) => {
  let tx = db.transaction('keyval', 'readwrite')
  let keyValStore = tx.objectStore('keyval')
  keyValStore.put('bar', 'foo')
  keyValStore.delete('foo');
  return tx.complete
}).then( message => console.log('foo bar added', message))

*/

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap();
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  if (select) {
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');
  if (select) {
    cuisines.forEach(cuisine => {
      const option = document.createElement('option');
      option.innerHTML = cuisine;
      option.value = cuisine;
      select.append(option);
    });
  }
}

/**
 * Initialize leaflet map, called from HTML.
 */
window.initMap = () => {
  window.newMap = L.map('map', {
        center: [40.722216, -73.987501],
        zoom: 12,
        attributionControl: false,
        scrollWheelZoom: false
      });
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
    mapboxToken: 'pk.eyJ1IjoiYW5kcmV3YmlhbmciLCJhIjoiY2preTMycnFkMDAzODN2bzR6MzE2NGl3cyJ9.-cT6arYid1JT1hByODt8-g',
    maxZoom: 18,
    // attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
    //   '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    //   'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets'
  }).addTo(window.newMap);

  updateRestaurants();
}
/**
 * Initialize Google map, called from HTML.
 */
// window.initMap = () => {
//   // console.log('woooo!!!')
//   let loc = {
//     lat: 40.722216,
//     lng: -73.987501
//   };
//   self.map = new google.maps.Map(document.getElementById('map'), {
//     zoom: 12,
//     center: loc,
//     scrollwheel: false
//   });
//   updateRestaurants();
// }

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {

  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');
  if (nSelect) {
    const cIndex = cSelect.selectedIndex;
    const nIndex = nSelect.selectedIndex;

    const cuisine = cSelect[cIndex].value;
    const neighborhood = nSelect[nIndex].value;

    DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {

      if (error) { // Got an error!
        console.error(error);
      } else {
        resetRestaurants(restaurants);
        fillRestaurantsHTML();
      }
    })
  }
  var imgDefer = document.getElementsByTagName('img');
  setTimeout(function(){ 
    for (var i=0; i < imgDefer.length; i++) {
      if ( imgDefer[i].getAttribute('data-src') ) {
        imgDefer[i].setAttribute('src',imgDefer[i].getAttribute('data-src'));
        if ( imgDefer[i].getAttribute('data-srcset') ) {
          imgDefer[i].setAttribute('srcset',imgDefer[i].getAttribute('data-srcset'));
        }
      } 
    } 
  }, 100);
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  // self.markers.forEach(m => m.setMap(null));
  // self.markers = [];
  //or 
  // if (self.markers) {
  //   self.markers.forEach(marker => marker.remove());
  // }
  // self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {

  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  const imgurlbase = DBHelper.imageUrlForRestaurant(restaurant, "tiles");
  const imgparts = imgurlbase.split(".");
  // console.log({imgparts})
  const imgurl1x = imgparts[0] + "_1x." + imgparts[1];
  const imgurl2x = imgparts[0] + "_2x." + imgparts[1];
  // image.src = imgurl1x;
  // image.srcset = `${imgurl1x} 300w, ${imgurl2x} 600w`;
  // Add Lazy Loading here and replace that ^
  image.src = 'data:image/png;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
  image.dataset.src = imgurl1x;
  image.dataset.srcset = `${imgurl1x} 300w, ${imgurl2x} 600w`;

  image.alt = restaurant.name + " restaurant promotion";
  li.append(image);

  const div = document.createElement("div");
  div.className = "restaurant-text-area";
  li.append(div)

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  div.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  div.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  div.append(address);

  const more = document.createElement('button');
  more.innerHTML = 'View Details';
  more.onclick = function () {
    const url = DBHelper.urlForRestaurant(restaurant);
    window.location = url;
  }
  div.append(more)

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {

    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, window.newMap);
    // console.log({marker})
    marker.on("click", onClick);
    function onClick() {
      window.location.href = marker.options.url;
    }
    markers.push(marker);
  });

} 
// addMarkersToMap = (restaurants = self.restaurants) => {
//   restaurants.forEach(restaurant => {
//     // Add marker to the map
//     const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
//     google.maps.event.addListener(marker, 'click', () => {
//       window.location.href = marker.url
//     });
//     markers.push(marker);
//   });
// }