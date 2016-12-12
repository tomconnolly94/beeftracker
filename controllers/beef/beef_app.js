var beef_app = angular.module('searchResults', ['ngRoute']);

beef_module.config(function($routeProvider, $locationProvider){
    $routeProvider.when('/beef/:tagId', {
        templateUrl: '',    
        controller: 'resultController'
    });
    // enable HTML5mode to disable hashbang urls
    $locationProvider.html5Mode({
        enabled:true,
        requireBase: false
    });
});