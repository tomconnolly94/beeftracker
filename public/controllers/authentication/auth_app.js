/////////////////////////////////////////////////////////////////////////////////
//
//  File: home_app.js
//  Project: beeftracker
//  Contributors: Tom Connolly
//  Description: Creates the angular app for the home page
//
/////////////////////////////////////////////////////////////////////////////////
var auth_app = angular.module('auth',['ngRoute']);

auth_app.directive('headerDirective', function($compile, $http){
    return {
        link: function(scope, element, attrs) {
            $http.get('/header_html').then(function (result) {
                element.replaceWith($compile(result.data)(scope));
            });
        }
    }
});

auth_app.directive('footerDirective', function($compile, $http){
    return {
        link: function(scope, element, attrs) {
            $http.get('/footer_html').then(function (result) {
                element.replaceWith($compile(result.data)(scope));
            });
        }
    }
});

auth_app.controller('searchController', ['$scope','$http', SearchBoxReusableController()]);