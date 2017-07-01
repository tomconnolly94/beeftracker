beef_app.controller('timelineController', ['$scope','$http', '$routeParams', function($scope,$http,$routeParams) {
    
    var first_run = true;
    
    //wait untill module has been configured before running this
    $scope.$on('$routeChangeSuccess', function() {
        $scope.handle_change();
        first_run = true;
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
    
    var actors_wrapper = [$scope.lh_actors, $scope.rh_actors];
    var selected_actors_wrapper = [$scope.lh_selected_actors, $scope.rh_selected_actors];
    
    $scope.handle_change = function(){ //function created to allow recall without page reload
        
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
                    
                        //extract the event chain from the http response
                        $scope.event_chain = response_2.data.events;
                        
                        console.log($scope.event_chain);
                        
                        if(first_run){
                            
                            main_event_object = response_1.data.eventObject; //extract main_event
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
                                                    actors_wrapper[1].findIndex(i => i._id === event.targets[target_index][0]._id) === -1 ? actors_wrapper[1].push(event.targets[target_index][0]) : console.log("This item already exists");
                                                }
                                                else if(wrapper_index == 1){
                                                    //add the actor to the $scope.lh_actors list if it doesnt already exist
                                                    actors_wrapper[0].findIndex(i => i._id === event.targets[target_index][0]._id) === -1 ? actors_wrapper[1].push(event.targets[target_index][0]) : console.log("This item already exists");
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            
                            $scope.lh_selected_actors.push(main_event_object.aggressor_object[0]);
                            $scope.rh_selected_actors.push(extract_actor_name_array(main_event_object.targets)[0]);
                            first_run = false;
                        }
                        
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

                                        if(wrapper_index == 0){
                                               $scope.visible_events.findIndex(i => i._id === event._id) === -1 ? $scope.visible_events.push(build_event(event, true, main_event_object)) : console.log("This item already exists");
                                        }
                                        else if(wrapper_index == 1){
                                            $scope.visible_events.findIndex(i => i._id === event._id) === -1 ? $scope.visible_events.push(build_event(event, false, main_event_object)) : console.log("This item already exists");
                                        }
                                    }
                                }
                            }
                        }
                        
                        
                        console.log(actors_wrapper);
                        console.log($scope.lh_selected_actors);
                        console.log($scope.rh_selected_actors);
                    }
                    else{
                        //error msg
                        console.log("An incorrect event_id has been used. please check the url.");
                    }
                }, 
                function(response_2) {
                    //failed http request
                    console.log("Something went wrong, event chain could not be accessed.");
                });
            }
        });
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
        
function build_event(event, lh_side, main_event){
                  
    var timeline_event;
    var event_glyphicon;
    
    if(lh_side){
        timeline_event = "";
        event_glyphicon += "glyphicon-chevron-left";
    }
    else{
        timeline_event = "timeline-inverted";
        event_glyphicon += "glyphicon-chevron-right";
    }
    
    
    var border_colour = "#000000";
    var border_width = "1px";

    if(event.title == main_event.title){
        border_colour = "#FFFFFF";
        border_width = "5px";
    }

    //create data record
    var record = {
        name : event.aggressor_object[0].stage_name,
        title : event.title,
        date : event.event_date.slice(0,10),
        loc_img_link : event.img_title,
        event_num : event._id,
        colour : "#FF2222",//name_colour_map[event.aggressor],
        timeline_event_class : timeline_event,
        glyphicon : event_glyphicon,
        border_colour : border_colour,
        border_width : border_width
    };

    return record;
}