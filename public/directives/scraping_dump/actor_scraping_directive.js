
scraping_dump_viewer_app.directive('actorScrapingDirective', function($compile, $http){
    return {
        link: function(scope, element, attrs) {
            $http.get('/raw_actor_scraping_html').then(function (result) {
                element.replaceWith($compile(result.data)(scope));
            });
        }
    }
});