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


beef_app.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeBar = true;
    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.parentSelector = '#loading-bar-container';
    //cfpLoadingBarProvider.spinnerTemplate = '<div><span class="fa fa-spinner">Loading...</div>';
}]);