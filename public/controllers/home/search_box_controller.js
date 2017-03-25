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
                
                var objects = response.objects;
                console.log(response);
                
                //validate the url tagId to make sure the event exists                
                if(objects != undefined){
                    
                    $scope.records = new Array();
                    console.log(objects);
                    
                    for(var objectId = 0; objectId < objects.length; objectId++){
                        
                        var obj = objects[objectId];
                        var name = "";
                        var title = "";
                        
                        //if object is an event config record differently
                        if(obj.hasOwnProperty('aggressor')){
                            title = objects[objectId].title;
                            name = objects[objectId].name;
                        }
                        else{
                            title = objects[objectId].stage_name;
                        }
                        
                                                
                        //create data record
                        var record = {
                            name : name,
                            title : title,
                            img_link : objects[objectId].links.mf_img_link,
                            eventNum : objects[objectId]._id
                        };
                        
                        //add data record to global scope
                        $scope.records[objectId] = record;
                    }
                    //if there are results, provide a title for the results panel
                    if($scope.records.length > 0){
                        $scope.result_string = "Results:";
                        $scope.results_details_string = objects.length + " results:"
                    }
                    
                }
                else{
                    //error msg
                    console.log("No matching results found.");
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