/////////////////////////////////////////////////////////////////////////////////
//
//  File: artist_app.js
//  Project: beeftracker
//  Contributors: Tom Connolly
//  Description: Creates and configures the angular app for the artist page
//
/////////////////////////////////////////////////////////////////////////////////

var artist_app = angular.module('artist', ['ngRoute']);

artist_app.config(function($routeProvider, $locationProvider){
    $routeProvider.when('/artist/:tagId', {
        templateUrl: '',    
        controller: 'artistSearchController'
    });
    // enable HTML5mode to disable hashbang urls
    $locationProvider.html5Mode({
        enabled:true,
        requireBase: false
    });
});