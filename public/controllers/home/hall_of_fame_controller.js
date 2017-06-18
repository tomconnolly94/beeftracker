/////////////////////////////////////////////////////////////////////////////////
//
//  File: event_stream_controller.js
//  Project: beeftracker
//  Contributors: Tom Connolly
//  Description: Sends a HTTP request to the node server to extract data from the
//                  db and return it. With the HTTP is sent a 'limit' so express 
//                  knows how many records to return. These events are then assigned
//                  to the $scope.
//
/////////////////////////////////////////////////////////////////////////////////

home_app.controller('hofController', ['$scope','$http', function($scope, $http) {
        
    //number of recent events to be displayed make sure its a multiple of three for symmetry
    var result_limit = 6;
    
    //$http.get("/search_recent_events/" + result_limit).success(function(events_object){
    $http({
        method: 'GET',
        url: "/search_popular_events/" + result_limit
    }).then(function(events_object){
        //validate the url tagId to make sure the event exists                
        if(events_object != undefined){

            var events = events_object.data.events;
            
            console.log(events);
            
            //$scope.event_stream_events = new Array();
            $scope.event_stream_events_col_1 = new Array();
            $scope.event_stream_events_col_2 = new Array();
            $scope.event_stream_events_col_3 = new Array();
            
            var column_for_insert = 1;

            for(var eventId = 0; eventId < events.length; eventId++){

                //create array to hold artists top lyrics
                var best_lyrics = new Array();
                var artist_object = events[eventId].aggressor_object[0];

                //create data record
                var event = {
                    name : artist_object.stage_name,
                    title : events[eventId].title,
                    description : events[eventId].description,
                    date : events[eventId].event_date.slice(0,10),
                    img_link : events[eventId].links.mf_img_link,
                    top_lyrics : best_lyrics,
                    eventNum : events[eventId]._id
                };

                //add data record to global scope
                //$scope.event_stream_events[eventId] = event;
                
                if(column_for_insert == 1){
                    $scope.event_stream_events_col_1.push(event);
                    column_for_insert++;
                }
                else if(column_for_insert == 2){
                    $scope.event_stream_events_col_2.push(event);
                    column_for_insert++;
                }
                else{
                    $scope.event_stream_events_col_3.push(event);
                    column_for_insert = 1;
                }
                
            }
        }
        else{
            //error msg
            console.log("No events found in database");
        }
    }, 
    function(response) {
        //failed http request
        console.log("Error in HTTP request in search_controller.js:searchController");
    });
}]);