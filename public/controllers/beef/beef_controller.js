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
        
        /*$scope.trustSrc = function(src) {
            return $sce.trustAsResourceUrl(src);
        }*/
        
        console.log($routeParams.tagId);
        
        //make http request to server for data
        $http.get("/search/" + $routeParams.tagId).success(function(response_1){
            //validate the url tagId to make sure the event exists
            if(response_1.eventObject != undefined){
                
                var eventObject = response_1.eventObject;
                console.log(eventObject);
                
                    //make http request to server for data
                    $http.get("/search_artist_from_name/" + eventObject.aggressor).success(function(response_2){
                        //validate the url tagId to make sure the event exists
                        if(response_2.eventObject != undefined){

                            var artist = response_2.eventObject;

                            //assign fields to scope
                            $scope.name = eventObject.aggressor;
                            $scope.artist_id = artist.artist_id;
                            $scope.song_title = eventObject.title;
                            $scope.date = eventObject.event_date.slice(0,10);
                            $scope.description = eventObject.description;
                            $scope.img_link = eventObject.image_link;
                            $scope.top_lyrics = new Array();
                            $scope.url = eventObject.url;
                            $scope.event_id = eventObject._id;

                            if(Object.keys(eventObject.top_lyrics).length < 1){
                                $scope.top_lyrics.push("Not applicable");
                            }
                            else{
                                //loop through the top lyrics and assign them to the scope
                                for(var i = 0; i < Object.keys(eventObject.top_lyrics).length; i++){
                                    $scope.top_lyrics.push(eventObject.top_lyrics[i]);
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