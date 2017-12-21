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
    
    //init
    $scope.server_auth_error = false;
    $scope.server_auth_success = false;
    var cookies = document.cookie.split(";")

    //search through cookies to check if we are logged in
    for(var i = 0; i < cookies.length; i++){
        var compare = cookies[i].trim().split("=")[0];
        if("logged_in" == compare.trim().split("=")[0]){
            $scope.server_auth_success = true;
        }
    }
    
    $scope.authenticate = function(){
        
        
        $.ajax({
            url: 'http://gd.geobytes.com/GetCityDetails?callback=?',
            dataType: 'json',
            success: function( data ) {
                var client_ip = JSON.stringify(data, null, 2);
                
                //validation 
                //escape html < characters and text contained in them to avoid xss attacks
                var validated_username = $scope.sanitise_data($scope.username);
                var validated_password = $scope.sanitise_data($scope.password);

                var auth_data = JSON.stringify({ username: validated_username, password: validated_password, client_ip_address: data.geobytesipaddress });
                send_auth_req(auth_data);
            },
            error: function( data ) {
                var auth_data = JSON.stringify({ username: validated_username, password: validated_password });
                send_auth_req(auth_data);
            }
        });
        
        var send_auth_req = function(auth_data){
            
            $http({
                method: 'POST',
                url: "/auth_user/",
                data: auth_data,
                //assign content-type as undefined, the browser will assign the correct boundary
                headers: { 'Content-Type': "application/json"}
            }).then(function(return_data){

                auth_return = return_data.data;
                console.log(auth_return);
                
                if(auth_return.auth_success){
                    $scope.server_auth_success = true;
                    //if(window.location.href.split("/")[window.location.href.split("/").length-1] != "authenticate"){
                        location.reload();
                    //}
                }
                else{
                    $scope.server_auth_error = true;
                }
            }, 
            function(response) {
                //failed http request
                console.log("Error in HTTP request");
            });    
        }
    }
    
    $scope.register_user = function(){
        
        //escape html < characters and text contained in them to avoid xss attacks
        var validated_username = $scope.sanitise_data($scope.username);
        var validated_password = $scope.sanitise_data($scope.password);

        var auth_data = JSON.stringify({ username: validated_username, password: validated_password });
        
        $http({
            method: 'POST',
            url: "/register_user/",
            data: auth_data,
            //assign content-type as undefined, the browser will assign the correct boundary
            headers: { 'Content-Type': "application/json"},
        }).then(function(return_data){

            auth_return = return_data.data;

            console.log(auth_return);

        }, 
        function(response) {
            //failed http request
            console.log("Error in HTTP request");
        });
    }
    
    $scope.sanitise_data = function(data){
        return data.replace(/ *\<[^>]*\> */g,"");
    }
}]);