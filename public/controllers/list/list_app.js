/////////////////////////////////////////////////////////////////////////////////
//
//  File: artist_app.js
//  Project: beeftracker
//  Contributors: Tom Connolly
//  Description: Creates and configures the angular app for the artist page
//
/////////////////////////////////////////////////////////////////////////////////
var list_app = angular.module('list_app', ['ngRoute', 'angular-loading-bar']);

list_app.config(function($routeProvider, $locationProvider){
    $routeProvider.when('/list/:tagId', {
        templateUrl: '',    
        controller: 'listController'
    });
    // enable HTML5mode to disable hashbang urls
    $locationProvider.html5Mode({
        enabled:true,
        requireBase: false
    });
});

list_app.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeBar = true;
    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.parentSelector = '#loading-bar-container';
  }])