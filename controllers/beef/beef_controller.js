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

beefapp.controller("currentEventController", ['$scope','$http', '$routeParams', '$sce', function($scope,$http,$routeParams,$sce) {
    
    //wait untill module has been configured before running this
    $scope.$on('$routeChangeSuccess', function() {
        
        $scope.trustSrc = function(src) {
            return $sce.trustAsResourceUrl(src);
        }
        
        //make http request to server for data
        $http.get("/search/" + $routeParams.tagId).success(function(response){
            //validate the url tagId to make sure the event exists
            if(response.eventObject != undefined){
                
                var eventObject = response.eventObject;
                
                //assign fields to scope
                $scope.name = eventObject.aggressor;
                $scope.song_title = eventObject.title;
                $scope.date = eventObject.event_date.slice(0,10);
                $scope.description = eventObject.description;
                $scope.img_link = "/artist_images/" + eventObject.image_link;
                $scope.top_lyrics = new Array();
                $scope.url = eventObject.url;
                $scope.event_id = eventObject.event_id;
                                
                //loop through the top lyrics and assign them to the scope
                for(var i = 0; i < Object.keys(eventObject.top_lyrics).length; i++){
                    $scope.top_lyrics.push(eventObject.top_lyrics[i]);
                }
            }
            else{
                //error msg
                console.log("An incorrect event_id has been used. please check the url")
            }
        }, 
        function(response) {
            //failed http request
            console.log("Something went wrong");
        });
    });
}]);