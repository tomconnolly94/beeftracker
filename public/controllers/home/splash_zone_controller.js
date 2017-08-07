/////////////////////////////////////////////////////////////////////////////////
//
//  File: splash_zone_controller.js
//  Project: beeftracker
//  Contributors: Tom Connolly
//  Description: Sends a HTTP request to the node server to extract data from the
//                  db and return it. With the HTTP is sent a 'limit' so express 
//                  knows how many records to return. These events are then assigned
//                  to the $scope.
//
/////////////////////////////////////////////////////////////////////////////////

home_app.controller('splashZoneController', ['$scope','$http', function($scope, $http) {

    //$http.get("/search_recent_events/" + result_limit).success(function(events_object){
    $http({
        method: 'GET',
        url: "/get_splash_zone_data/"
    }).then(function(events_object){
        //validate the url tagId to make sure the event exists                
        if(events_object != undefined){

            var events = events_object.data.events;
            
            $scope.splash_zone_events = new Array();
            
            for(var i = 0; i > events.length;i++){
                
                var event = events[i].resolved_event;
                
                var event_data = {
                    title : event.title,
                    aggressor : event.aggressor_object.stage_name,
                    event_date : event.event_date
                };
                
                $scope.splash_zone_events.push(event_data);
            }
        }
        else{
            //error msg
            console.log("No events found in database");
        }
    }, 
    function(response) {
        //failed http request
        console.log("Error in HTTP request in search_controller.js:splashZoneController");
    });
}]);