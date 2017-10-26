beef_app.controller('timelineController', ['$scope','$http', '$routeParams', function($scope,$http,$routeParams) {
        
    //wait untill module has been configured before running this
    $scope.$on('$routeChangeSuccess', function() {
        $scope.init_timeline(true);
    });
    
    $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
        //you also get the actual event object
        //do stuff, execute functions -- whatever...
        jump();
    });
    
    //init arrays for both sides of the filter
    $scope.lh_actors = [];
    $scope.rh_actors = [];
    $scope.lh_selected_actors = [];
    $scope.rh_selected_actors = [];
    $scope.visible_events = new Array();
    var name_colour_map = [];
    
    var actors_wrapper = [$scope.lh_actors, $scope.rh_actors];
    var selected_actors_wrapper = [$scope.lh_selected_actors, $scope.rh_selected_actors];
    
    //function to take the events returned from the server and ascertain how the filter should be configured
    $scope.configure_filter = function(main_event_object){
        
       
        actors_wrapper[0].push(main_event_object.aggressor_object[0]); //add the main events aggressor to the left hand actors array

        for(var event_index = 0; event_index < $scope.event_chain.length; event_index++){

            //extract the current event
            var event = $scope.event_chain[event_index];

            for(var wrapper_index = 0; wrapper_index < actors_wrapper.length; wrapper_index++){

                //extract collection (either $scope.lh_actors or $scope.rh_actors)
                var collection = actors_wrapper[wrapper_index];

                //loop through $scope.lh_actors or $scope.rh_actors
                for(var collection_index = 0; collection_index < collection.length; collection_index++){

                    //search for event aggressor in each list
                    if(event.aggressor == collection[collection_index]._id){

                        //if the event aggressor is in one of the lists already, add all their targets to the opposite list
                        for(var target_index = 0; target_index < event.targets.length; target_index++){
                            if(wrapper_index == 0){
                                //add the actor to the $scope.rh_actors list if it doesnt already exist
                                actors_wrapper[1].findIndex(i => i._id === event.targets[target_index][0]._id) === -1 ? actors_wrapper[1].push(event.targets[target_index][0]) : console.log();
                            }
                            else if(wrapper_index == 1){
                                //add the actor to the $scope.lh_actors list if it doesnt already exist
                                actors_wrapper[0].findIndex(i => i._id === event.targets[target_index][0]._id) === -1 ? actors_wrapper[0].push(event.targets[target_index][0]) : console.log();
                            }
                        }
                    }
                }
            }
        }

        $scope.lh_selected_actors.push(main_event_object.aggressor_object[0]);
        $scope.rh_selected_actors.push(extract_actor_name_array(main_event_object.targets)[0]);
                
    }
    
    //function to analyse the filter and ascertain which events should currently be visible
    $scope.configure_visible_events = function(){
        $scope.visible_events = [];
        var selected_actors_wrapper = [$scope.lh_selected_actors, $scope.rh_selected_actors];

        //choose which artists should be selected based on initial event
        for(var event_index = 0; event_index < $scope.event_chain.length; event_index++){

            //extract the current event
            var event = $scope.event_chain[event_index];

            for(var wrapper_index = 0; wrapper_index < selected_actors_wrapper.length; wrapper_index++){

                //extract collection (either $scope.lh_actors or $scope.rh_actors)
                var collection = selected_actors_wrapper[wrapper_index];

                //loop through $scope.lh_actors, if 
                for(var collection_index = 0; collection_index < collection.length; collection_index++){

                    //search for event aggressor in each list
                    if(event.aggressor == collection[collection_index]._id){

                        for(var target_index = 0; target_index < event.targets.length; target_index++){

                            var target = event.targets[target_index][0];

                            //find opposite list index
                            var opposite_index = 0;
                            if(wrapper_index == 0){ opposite_index++;}

                            if(selected_actors_wrapper[opposite_index].findIndex(i => i._id === target._id) != -1){

                                //if the event.aggressor is in collection 0 built the event and add itto the event chain
                                if(wrapper_index == 0){
                                       $scope.visible_events.findIndex(i => i._id === event._id) === -1 ? $scope.visible_events.push(build_event(event, true, main_event_object, name_colour_map)) : console.log();
                                }
                                else if(wrapper_index == 1){
                                    $scope.visible_events.findIndex(i => i._id === event._id) === -1 ? $scope.visible_events.push(build_event(event, false, main_event_object, name_colour_map)) : console.log();
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    //function to request data from server and configure both the filter and the timeline
    $scope.init_timeline = function(reconfig_actors){ 
        
        //hold onto the main agressor for checks later
        var main_aggressor;
        
        $http({
            method: 'GET',
            url: "/search_events_by_id/" + $routeParams.tagId
        }).then(function(response_1){
            
            //validate the response to make sure something is returned
            if(response_1.data.eventObject != undefined){
                
                //make http request to server for data
                $http({
                    method: 'GET',
                    url: "/search_all_related_events_in_timeline_by_id/" + $routeParams.tagId
                }).then(function(response_2){
                    
                    //ensure the server returns some events
                    if(response_2.data.events != undefined){
                    
                        
                        $scope.event_chain = response_2.data.events;//extract the event chain from the http response
                        
                        $scope.event_chain.sort(custom_sort);//sort the events by date
                        
                        main_event_object = response_1.data.eventObject; //extract main_event
                        
                        $scope.configure_filter(main_event_object);//run function to scan aggressors and configure the filter
                            
                        $scope.configure_visible_events();//run function to analyse the filter and select which events should be visible
                        
                        console.log($scope.visible_events);
                    }
                    else{
                        //error msg
                        console.log("An incorrect event_id has been used. please check the url.");
                    }
                },
                function(response_2) {
                    //failed http request
                    console.log("Event Chain not available from server.");
                });
            }
        },
        function(response_2) {
            //failed http request
            console.log("Main Event not available from server.");
        }
        );
    }
}]);

function custom_sort(event_1, event_2) {
    return new Date(event_2.event_date).getTime() - new Date(event_1.event_date).getTime();
}

function extract_actor_name_array(actor_object_array){
    
    var names = new Array();
    
    for(var i = 0; i < actor_object_array.length;i++){
        names.push(actor_object_array[i][0]);
    }
    return names;
}
        
function build_event(event, lh_side, main_event, name_colour_map){
                  
    var timeline_event;
    var event_glyphicon = "glyphicon ";
    var width = 150;
    var side_panel_indent;
    
    if(lh_side){
        timeline_event = "";
        event_glyphicon += "glyphicon-chevron-left";
        side_panel_indent = 0;
    }
    else{
        timeline_event = "timeline-inverted";
        event_glyphicon += "glyphicon-chevron-right";
        side_panel_indent = 150;
    }
    
    
    var border_colour = "#000000";
    var border_width = "1px";

    if(event.title == main_event.title){
        border_colour = "#FFFFFF";
        border_width = "5px";
    }
    
    //extract an appropriate colour from the colour bank
    if(name_colour_map[event.aggressor] == undefined){
        name_colour_map[event.aggressor] = getNextColor(colour_index);
        colour_index++;
    }

    //create event data record
    var record = {
        name : event.aggressor_object[0].stage_name,
        title : event.title,
        date : event.event_date.slice(0,10),
        loc_img_link : EVENT_IMAGES_PATH + event.img_title,
        event_num : event._id,
        colour : name_colour_map[event.aggressor],
        timeline_event_class : timeline_event,
        glyphicon : event_glyphicon,
        border_colour : border_colour,
        border_width : border_width,
        width : width,
        side_panel_indent : side_panel_indent
    };

    return record;
}