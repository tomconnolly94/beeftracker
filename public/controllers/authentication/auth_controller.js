/////////////////////////////////////////////////////////////////////////////////
//
//  File: auth_controller.js
//  Project: beeftracker
//  Contributors: Tom Connolly
//  Description: Sends a HTTP request to the node server to extract data from the
//                  db and return it. With the HTTP is sent a 'limit' so express 
//                  knows how many records to return. These events are then assigned
//                  to the $scope.
//
/////////////////////////////////////////////////////////////////////////////////

auth_app.controller('authController', ['$scope','$http', function($scope, $http, $httpProvider) {
        
    $scope.send_auth_details = function(){
        
        $.ajax({
            url: 'http://gd.geobytes.com/GetCityDetails?callback=?',
            dataType: 'json',
            success: function( data ) {
                var client_ip = JSON.stringify(data, null, 2);

                var auth_data = JSON.stringify({ username: $scope.username, password: $scope.password, client_ip_address: data.geobytesipaddress });
                send_req(auth_data);
            },
            error: function( data ) {
                var auth_data = JSON.stringify({ username: $scope.username, password: $scope.password });
                send_req(auth_data);
            }
        });
        
        var send_req = function(auth_data){
            
            $http({
                method: 'POST',
                url: "/auth_user/",
                data: auth_data,
                //assign content-type as undefined, the browser will assign the correct boundary
                headers: { 'Content-Type': "application/json"},
            }).then(function(return_data){

                auth_return = return_data.data;
                
                console.log(auth_return);
                
                if(auth_return.message == "Authentication details not found."){
                    console.log(auth_return.message);
                }
                else{
                    
                    //validate the url tagId to make sure the event exists                
                    if(auth_return != undefined){
                        localStorage["auth_token"] = auth_return.token;
                        
                    }
                    else{
                        //error msg
                        console.log("No events found in database");
                    }
                }
            }, 
            function(response) {
                //failed http request
                console.log("Error in HTTP request in search_controller.js:searchController");
            });    
        }
    }
}]);