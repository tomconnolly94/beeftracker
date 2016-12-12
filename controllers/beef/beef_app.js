/////////////////////////////////////////////////////////////////////////////////
//
//  File: beef_app.js
//  Project: beeftracker
//  Contributors: Tom Connolly
//  Description: Creates and configures the angular app for the beef page
//
/////////////////////////////////////////////////////////////////////////////////

var beef_app = angular.module('beef', ['ngRoute']);

beef_app.config(function($routeProvider, $locationProvider){
    console.log("config");
    $routeProvider.when('/beef/:tagId', {
        templateUrl: '',    
        controller: 'currentEventController'
    });
    // enable HTML5mode to disable hashbang urls
    $locationProvider.html5Mode({
        enabled:true,
        requireBase: false
    });
});