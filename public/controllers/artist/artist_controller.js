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
                
        $http.get("/search_artist/" + $routeParams.tagId).success(function(response_1){
            //validate the url tagId to make sure the event exists
            if(response_1 != undefined){
                
                var artist_object = response_1.artist;
                        
                if(artist_object != undefined){
                    //assign fields to scope
                    $scope.stage_name = artist_object.stage_name;
                    $scope.birth_name = artist_object.birth_name;
                    $scope.d_o_b = artist_object.d_o_b.slice(0,10);
                    $scope.img_link = artist_object.img_link;
                    $scope.bio = artist_object.bio;
                }
            }
            else{
                //error msg
                console.log("An incorrect artist_id has been used. please check the url. artist_controller.js:44")
            }
        }, 
        function(response_1) {
            //failed http request
            console.log("The client http get request has failed. artist_controller.js:33");
        });
    });
}]);