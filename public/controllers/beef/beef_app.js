/////////////////////////////////////////////////////////////////////////////////
//
//  File: beef_app.js
//  Project: beeftracker
//  Contributors: Tom Connolly
//  Description: Creates and configures the angular app for the beef page
//
/////////////////////////////////////////////////////////////////////////////////
var beef_app = angular.module('beef_app', ['ngRoute', "ngResource", 'angular-loading-bar']);

beef_app.config(function($routeProvider, $locationProvider){
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

beef_app.directive('onFinishRender', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            //if (scope.$last === true) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit(attr.onFinishRender);
                });
            }
        }
    }
});

beef_app.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeBar = true;
    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.parentSelector = '#loading-bar-container';
}]);