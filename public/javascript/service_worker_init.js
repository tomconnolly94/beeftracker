if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/service_worker').then(function(registration) {
            // Registration was successful
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function(err) {
            // registration failed :(
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}
/*
navigator.serviceWorker.getRegistrations().then(function(registrations) {
 for(let registration of registrations) {
  registration.unregister()
} })*/