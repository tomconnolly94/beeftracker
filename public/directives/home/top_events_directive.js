
home_app.directive('topEventsDirective', function($compile, $http){
    return {
        link: function(scope, element, attrs) {
            $http.get('/top_events_html').then(function (result) {
                element.replaceWith($compile(result.data)(scope));
            });
        }
    }
});