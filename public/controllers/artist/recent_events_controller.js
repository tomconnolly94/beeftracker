/////////////////////////////////////////////////////////////////////////////////
//
//  File: artist_controller.js
//  Project: beeftracker
//  Contributors: Tom Connolly
//  Description: Sends a HTTP request to the node server to extract data from the
//                  db and return it. With the HTTP is sent an ID which allows express
//                  to locate the correct record. This data this then bound to variables
//                  in the $scope.
//
/////////////////////////////////////////////////////////////////////////////////

artist_app.controller("recentEventsController", ['$scope','$http', '$routeParams', function($scope,$http,$routeParams) {
    
    //wait untill module has been configured before running this
    $scope.$on('$routeChangeSuccess', function() {
           
        //make http request to server for data
        $http.get("/search_actors_by_id/" + $routeParams.tagId).success(function(response){
            var artist = response.artist;
            console.log(response);
            console.log(artist);
        
                //make http request to server for data
                $http.get("/search_events_by_event_aggressor/" + artist._id).success(function(response){
                    
                    $scope.events = new Array();
                    
                    for(var i = 0; i < response.events[0].length; i++){
                        
                        event = response.events[i];
                        var record = {
                                title : event.title,
                                aggressor : event.aggressor_object[0].stage_name,
                                targets : events.targets,
                                loc_img_link : events.loc_img_link
                            };
                        
                        $scope.events[i] = record;
                    }
                    $scope.events = response.events;
                    console.log(response);
                }, 
                function(response_2) {
                    //failed http request
                    console.log("The client http get request has failed. artist_controller.js:39");
                });
            }, 
        function(response_2) {
            //failed http request
            console.log("The client http get request has failed. artist_controller.js:39");
        });
    });
}]);