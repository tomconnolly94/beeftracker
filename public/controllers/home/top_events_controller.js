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

home_app.controller('topEventsController', ['$scope','$http', function($scope, $http) {
        
    //number of recent events to be displayed make sure its a multiple of three for symmetry
    var result_limit = 10;
    
    //$http.get("/search_recent_events/" + result_limit).success(function(events_object){
    $http({
        method: 'GET',
        url: "/search_popular_events/" + result_limit
    }).then(function(events_object){
        //validate the url tagId to make sure the event exists                
        if(events_object != undefined){

            var events = events_object.data.events;
            
            console.log(events);
            
            $scope.events = new Array();
            
            for(var i = 0; i < events.length; i++){
                
                event = events[i]
                
                $scope.events[i] = {
                    id : i + 1,
                    _id : event._id,
                    title : event.title,
                    aggressor : event.aggressor_object[0].stage_name,
                    img_title : event.img_title,
                    date : event.event_date
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