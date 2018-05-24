var CACHE_NAME = 'beeftracker_page_cache';
var urls_to_cache = [
    "/",
    "/offline",
    "/stylesheets/beeftracker.vendors.css",
    "/stylesheets/beeftracker.css",
    "/modules/jquery/dist/jquery.min.js",
    "/bower_components/bootstrap/dist/js/bootstrap.bundle.js",
    "/bower_components/hammerjs/hammer.js",
    "/js/service_worker_init.js",
    "/bower_components/swiper/dist/js/swiper.js",
    "/logo/logo@256.png",
    "/logo/beeftracker_new_logo_cropped_white_red.png",
    "/logo/logo_light@256.png",
    "/webfonts/fa-solid-900.woff2",
    "/webfonts/fa-brands-400.woff2",
    "/webfonts/fa-solid-900.woff",
    "/webfonts/fa-brands-400.woff",
    "/webfonts/fa-solid-900.ttf",
    "/webfonts/fa-brands-400.ttf",
    "/images/got-beef.jpg",
    "/images/beefometers@small.png",
    "/images/sad_cow.png"
];
var urls_to_avoid_caching = [
    "profile",
    "add-beef"    
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(urls_to_cache);
        }).catch(function() {
            // Do nothing.
        })
    )
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache
        }).catch(function() {
            // Do nothing.
        })
    )
});

self.addEventListener('fetch', function(event) {
    
    var request = event.request;
    
    if(request.method == "GET"){ //only allow service worker to intercept request if it is a GET request
        event.respondWith(
            fetch(request) //attempt to fetch the resource
                .then(function(response) { //run if fetch is successful
                    
                    if(urls_to_avoid_caching.indexOf(request.url.split("/").pop().split("?")[0].split("#")[0]) == -1){ //do not cache the add beef page
                        var copy = response.clone();
                        caches.open(CACHE_NAME) //open cache and dynamically add page that has just been fetched to cache
                            .then(function(cache) {
                                cache.put(request, copy);
                            });
                    }
                    return response;
                })
                .catch(function() { //run if fetch is unsuccessful, client is offline
                    return caches.match(request)
                        .then(function(response) {
                            return response || caches.match("/offline");
                        });
                })
        )
    }
    return;
});