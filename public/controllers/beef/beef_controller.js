/////////////////////////////////////////////////////////////////////////////////
//
//  File: beef_controller.js
//  Project: beeftracker
//  Contributors: Tom Connolly
//  Description: Sends a HTTP request to the node server to extract data from the
//                  db and return it. With the HTTP, is sent an ID which allows express
//                  to locate the correct record. This data this then bound to variables
//                  in the $scope.
//
/////////////////////////////////////////////////////////////////////////////////

beef_app.controller("currentEventController", ['$scope','$http', '$routeParams', '$sce', function($scope,$http,$routeParams,$sce) {
    
    //wait untill module has been configured before running this
    $scope.$on('$routeChangeSuccess', function() {
        
        $scope.trustSrc = function(src) {
            return $sce.trustAsResourceUrl(src);
        }
        
        //make http request to server for data
        $http.get("/search_events_by_id/" + $routeParams.tagId).success(function(response_1){
            //validate the url tagId to make sure the event exists
            if(response_1.eventObject != undefined){
                
                var eventObject = response_1.eventObject;
                
                    //make http request to server for data
                    $http.get("/search_actors_by_id/" + eventObject.aggressor).success(function(response_2){
                        //validate the url tagId to make sure the event exists
                        if(response_2.artist != undefined){
                            
                            var artist = response_2.artist;

                            //assign fields to scope
                            $scope.name = artist.stage_name;
                            $scope.artist_id = artist._id;
                            $scope.song_title = eventObject.title;
                            $scope.date = eventObject.event_date.slice(0, 10);
                            $scope.description = eventObject.description;
                            $scope.img_link = eventObject.loc_img_link;
                            $scope.highlights = eventObject.highlights;
                            console.log(eventObject.highlights);
                            $scope.youtube_link = eventObject.youtube_link;
                            $scope.spotify_link = eventObject.spotify_link;
                            $scope.genius_link = eventObject.genius_link;
                            $scope.wikipedia_link = eventObject.wikipedia_link;
                            $scope.data_sources = eventObject.data_sources;
                            $scope.event_id = eventObject._id;

                            /*if(Object.keys(eventObject.top_lyrics).length >= 1){
                                
                                $scope.top_lyrics = new Array();
                                
                                //loop through the top lyrics and assign them to the scope
                                for(var i = 0; i < Object.keys(eventObject.top_lyrics).length; i++){              
                                    $scope.top_lyrics[i] = eventObject.top_lyrics[i];
                                }
                            }*/
                            
                            if(Object.keys(eventObject.data_sources).length >= 1){
                                $scope.data_sources = new Array();
                                //loop through the top lyrics and assign them to the scope
                                for(var i = 0; i < Object.keys(eventObject.data_sources).length; i++){                     
                                    $scope.data_sources[i] = eventObject.data_sources[i];
                                }
                            }
                        }
                        else{
                            //error msg
                            console.log("An incorrect event_id has been used. please check the url")
                        }
                    }, 
                    function(response_2) {
                        //failed http request
                        console.log("Something went wrong");
                    });
            }
            else{
                //error msg
                console.log("An incorrect event_id has been used. please check the url")
            }
        }, 
        function(response_1) {
            //failed http request
            console.log("Something went wrong");
        });
    });
}]);