/////////////////////////////////////////////////////////////////////////////////
//
//  File: home_app.js
//  Project: beeftracker
//  Contributors: Tom Connolly
//  Description: Creates the angular app for the home page
//
/////////////////////////////////////////////////////////////////////////////////

var subscribe_app = angular.module('subscribe', ['jkuri.datepicker']);

subscribe_app.directive('headerDirective', function($compile, $http){
    return {
        link: function(scope, element, attrs) {
            $http.get('/header_html').then(function (result) {
                element.replaceWith($compile(result.data)(scope));
            });
        }
    }
});

subscribe_app.directive('footerDirective', function($compile, $http){
    return {
        link: function(scope, element, attrs) {
            $http.get('/footer_html').then(function (result) {
                element.replaceWith($compile(result.data)(scope));
            });
        }
    }
});