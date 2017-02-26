beef_app.controller('timelineController', ['$scope','$http', '$routeParams', function($scope,$http,$routeParams) {
    
    //wait untill module has been configured before running this
    $scope.$on('$routeChangeSuccess', function() {
        $scope.handle_change();
    });
    
    var first_run = true;
    
    $scope.handle_change = function(){
        
        //hold onto the main agressor for checks later which help positioning
        var main_aggressor;
        
        $http.get("/search/" + $routeParams.tagId).success(function(response_1){
            //validate the url tagId to make sure the event exists
            if(response_1.eventObject != undefined){
                main_aggressor = response_1.eventObject.aggressor;
                console.log($routeParams.tagId);
                console.log(response_1.eventObject);
                
                if(first_run){
                    
                    if($scope.selected_targets == undefined){
                        $scope.selected_targets = new Array();
                    }
                    
                    for(var i = 0; i < Object.keys(response_1.eventObject.targets).length; i++){
                        console.log(response_1.eventObject.targets[i]);
                        $scope.selected_targets.push(response_1.eventObject.targets[i]);
                    }
                    first_run = false;
                }
               
                //make http request to server for data
                $http.get("/search_all_events_in_timeline_from_event_id/" + $routeParams.tagId).success(function(response_2){
                    //validate the url tagId to make sure the event exists
                    if(response_2.events != undefined){
                        
                        var events = response_2.events;
                        $scope.events = new Array();
                        var name_colour_map = [];
                        var colour_index = 0;

                        if($scope.drop_down == undefined){ $scope.drop_down = "All"; }
                        if($scope.main_name == undefined){ $scope.main_name = "Loading..."; }

                        //sort the events by date
                        events.sort(custom_sort);
                        
                        $scope.selected_targets.push(main_aggressor);
                        if($scope.selected_targets[0] == "None"){
                            $scope.selected_targets.slice(0,1);
                        }
                        
                        for(var event_index = 0; event_index < events.length; event_index++){
                            
                            var eventObject = events[event_index];
                            var filter_found = false;
                            
                            //if no filters are applied
                            if($scope.selected_targets == undefined || $scope.selected_targets[0] == "All"){}
                            //
                            //if some filters are applied, filter out un-neccessary records
                            else{
                                var filter_found = false;
                                //loop through filter selections, if the current event's aggressor is one of them, move into the if statement
                                for(var i = 0; i < $scope.selected_targets.length; i++){
                                    if($scope.selected_targets[i] == eventObject.aggressor){
                                        //loop through the events targets to make sure at LEAST one of the targets is a filter selection, otherwise the event is irrelevant
                                        if($scope.selected_targets.length == 1 && $scope.selected_targets[0] != "All"){
                                            
                                        }
                                        else{
                                            for(var j = 0; j < Object.keys(eventObject.targets).length; j++){
                                                //loop through the filter selections
                                                for(var k = 0; k < $scope.selected_targets.length; k++){
                                                    if($scope.selected_targets[k] == eventObject.targets[j]){
                                                        filter_found = true;
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                //if the record is to be filtered out simply skip the code that creates the event object
                                if(!filter_found){
                                    continue;
                                }
                            }
                            
                            var top_lyrics = new Array();
                            var targets = new Array();

                            //loop through the top lyrics and assign them to the scope
                            for(var i = 0; i < Object.keys(eventObject.top_lyrics).length; i++){
                                top_lyrics.push(eventObject.top_lyrics[i]);
                            }

                            targets.push("All");
                            targets.push("None");

                            //loop through the targets and assign them to the scope
                            for(var i = 0; i < Object.keys(eventObject.targets).length; i++){
                                targets.push(eventObject.targets[i]);

                            }

                            //extract an appropriate colour from the colour bank
                            if(name_colour_map[eventObject.aggressor] == undefined){
                                name_colour_map[eventObject.aggressor] = getNextColor(colour_index);
                                colour_index++;
                            }

                            var left;
                            var right;
                            //turn on/off beef_split dev events for diffrerent margin sizes
                            var beef_split_dev = false;
                            var beef_bootstrap_timeline_dev = true;
                            var timeline_event;
                            var event_glyphicon = "glyphicon ";
                            //check if object is left aligned or right aligned
                            if(eventObject.aggressor == main_aggressor){
                                if(beef_split_dev){
                                    left = "0px";
                                    right = "60%";
                                }
                                else if(beef_bootstrap_timeline_dev){
                                    timeline_event = "";
                                    event_glyphicon += "glyphicon-chevron-left";
                                }
                                else{
                                    left = 0;
                                    right = 50;
                                }
                            }else{
                                if(beef_split_dev){
                                    left = "60%";
                                    right = "0px";
                                }
                                else if(beef_bootstrap_timeline_dev){
                                    timeline_event = "timeline-inverted";
                                    event_glyphicon += "glyphicon-chevron-right";
                                }
                                else{
                                    left = 50;
                                    right = 0;
                                }
                            }
                            
                            var border_colour = "#000000";
                            var border_width = "1px";
                            
                            if(response_1.eventObject.title == eventObject.title){
                                border_colour = "#FFFFFF";
                                border_width = "5px";
                                border_width = "5px";
                            }
                            
                            console.log(onload);
                            
                            //create data record
                            var record = {
                                name : eventObject.aggressor,
                                title : eventObject.title,
                                date : eventObject.event_date.slice(0,10),
                                description : eventObject.description,
                                img_link : eventObject.image_link,
                                top_lyrics : top_lyrics,
                                targets : targets,
                                event_num : eventObject._id,
                                colour : name_colour_map[eventObject.aggressor],
                                left_margin : left,
                                right_margin : right,
                                timeline_event_class : timeline_event,
                                glyphicon : event_glyphicon,
                                border_colour : border_colour,
                                border_width : border_width
                            };
                            $scope.events.push(record);

                            if($routeParams.tagId == eventObject._id){
                                $scope.main_event = record;
                                $scope.main_name = record.name;
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
        });
             
    }
    
}]);

function custom_sort(event_1, event_2) {
    return new Date(event_2.event_date).getTime() - new Date(event_1.event_date).getTime();
}