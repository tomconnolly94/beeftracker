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
function SearchBoxReusableController(){
    return function($scope, $http) {

        $scope.submit = function(){

            console.log($scope.search_term);

            if ($scope.search_term.length > 1 && $scope.search_term !=" ") {
                //make http request to server for data
                //$http.get("/search_all/" + $scope.search_term).success(function(response){
                $http({
                    method: 'GET',
                    url: "/search_all/" + $scope.search_term
                }).then(function(response){

                    //validate the url tagId to make sure the event exists                
                    if(response.data.objects != undefined){

                        $scope.show_results = true;
                        
                        var objects = response.data.objects;
                        console.log(response);

                        $scope.records = new Array();
                        console.log(objects);

                        for(var objectId = 0; objectId < objects.length; objectId++){

                            var obj = objects[objectId];
                            var name = "";
                            var title = "";
                            var img_link = "";
                            var content_link = "";

                            //if object is an event config record differently
                            if(obj.hasOwnProperty('aggressor')){ //object is an event
                                title = objects[objectId].title;
                                name = " - " + objects[objectId].aggressor_object[0].stage_name;
                                img_link = "/event_images/" + objects[objectId].img_title;
                                content_link = "/beef/" + objects[objectId]._id;
                            }
                            else{//object is an artists
                                title = objects[objectId].stage_name;
                                img_link = "/actor_images/" + objects[objectId].img_title;
                                content_link = "/actor/" + objects[objectId]._id;
                            }


                            //create data record
                            var record = {
                                event_num : objects[objectId]._id,
                                content_link : content_link,
                                name : name,
                                title : title,
                                img_link : img_link
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
                        
                        $scope.show_results = false;
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
                $scope.show_results = false;
                //action for if search_term is empty 
                $scope.records = new Array();
                $scope.results_string = "";
                $scope.results_details_string = "";  
            }
        }
    }
}