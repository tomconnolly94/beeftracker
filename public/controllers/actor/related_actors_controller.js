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

actor_app.controller("relatedActorsController", ['$scope','$http', '$routeParams', function($scope,$http,$routeParams) {

        //wait untill module has been configured before running this
    $scope.$on('$routeChangeSuccess', function() {
                
        //make http request to server for data
        //$http.get("/search_related_actors_by_id/" + $routeParams.tagId).success(function(response){
        $http({
            method: 'GET',
            url: "/search_related_actors_by_id/" + $routeParams.tagId
        }).then(function(response){
            response = response.data
            $scope.associated_actors = new Array();
            var actors = response.actors;
            for(var i = 0; i < actors.length; i++){
                var actor = {
                    _id : actors[i]._id,
                    loc_img_link : actors[i].img_title,
                    stage_name : actors[i].stage_name
                };
                $scope.associated_actors.push(actor);
            }
        }, 
        function(response_2) {
            //failed http request
            console.log("The client http get request has failed. actor_controller.js");
        });
    });
}]);