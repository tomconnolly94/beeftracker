
home_app.directive('splashZoneDirective', function($compile, $http){
    return {
        link: function(scope, element, attrs) {
            $http.get('splash_zone_html').then(function (result) {
                element.replaceWith($compile(result.data)(scope));
            });
        }
    }
});