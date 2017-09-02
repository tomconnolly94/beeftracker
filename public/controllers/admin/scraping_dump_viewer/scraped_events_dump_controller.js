/////////////////////////////////////////////////////////////////////////////////
//
//  File: scraped_events_controller.js
//  Project: beeftracker
//  Contributors: Tom Connolly
//  Description: Sends a HTTP request to the node server to extract data from the
//                  db and return it. With the HTTP, is sent an ID which allows express
//                  to locate the correct record. This data this then bound to variables
//                  in the $scope.
//
/////////////////////////////////////////////////////////////////////////////////

scraping_dump_viewer_app.controller("scrapedEventsDumpController", ['$scope','$http', function($scope,$http) {
    
        //make http request to server for data
        //$http.get("/search_events_by_id/" + $routeParams.tagId).success(function(response_1){
        $http({
            method: 'GET',
            url: "/get_scraped_events_dump/"
        }).then(function(response_1){
            console.log(response_1);
        
        }, 
        function(response_1) {
            //failed http request
            console.log("Something went wrong");
        });
}]);