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

artist_app.controller("relatedArtistsController", ['$scope','$http', '$routeParams', function($scope,$http,$routeParams) {

        //wait untill module has been configured before running this
    $scope.$on('$routeChangeSuccess', function() {
                
        //make http request to server for data
        $http.get("/search_related_artists_from_artist_id/" + $routeParams.tagId).success(function(target_objects){
            console.log(target_objects.targets);
            $scope.targets = target_objects.targets;
        }, 
        function(response_2) {
            //failed http request
            console.log("The client http get request has failed. artist_controller.js:39");
        });
    });
}]);