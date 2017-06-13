/////////////////////////////////////////////////////////////////////////////////
//
//  File: actor_controller.js
//  Project: beeftracker
//  Contributors: Tom Connolly
//  Description: Sends a HTTP request to the node server to extract data from the
//                  db and return it. With the HTTP is sent an ID which allows express
//                  to locate the correct record. This data this then bound to variables
//                  in the $scope.
//
/////////////////////////////////////////////////////////////////////////////////
list_app.controller("listController", ['$scope','$http', '$routeParams', function($scope,$http,$routeParams) {
    
    //wait untill module has been configured before running this
    $scope.$on('$routeChangeSuccess', function() {
        
        if($routeParams.tagId == "actors"){
            $http({
                method: 'GET',
                url: "/search_all_actors/"
            }).then(function(response){
            
                console.log(response);
                $scope.items = response.data.items;
                
                for(var i = 0; i < $scope.items.length; i++){
                    $scope.items[i].link = "/actor/" + $scope.items[i]._id
                }
                
            }, 
            function(response) {
                //failed http request
                console.log("The client http get request has failed. actor_controller.js:33");
            });
        }
        else if($routeParams.tagId == "events"){
            $http({
                method: 'GET',
                url: "/search_all_events/"
            }).then(function(response){
            
                console.log(response);
                $scope.items = response.data.items;
                
                for(var i = 0; i < $scope.items.length; i++){
                    $scope.items[i].link = "/beef/" + $scope.items[i]._id
                }
            }, 
            function(response) {
                //failed http request
                console.log("The client http get request has failed. actor_controller.js:33");
            });
        }
       
    });
}]);