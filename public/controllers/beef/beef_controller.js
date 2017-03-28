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
        
        console.log($routeParams.tagId);
        
        //make http request to server for data
        $http.get("/search_events_by_id/" + $routeParams.tagId).success(function(response_1){
            //validate the url tagId to make sure the event exists
            if(response_1.eventObject != undefined){
                
                var eventObject = response_1.eventObject;
                console.log(eventObject);
                
                    //make http request to server for data
                    $http.get("/search_actors_by_id/" + eventObject.aggressor).success(function(response_2){
                        //validate the url tagId to make sure the event exists
                        if(response_2.artist != undefined){
                            
                            var artist = response_2.artist;

                            //assign fields to scope
                            $scope.name = artist.stage_name;
                            $scope.artist_id = artist._id;
                            $scope.title = eventObject.title;
                            $scope.date = eventObject.event_date.slice(0, 10);
                            $scope.description = eventObject.description;
                            $scope.highlights = eventObject.highlights;
                            $scope.data_sources = Object.values(eventObject.data_sources);
                            $scope.event_id = eventObject._id;
                            
                            //if record has no video link, use the image link instead
                            if(eventObject.links.mf_video_link.length > 0){
                               $scope.mf_link = eventObject.links.mf_video_link; 
                            }
                            else{
                                $scope.mf_link = "/event_images/" + eventObject.links.mf_img_link; 
                            }
                            $scope.loc_img_link = eventObject.links.mf_img_link;
                            delete eventObject.links["mf_video_link"];
                            delete eventObject.links["mf_img_link"];
                            $scope.links = [];

                            var triple;
                            var grouped_in = 3;
                            
                            for (var i = 0; i < Object.keys(eventObject.links).length; i++) {
                                if (!triple) {
                                    triple = [];
                                }
                                
                                record = { "button_name" : Object.keys(eventObject.links)[i],
                                          "url" : eventObject.links[Object.keys(eventObject.links)[i]] };
                                
                                triple.push(record);
                                
                                if (((i+1) % grouped_in) === 0) {
                                    $scope.links.push(triple);
                                    triple = null;
                                }
                            }
                            if (triple) {
                                $scope.links.push(triple);
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