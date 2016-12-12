/////////////////////////////////////////////////////////////////////////////////
//
//  File: beef_app.js
//  Project: beeftracker
//  Contributors: Tom Connolly
//  Description: Creates and configures the angular app for the beef page
//
/////////////////////////////////////////////////////////////////////////////////

var beef_app_loader = angular.module('beef_app_loader', ['ngRoute']);

beef_app_loader.config(function($routeProvider, $locationProvider){
    console.log("beef_app_loader config");
    $routeProvider.when('/beef/:tagId', {
        templateUrl: '',    
        controller: 'currentEventController'
    });
    // enable HTML5mode to disable hashbang urls
    $locationProvider.html5Mode({
        enabled:true,
        requireBase: false
    });
});

beef_app_loader.directive('loadRightDirective', function(){
  return {
    restrict: 'A',
    compile: function(element, attrs){
      //here your all jQuery code will lie to ensure binding
      return element.load('/beef_information', function (data) {});
    }
  }
});

beef_app_loader.directive('loadLeftDirective', function(){
  return {
    restrict: 'A',
    compile: function(element, attrs){
      //here your all jQuery code will lie to ensure binding
      element.load('/beef_timeline', function (data) {});
    }
  }
});