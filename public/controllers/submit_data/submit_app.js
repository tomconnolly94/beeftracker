/////////////////////////////////////////////////////////////////////////////////
//
//  File: home_app.js
//  Project: beeftracker
//  Contributors: Tom Connolly
//  Description: Creates the angular app for the home page
//
/////////////////////////////////////////////////////////////////////////////////

var submit_app = angular.module('submit', ['jkuri.datepicker','toggle-switch']);
/*submit_app.config(function($routeProvider, $locationProvider){
    $routeProvider.when('/raw_add_actor',
        {
            controller: 'actorFormController',
            templateUrl: '/raw_add_actor'
        });
});*/

submit_app.directive('headerDirective', function($compile, $http){
    return {
        link: function(scope, element, attrs) {
            $http.get('/header_html').then(function (result) {
                element.replaceWith($compile(result.data)(scope));
            });
        }
    }
});

submit_app.directive('footerDirective', function($compile, $http){
    return {
        link: function(scope, element, attrs) {
            $http.get('/footer_html').then(function (result) {
                element.replaceWith($compile(result.data)(scope));
            });
        }
    }
});

submit_app.controller('searchController', ['$scope','$http', SearchBoxReusableController()]);