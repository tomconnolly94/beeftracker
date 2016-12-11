search_module.controller('searchController', ['$scope','$http', function($scope, $http) {
    
    $scope.submit = function(input){
        
        console.log(input);
        console.log(input.length);
        
        if (input.length > 1 && input !=" ") {
            //make http request to server for data
            $http.get("/search_all/" + input).success(function(response){
                
                var events = response.events;
                
                //validate the url tagId to make sure the event exists                
                if(events != undefined){
                    
                    $scope.records = new Array();
                    
                    console.log(events);
                    
                    for(var eventId = 0; eventId < events.length; eventId++){
                        
                        //create array to hold artists top lyrics
                        var best_lyrics = new Array();
                        
                        //loop through the top lyrics and assign them to the scope
                        for(var i = 0; i < Object.keys(events[eventId].top_lyrics).length; i++){
                            best_lyrics.push(events[eventId].top_lyrics[i]);
                        }
                        
                        //create data record
                        var record = {
                            name : events[eventId].aggressor,
                            title : events[eventId].title,
                            date : events[eventId].description,
                            img_link : "artist_images/" + events[eventId].image_link,
                            top_lyrics : best_lyrics,
                            eventNum : events[eventId].event_id
                        };
                        
                        //add data record to global scope
                        $scope.records[eventId] = record;                   
                    }
                    console.log($scope.records);
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
        }
        else {
            //action for if search_term is empty 
            $scope.records = [{}];
        }
    }
}]);