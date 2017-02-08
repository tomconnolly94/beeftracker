/////////////////////////////////////////////////////////////////////////////////
//
//  File: search_box_controller.js
//  Project: beeftracker
//  Contributors: Tom Connolly
//  Description: Sends a HTTP request to the node server to extract data from the
//                  db and return it depending on the value that the user has 
//                  entered. It then accepts a response of matching events and
//                  binds them to models.
//
/////////////////////////////////////////////////////////////////////////////////

home_app.controller('searchController', ['$scope','$http', function($scope, $http) {
    
    $scope.submit = function(){
        
        console.log($scope.search_term);
        console.log($scope.search_term.length);
        
        if ($scope.search_term.length > 1 && $scope.search_term !=" ") {
            //make http request to server for data
            $http.get("/search_all/" + $scope.search_term).success(function(response){
                
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
                            img_link : events[eventId].image_link,
                            top_lyrics : best_lyrics,
                            eventNum : events[eventId]._id
                        };
                        
                        //add data record to global scope
                        $scope.records[eventId] = record;
                        if($scope.records.length > 0){
                            $scope.result_string = "Results:";
                            $scope.results_details_string = events
                        }
                    }
                    //if($scope.records.length > 0){
                        $scope.results_string = "Results:";
                        $scope.results_details_string = $scope.records.length + " search results found";
                    /*}
                    else{
                        $scope.results_string = "";
                        $scope.results_details_string = "";                        
                    }*/
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
            $scope.records = new Array();
            $scope.results_string = "";
            $scope.results_details_string = "";  
        }
    }
}]);