var CACHE_NAME = 'beeftracker_page_cache';
var urls_to_cache = [
    "/",
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
    "/images/beefometers@small.png"
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(urls_to_cache);
        })
    )
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache
        })
    )
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        
        
        caches.match(event.request).then(function(response) {
            // Cache hit - return response
            if (response) {
                return response;
            }
            
            return fetch(event.request);
        }).catch(function(response){
            console.log("match faield, catch");
            
            var url_split = event.request.url.split("/");

            if(url_split[3] == "beef"){
                caches.open(CACHE_NAME).then(function(cache) {
                    
                    return cache.add("/" + url_split[3] + "/" + url_split[3]);
                })
            }
        })
    )
});