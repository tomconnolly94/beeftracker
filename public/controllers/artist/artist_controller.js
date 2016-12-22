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

artist_app.controller("artistSearchController", ['$scope','$http', '$routeParams', function($scope,$http,$routeParams) {
    
    //wait untill module has been configured before running this
    $scope.$on('$routeChangeSuccess', function() {
        
        //make http request to server for data
        $http.get("/search_artist/" + $routeParams.tagId).success(function(response){
            //validate the url tagId to make sure the event exists
            if(response.events != undefined){
                
                var artist_object = response.events;
                
                //make http request to server for data
                $http.get("/search_events_from_artist/" + artist_object.stage_name).success(function(response){
                                    
                    //assign fields to scope
                    $scope.stage_name = artist_object.stage_name;
                    $scope.birth_name = artist_object.birth_name;
                    $scope.d_o_b = artist_object.d_o_b.slice(0,10);
                    $scope.img_link = "/artist_images/" + artist_object.img_link;
                    $scope.events = response.events;
                    $scope.bio = response.bio;
                }, 
                function(response) {
                    //failed http request
                    console.log("The client http get request has failed. artist_controller.js:33");
                });
            }
            else{
                //error msg
                console.log("An incorrect event_id has been used. please check the url. artist_controller.js:28")
            }
        }, 
        function(response) {
            //failed http request
            console.log("The client http get request has failed. artist_controller.js:33");
        });
    });
}]);