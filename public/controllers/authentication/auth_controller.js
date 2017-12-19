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

auth_app.controller('authController', ['$scope','$http', function($scope, $http) {
    
    console.log(document.cookie);
    
    $scope.authenticate = function(){
        
        $.ajax({
            url: 'http://gd.geobytes.com/GetCityDetails?callback=?',
            dataType: 'json',
            success: function( data ) {
                var client_ip = JSON.stringify(data, null, 2);

                var auth_data = JSON.stringify({ username: $scope.username, password: $scope.password, client_ip_address: data.geobytesipaddress });
                send_auth_req(auth_data);
            },
            error: function( data ) {
                var auth_data = JSON.stringify({ username: $scope.username, password: $scope.password });
                send_auth_req(auth_data);
            }
        });
        
        var send_auth_req = function(auth_data){
            
            $http({
                method: 'POST',
                url: "/auth_user/",
                data: auth_data,
                //assign content-type as undefined, the browser will assign the correct boundary
                headers: { 'Content-Type': "application/json"},
            }).then(function(return_data){

                auth_return = return_data.data;
                console.log(auth_return);
                
                if(auth_return.auth_success){
                    location.reload();
                }
            }, 
            function(response) {
                //failed http request
                console.log("Error in HTTP request");
            });    
        }
    }    
    $scope.deauthenticate = function(){
                        
        var send_deauth_req = function(){
            
            $http({
                method: 'POST',
                url: "/deauth_user/",
            }).then(function(return_data){

                auth_return = return_data.data;
                
                console.log(auth_return);
                
            }, 
            function(response) {
                //failed http request
                console.log("Error in HTTP request");
            });    
        }
        send_deauth_req();
    }
}]);