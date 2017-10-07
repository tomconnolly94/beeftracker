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

actor_app.controller("actorSearchController", ['$scope','$http', '$routeParams', function($scope,$http,$routeParams) {
    
    //wait untill module has been configured before running this
    $scope.$on('$routeChangeSuccess', function() {
                
        //$http.get("/search_actors_by_id/" + $routeParams.tagId).success(function(response_1){
        $http({
            method: 'GET',
            url: "/search_actors_by_id/" + $routeParams.tagId
        }).then(function(response_1){
            //validate the url tagId to make sure the event exists
            if(response_1.data != undefined){
                
                var actor_object = response_1.data.actor;
                
                if(actor_object != undefined){
                    
                    //assign fields to scope
                    $scope.stage_name = actor_object.stage_name;
                    $scope.birth_name = actor_object.birth_name;
                    $scope.d_o_b = actor_object.d_o_b.slice(0,10);
                    $scope.loc_img_link = actor_object.img_title ? actor_object.img_title: actor_object.links.mf_img_link;
                    $scope.bio = actor_object.bio;
                    $scope.data_sources = actor_object.data_sources;
                    $scope.nicknames = actor_object.nicknames;
                    $scope.occupations = actor_object.occupations;
                    $scope.origin = actor_object.origin;
                    
                    delete actor_object.links["mf_img_link"];
                    $scope.links = [];

                    var triple;
                    var grouped_in = 3;

                    for (var i = 0; i < Object.keys(actor_object.links).length; i++) {
                        if (!triple) {
                            triple = [];
                        }

                        record = { "button_name" : Object.keys(actor_object.links)[i],
                                  "url" : actor_object.links[Object.keys(actor_object.links)[i]] };

                        triple.push(record);

                        if (((i+1) % grouped_in) === 0) {
                            $scope.links.push(triple);
                            triple = null;
                        }
                    }
                    if (triple) {
                        $scope.links.push(triple);
                    }
                    /*
                    //code to deal with associated actors data, not in current version
                    $scope.associated_actors = new Array();
                    
                    for(var i = 0; i < actor_object.associated_actor_objects.length; i++){
                        $scope.associated_actors.push(actor_object.associated_actor_objects[i]);
                    }*/
                }
            }
            else{
                //error msg
                console.log("An incorrect actor_id has been used. please check the url. actor_controller.js:44")
            }
        }, 
        function(response_1) {
            //failed http request
            console.log("The client http get request has failed. actor_controller.js:33");
        });
    });
}]);