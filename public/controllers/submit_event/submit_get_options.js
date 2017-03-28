/////////////////////////////////////////////////////////////////////////////////
//
//  File: event_stream_controller.js
//  Project: beeftracker
//  Contributors: Tom Connolly
//  Description: Sends a HTTP request to the node server to extract data from the
//                  db and return it. With the HTTP is sent a 'limit' so express 
//                  knows how many records to return. These events are then assigned
//                  to the $scope.
//
/////////////////////////////////////////////////////////////////////////////////

submit_event_app.controller('submitOptions', ['$scope','$http', function($scope, $http) {
    
    $http.get("/search_all_artists/").success(function(response){
        
        //validate the url tagId to make sure the event exists                
        if(response != undefined){

            console.log(response);
            $scope.actors = response.actors;
            console.log(response.actors[0].stage_name);
        }
        else{
            //error msg
            console.log("No events found in database");
        }
    }, 
    function(response) {
        //failed http request
        console.log("Error in HTTP request in search_controller.js:searchController");
    });
}]);