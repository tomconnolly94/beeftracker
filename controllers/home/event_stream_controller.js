home_app.controller('eventStreamController', ['$scope','$http', function($scope, $http) {
        
    var result_limit = 3;
    
    $http.get("/search_recent_events/" + result_limit).success(function(response){
                
        var events = response.events;
        console.log(events);

        //validate the url tagId to make sure the event exists                
        if(events != undefined){

            $scope.event_stream_events = new Array();

            for(var eventId = 0; eventId < events.length; eventId++){

                //create array to hold artists top lyrics
                var best_lyrics = new Array();

                //loop through the top lyrics and assign them to the scope
                for(var i = 0; i < Object.keys(events[eventId].top_lyrics).length; i++){
                    best_lyrics.push(events[eventId].top_lyrics[i]);
                }
                
                //create data record
                var event = {
                    name : events[eventId].aggressor,
                    title : events[eventId].title,
                    description : events[eventId].description,
                    date : events[eventId].event_date,
                    img_link : "artist_images/" + events[eventId].image_link,
                    top_lyrics : best_lyrics,
                    eventNum : events[eventId].event_id
                };

                //add data record to global scope
                $scope.event_stream_events[eventId] = event;                   
            }
            console.log($scope.event_stream_events);
        }
        else{
            //error msg
            console.log("Page not found on server");
        }
    }, 
    function(response) {
        //failed http request
        console.log("Error in HTTP request in search_controller.js:searchController");
    });
}]);