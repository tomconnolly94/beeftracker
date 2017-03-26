beef_app.controller('timelineController', ['$scope','$http', '$routeParams', function($scope,$http,$routeParams) {
    
    var first_run = true;
    
    //wait untill module has been configured before running this
    $scope.$on('$routeChangeSuccess', function() {
        $scope.handle_change();
        first_run = true;
    });
    
    $scope.handle_change = function(){ //function created to allow recall without page reload
        
        //hold onto the main agressor for checks later
        var main_aggressor;
        
        $http.get("/search_events_by_id/" + $routeParams.tagId).success(function(response_1){
            //validate the url tagId to make sure the event exists
            if(response_1.eventObject != undefined){
                
                //get the main event's aggressor
                $scope.main_aggressor = response_1.eventObject.aggressor_object[0];
                
                console.log(first_run);
                
                //if its the first time this function is called, init arrays
                if(first_run){
                    
                    //targets selected in filter
                    $scope.selected_targets = new Array();
                    $scope.filter_options = new Array();
                    
                    //add targets of main event to filter so theyre all shown on the timeline by default
                    for(var i = 0; i < response_1.eventObject.targets.length; i++){
                        $scope.selected_targets.push(response_1.eventObject.targets[i][0].stage_name);
                        $scope.filter_options.push(response_1.eventObject.targets[i][0].stage_name);
                    }
                    
                    $scope.filter_options.push("None");
                    //set this flag so the above code is only run once
                    first_run = false;
                }
               
                //make http request to server for data
                $http.get("/search_all_related_events_in_timeline_by_id/" + $routeParams.tagId).success(function(response_2){
                    
                    //validate the url tagId to make sure there are events to sort
                    if(response_2.events != undefined){
                        
                        //extract events array
                        var events = response_2.events;
                        //init vars to be used later
                        $scope.events = new Array();
                        var name_colour_map = [];
                        var colour_index = 0;
                        
                        //sort the events by date
                        events.sort(custom_sort);
                        
                        //add main aggressor to make sure the left hand side of the timeline is selected
                        //$scope.selected_targets.push(main_aggressor.stage_name);
                        
                        //if the 'none' option is selected clear all targets and display only the main aggressors tracks
                        /*if($scope.selected_targets[0] == "None"){
                            $scope.selected_targets = new Array();
                            $scope.selected_targets.push($scope.main_aggressor.stage_name);
                        }*/
                        
                        //loop through the list of events
                        for(var event_index = 0; event_index < events.length; event_index++){
                            
                            //extract event
                            var eventObject = events[event_index];
                            var filter_found = false;

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
                            var include_event = false;
                            
                            //check if object has same aggressor as main_event, different treatment required if so
                            if(eventObject.aggressor_object[0]._id.toString() == $scope.main_aggressor._id.toString()){
                                
                                //check if event should be included
                                outerloop:
                                //make sure at least one of the targets, is in the filter
                                for(var i = 0; i < eventObject.targets.length; i++){ //loop through the targets
                                    for(var j = 0; j < $scope.selected_targets.length; j++){ //loop through the filter options
                                        console.log($scope.selected_targets[j]);
                                        if(eventObject.targets[i][0].stage_name == $scope.selected_targets[j] || $scope.selected_targets[j] == "None"){
                                            include_event = true;
                                            break outerloop;
                                        }
                                    }
                                }
                                
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
                                // make sure the aggressor is in the filter
                                for(var j = 0; j < $scope.selected_targets.length; j++){ //loop through the filter options
                                    if(eventObject.aggressor_object[0].stage_name == $scope.selected_targets[j]){
                                        include_event = true;
                                    }
                                }
                                
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
                            console.log(include_event);

                            if(include_event){
                                var border_colour = "#000000";
                                var border_width = "1px";

                                if(response_1.eventObject.title == eventObject.title){
                                    border_colour = "#FFFFFF";
                                    border_width = "5px";
                                    border_width = "5px";
                                }

                                //create data record
                                var record = {
                                    name : eventObject.aggressor_object[0].stage_name,
                                    title : eventObject.title,
                                    date : eventObject.event_date.slice(0,10),
                                    loc_img_link : eventObject.links.mf_img_link,
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