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
                
        $http.get("/search_actors_by_id/" + $routeParams.tagId).success(function(response_1){
            //validate the url tagId to make sure the event exists
            if(response_1 != undefined){
                
                var artist_object = response_1.artist;
                
                console.log(artist_object);
                
                if(artist_object != undefined){
                    //assign fields to scope
                    $scope.stage_name = artist_object.stage_name;
                    $scope.birth_name = artist_object.birth_name;
                    $scope.d_o_b = artist_object.d_o_b.slice(0,10);
                    $scope.loc_img_link = artist_object.links.mf_img_link;
                    $scope.bio = artist_object.bio;
                    $scope.data_sources = artist_object.data_sources;
                    $scope.nicknames = artist_object.nicknames;
                    $scope.occupations = artist_object.occupations;
                    $scope.origin = artist_object.origin;
                    
                    delete artist_object.links["mf_img_link"];
                    $scope.links = [];

                    var triple;
                    var grouped_in = 3;

                    for (var i = 0; i < Object.keys(artist_object.links).length; i++) {
                        if (!triple) {
                            triple = [];
                        }

                        record = { "button_name" : Object.keys(artist_object.links)[i],
                                  "url" : artist_object.links[Object.keys(artist_object.links)[i]] };

                        triple.push(record);

                        if (((i+1) % grouped_in) === 0) {
                            $scope.links.push(triple);
                            triple = null;
                        }
                    }
                    if (triple) {
                        $scope.links.push(triple);
                    }
                    
                    /*$scope.spotify_link = artist_object.spotify_link;
                    $scope.wikipedia_link = artist_object.wiki_page;
                    $scope.youtube_link = artist_object.youtube_link;
                    */
                    $scope.associated_actors = new Array();
                    
                    console.log(artist_object);
                    
                    for(var i = 0; i < artist_object.associated_actor_objects; i++){
                        $scope.associated_actors.push(artist_object.stage_name);
                    }
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