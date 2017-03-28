/////////////////////////////////////////////////////////////////////////////////
//
//  File: artist_app.js
//  Project: beeftracker
//  Contributors: Tom Connolly
//  Description: Creates and configures the angular app for the artist page
//
/////////////////////////////////////////////////////////////////////////////////
var artist_app = angular.module('actor', ['ngRoute', 'angular-loading-bar']);

artist_app.config(function($routeProvider, $locationProvider){
    $routeProvider.when('/artist/:tagId', {
        templateUrl: '',    
        controller: 'actorSearchController'
    });
    $routeProvider.when('/artist/:tagId', {
        templateUrl: '',    
        controller: 'recentEventsController'
    });
    $routeProvider.when('/artist/:tagId', {
        templateUrl: '',    
        controller: 'relatedActorsController'
    });
    // enable HTML5mode to disable hashbang urls
    $locationProvider.html5Mode({
        enabled:true,
        requireBase: false
    });
});

artist_app.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeBar = true;
    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.parentSelector = '#loading-bar-container';
  }])