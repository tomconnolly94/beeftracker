/////////////////////////////////////////////////////////////////////////////////
//
//  File: scraped_events_controller.js
//  Project: beeftracker
//  Contributors: Tom Connolly
//  Description: Sends a HTTP request to the node server to extract data from the
//                  db and return it. With the HTTP, is sent an ID which allows express
//                  to locate the correct record. This data this then bound to variables
//                  in the $scope.
//
/////////////////////////////////////////////////////////////////////////////////

recently_confirmed_app.controller("recentlyConfirmedController", ['$scope','$http','$sce', function($scope,$http, $sce) {
    
    
    $scope.load_recent_events = function(){
        //load events from scraping dump db table
        $http({
            method: 'GET',
            url: "/search_recent_events/" + 10
        }).then(function(response_1){
            $scope.events = response_1.data.events;
            console.log($scope.events);

            $scope.form_data = {};

            for(var i = 0; i < $scope.events.length; i++){
                $scope.form_data[$scope.events[i]._id] = {};
                $scope.form_data[$scope.events[i]._id].title = $scope.events[i].title;
                $scope.form_data[$scope.events[i]._id].targets = {};
                $scope.form_data[$scope.events[i]._id].description = $scope.events[i].description;
                $scope.form_data[$scope.events[i]._id].categories_selection = {};
                $scope.form_data[$scope.events[i]._id].delete_checkbox = false;
                
                $scope.events[i].img_title = EVENT_IMAGES_PATH + $scope.events[i].img_title;
                if($scope.events[i].special_feature && $scope.events[i].special_feature.content){
                    $scope.events[i].media_link = $scope.events[i].special_feature.content;                   
                }
            }
            
            $scope.main_event = "";
            $scope.event_one = "";
            $scope.event_two = "";
            $scope.event_three = "";
        }, 
        function(response_1) {
            //failed http request
            console.log("HTTP request failed (scrapedEventsDumpController)");
        });
    }
    
    $scope.load_recent_events();
    
    $scope.set_event = function(event_string, event_id){
                
        $scope[event_string] = event_id;
    }
    
    $scope.submit_config = function(event_string, event_id){
        
        if($scope.main_event && $scope.main_event != "" &&
           $scope.event_one && $scope.event_one != "" &&
           $scope.event_two && $scope.event_two != "" &&
           $scope.event_three && $scope.event_three != ""
          ){
        
            var send_event = [
                $scope.main_event,
                $scope.event_one,            
                $scope.event_two,            
                $scope.event_three,            
            ];
            
            console.log({ event_ids: send_event } );

            return $http({
                url: "/set_splash_zone_events",
                method: 'POST',
                data: { event_ids: send_event },
                headers: { 'Content-Type': "application/json"}
            })
            .then(function (success) {

                console.log("Upload succeeded.");

            }, function (error) {
                console.log("Upload failed.");
                console.log(error);
            });
        }
        else{

            console.log("Selections are not present for all event slots, please make sure an event is assigned to 'main' 1 2 and 3")
        }
    }
    
    $scope.trustSrc = function(src) {
        return $sce.trustAsResourceUrl(src);
    }
}]);