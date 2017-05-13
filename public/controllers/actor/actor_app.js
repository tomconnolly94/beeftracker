/////////////////////////////////////////////////////////////////////////////////
//
//  File: artist_app.js
//  Project: beeftracker
//  Contributors: Tom Connolly
//  Description: Creates and configures the angular app for the artist page
//
/////////////////////////////////////////////////////////////////////////////////
var actor_app = angular.module('actor', ['ngRoute', 'angular-loading-bar']);

actor_app.config(function($routeProvider, $locationProvider){
    $routeProvider.when('/actor/:tagId', {
        templateUrl: '',    
        controller: 'actorSearchController'
    });
    $routeProvider.when('/actor/:tagId', {
        templateUrl: '',    
        controller: 'recentEventsController'
    });
    $routeProvider.when('/actor/:tagId', {
        templateUrl: '',    
        controller: 'relatedActorsController'
    });
    // enable HTML5mode to disable hashbang urls
    $locationProvider.html5Mode({
        enabled:true,
        requireBase: false
    });
});

actor_app.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeBar = true;
    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.parentSelector = '#loading-bar-container';
  }])