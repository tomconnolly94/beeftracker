/////////////////////////////////////////////////////////////////////////////////
//
//  File: scraping_dump_viewer_app.js
//  Project: beeftracker
//  Contributors: Tom Connolly
//  Description: Creates and configures the angular app for the beef page
//
/////////////////////////////////////////////////////////////////////////////////
var scraping_dump_viewer_app = angular.module('scraping_dump_viewer_app', ['ngRoute', "ngResource", 'angular-loading-bar']);

/*scraping_dump_viewer_app.config(function($routeProvider, $locationProvider){
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
});*/

/*
beef_app.directive('onFinishRender', function ($timeout) {
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
*/

scraping_dump_viewer_app.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeBar = true;
    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.parentSelector = '#loading-bar-container';
}]);

scraping_dump_viewer_app.directive('headerDirective', function($compile, $http){
    return {
        link: function(scope, element, attrs) {
            $http.get('/header_html').then(function (result) {
                element.replaceWith($compile(result.data)(scope));
            });
        }
    }
});