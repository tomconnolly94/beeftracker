beefapp.controller('timelineController', ['$scope','$http', '$routeParams', '$sce', function($scope,$http,$routeParams,$sce) {
    
    //wait untill module has been configured before running this
    $scope.$on('$routeChangeSuccess', function() {
        
        //make http request to server for data
        $http.get("/search_all_events_in_timeline_from_event_id/" + $routeParams.tagId).success(function(response){
            //validate the url tagId to make sure the event exists
            if(response.events != undefined){
                
                var events = response.events;
                $scope.events = new Array();
                
                //sort the events by date
                events.sort(custom_sort);
                                
                for(var event_index = 0; event_index < events.length; event_index++){
                    
                    var eventObject = events[event_index];                    
                    var top_lyrics = new Array();
                    var targets = new Array();

                    //loop through the top lyrics and assign them to the scope
                    for(var i = 0; i < Object.keys(eventObject.top_lyrics).length; i++){
                        top_lyrics.push(eventObject.top_lyrics[i]);
                    }

                    //loop through the targets and assign them to the scope
                    for(var i = -1; i < Object.keys(eventObject.targets).length; i++){
                        if(i == -1){
                            targets.push("All");
                        }
                        else{
                            targets.push(eventObject.targets[i]);
                        }
                    }
                    
                    //create data record
                    var record = {
                        name : eventObject.aggressor,
                        title : eventObject.title,
                        date : eventObject.event_date.slice(0,10),
                        description : eventObject.description,
                        img_link : "artist_images/" + eventObject.image_link,
                        top_lyrics : top_lyrics,
                        targets : targets,
                        event_num : eventObject.event_id
                    };
                    $scope.events.push(record);
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

function custom_sort(event_1, event_2) {
    return new Date(event_2.event_date).getTime() - new Date(event_1.event_date).getTime();
}