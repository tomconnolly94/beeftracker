beef_app.controller('timelineController', ['$scope','$http', '$routeParams', function($scope,$http,$routeParams) {
    
    //wait untill module has been configured before running this
    $scope.$on('$routeChangeSuccess', function() {
        $scope.handle_change();
    });
    
    $scope.handle_change = function(){
        
        //hold onto the main agressor for checks later which help positioning
        var main_aggressor;
        
        $http.get("/search/" + $routeParams.tagId).success(function(response){
            //validate the url tagId to make sure the event exists
            if(response.eventObject != undefined){
                main_aggressor = response.eventObject.aggressor;
               
                //make http request to server for data
                $http.get("/search_all_events_in_timeline_from_event_id/" + $routeParams.tagId).success(function(response){
                    //validate the url tagId to make sure the event exists
                    if(response.events != undefined){

                        var events = response.events;
                        $scope.events = new Array();
                        var name_colour_map = [];
                        var colour_index = 0;

                        if($scope.drop_down == undefined){ $scope.drop_down = "All"; }
                        if($scope.main_name == undefined){ $scope.main_name = "Loading..."; }

                        //sort the events by date
                        events.sort(custom_sort);
                        
                        //$scope.selected_targets = [ "All" ];
                        if($scope.selected_targets != undefined){
                            $scope.selected_targets.push(main_aggressor);
                            if($scope.selected_targets[0] != "None"){
                                $scope.selected_targets.slice(0,1);
                            }
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
                                for(var i = 0; i < $scope.selected_targets.length; i++){
                                    console.log($scope.selected_targets[i]);
                                    console.log(eventObject.aggressor);
                                    console.log($scope.main_name);
                                    if($scope.selected_targets[i] == eventObject.aggressor){ 
                                        filter_found = true;
                                        break; 
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
                            //check if object is left aligned or right aligned
                            if(eventObject.aggressor == main_aggressor){
                                left = 0;
                                right = 50
                            }else{
                                left = 50;
                                right = 0;
                            }
                            
                            //create data record
                            var record = {
                                name : eventObject.aggressor,
                                title : eventObject.title,
                                date : eventObject.event_date.slice(0,10),
                                description : eventObject.description,
                                img_link : eventObject.image_link,
                                top_lyrics : top_lyrics,
                                targets : targets,
                                event_num : eventObject.event_id,
                                colour : name_colour_map[eventObject.aggressor],
                                left_margin : left,
                                right_margin : right
                            };
                            $scope.events.push(record);

                            if($routeParams.tagId == eventObject.event_id){
                                $scope.main_event = record;
                                $scope.main_name = record.name;
                            }
                        }
                        console.log(events);
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
            }
        });
             
    }
    
}]);

function custom_sort(event_1, event_2) {
    return new Date(event_2.event_date).getTime() - new Date(event_1.event_date).getTime();
}

function getNextColor(colour_index){
    
    var purple_colour_bank = ["#A11D5D","#83188A","#6915A1","#3D218A","#1D26A1"];
    
    var red_colour_bank = ["#9C0505","#DE0000","#D47777","#F79C9C","#FF0000"];
    
    return red_colour_bank[colour_index];
}