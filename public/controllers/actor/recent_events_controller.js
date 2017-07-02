/////////////////////////////////////////////////////////////////////////////////
//
//  File: actor_controller.js
//  Project: beeftracker
//  Contributors: Tom Connolly
//  Description: Sends a HTTP request to the node server to extract data from the
//                  db and return it. With the HTTP is sent an ID which allows express
//                  to locate the correct record. This data this then bound to variables
//                  in the $scope.
//
/////////////////////////////////////////////////////////////////////////////////

actor_app.controller("recentEventsController", ['$scope','$http', '$routeParams', function($scope,$http,$routeParams) {
    
    //wait untill module has been configured before running this
    $scope.$on('$routeChangeSuccess', function() {
           
        //make http request to server for data
        //$http.get("/search_actors_by_id/" + $routeParams.tagId).success(function(response_1){
        $http({
            method: 'GET',
            url: "/search_actors_by_id/" + $routeParams.tagId
        }).then(function(response_1){
            var actor = response_1.data.actor;
        
                //make http request to server for data
                //$http.get("/search_events_by_event_aggressor/" + actor._id).success(function(response_2){
                $http({
                    method: 'GET',
                    url: "/search_events_by_event_aggressor/" + actor._id
                }).then(function(response_2){
                    
                    $scope.events = new Array();
                    
                    for(var i = 0; i < Object.keys(response_2.data.events).length; i++){
                        
                        event = response_2.data.events[i];
                        console.log(event);
                        var record = {
                                _id : event._id,
                                title : event.title,
                                aggressor : event.aggressor_object[0].stage_name,
                                targets : event.targets,
                                loc_img_link : event.img_title
                            };
                        
                        $scope.events[i] = record;
                    }
                    $scope.events = $scope.events.slice(0,4);
                        console.log(event);
                }, 
                function(response_2) {
                    //failed http request
                    console.log("The client http get request has failed. actor_controller.js:39");
                });
            }, 
        function(response_1) {
            //failed http request
            console.log("The client http get request has failed. actor_controller.js:39");
        });
    });
}]);