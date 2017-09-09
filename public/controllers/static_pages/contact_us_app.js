var contact_us_app = angular.module('contact_us',[]);

contact_us_app.directive('headerDirective', function($compile, $http){
    return {
        link: function(scope, element, attrs) {
            $http.get('/header_html').then(function (result) {
                element.replaceWith($compile(result.data)(scope));
            });
        }
    }
});

contact_us_app.directive('footerDirective', function($compile, $http){
    return {
        link: function(scope, element, attrs) {
            $http.get('/footer_html').then(function (result) {
                element.replaceWith($compile(result.data)(scope));
            });
        }
    }
});

contact_us_app.controller('searchController', ['$scope','$http', SearchBoxReusableController()]);