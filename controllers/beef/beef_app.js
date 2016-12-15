/////////////////////////////////////////////////////////////////////////////////
//
//  File: beef_app.js
//  Project: beeftracker
//  Contributors: Tom Connolly
//  Description: Creates and configures the angular app for the beef page
//
/////////////////////////////////////////////////////////////////////////////////

var beefapp = angular.module('beefapp', ['ngRoute']);

beefapp.config(function($routeProvider, $locationProvider){
    console.log("config");
    $routeProvider.when('/beef/:tagId', {
        templateUrl: '',    
        controller: 'currentEventController',
    });
    $routeProvider.when('/beef/:tagId', {
        templateUrl: '',    
        controller: 'timelineController'
    });
    // enable HTML5mode to disable hashbang urls
    $locationProvider.html5Mode({
        enabled:true,
        requireBase: false
    });
});