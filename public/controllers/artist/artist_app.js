/////////////////////////////////////////////////////////////////////////////////
//
//  File: artist_app.js
//  Project: beeftracker
//  Contributors: Tom Connolly
//  Description: Creates and configures the angular app for the artist page
//
/////////////////////////////////////////////////////////////////////////////////
var artist_app = angular.module('artist', ['ngRoute', 'angular-loading-bar']);

artist_app.config(function($routeProvider, $locationProvider){
    $routeProvider.when('/artist/:tagId', {
        templateUrl: '',    
        controller: 'artistSearchController'
    });
    $routeProvider.when('/artist/:tagId', {
        templateUrl: '',    
        controller: 'recentEventsController'
    });
    $routeProvider.when('/artist/:tagId', {
        templateUrl: '',    
        controller: 'relatedArtistsController'
    });
    // enable HTML5mode to disable hashbang urls
    $locationProvider.html5Mode({
        enabled:true,
        requireBase: false
    });
});

artist_app.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeBar = false;
    //cfpLoadingBarProvider.includeSpinner = true;
    //cfpLoadingBarProvider.parentSelector = '#loading-bar-container';
    //cfpLoadingBarProvider.spinnerTemplate = '<div><span class="fa fa-spinner">Loading...</div>';
    
    this.includeSpinner = true;
    this.includeBar = true;
    this.includeBackdrop = true;
    this.latencyThreshold = 100;
    this.startSize = 0.02;
    this.parentSelector = 'body';
    this.spinnerTemplate = '<div id="loading-bar-spinner"><div class="spinner-icon"></div></div>';
    this.loadingBarTemplate = '<div id="loading-bar"><div class="bar"><div class="peg"></div></div></div>';
    this.backdropTemplate = '<div class="modal-backdrop fade in" ng-class="{in: animate}" style="z-index: 1040;"></div>';

  }])