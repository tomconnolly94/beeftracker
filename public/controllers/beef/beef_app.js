/////////////////////////////////////////////////////////////////////////////////
//
//  File: beef_app.js
//  Project: beeftracker
//  Contributors: Tom Connolly
//  Description: Creates and configures the angular app for the beef page
//
/////////////////////////////////////////////////////////////////////////////////
var beef_app = angular.module('beef_app', ['ngRoute', 'angular-loading-bar']);

beef_app.config(function($routeProvider, $locationProvider){
    $routeProvider.when('/beef/:tagId', {
        templateUrl: '',    
        controller: 'currentEventController',
    });
    $routeProvider.when('/beef/:tagId', {
        templateUrl: '',    
        controller: 'timelineController'
    });
    
    //these route is for development ** should be removed before production **
    $routeProvider.when('/beef_split/:tagId', {
        templateUrl: '',    
        controller: 'currentEventController',
    });
    $routeProvider.when('/beef_split/:tagId', {
        templateUrl: '',    
        controller: 'timelineController'
    });
    $routeProvider.when('/beef_bootstrap_timeline/:tagId', {
        templateUrl: '',    
        controller: 'currentEventController',
    });
    $routeProvider.when('/beef_bootstrap_timeline/:tagId', {
        templateUrl: '',    
        controller: 'timelineController'
    });
    // enable HTML5mode to disable hashbang urls
    $locationProvider.html5Mode({
        enabled:true,
        requireBase: false
    });
});


beef_app.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeBar = true;
    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.parentSelector = '#loading-bar-container';
}]);