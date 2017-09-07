/////////////////////////////////////////////////////////////////////////////////
//
//  File: home_app.js
//  Project: beeftracker
//  Contributors: Tom Connolly
//  Description: Creates the angular app for the home page
//
/////////////////////////////////////////////////////////////////////////////////

var home_app = angular.module('home',['ngRoute']);

home_app.directive('headerDirective', function($compile, $http){
    return {
        link: function(scope, element, attrs) {
            $http.get('/header_html').then(function (result) {
                element.replaceWith($compile(result.data)(scope));
            });
        }
    }
});