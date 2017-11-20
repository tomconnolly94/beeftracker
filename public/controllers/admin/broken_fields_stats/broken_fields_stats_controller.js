/////////////////////////////////////////////////////////////////////////////////
//
//  File: broken_fields_stats_controller.js
//  Project: beeftracker
//  Contributors: Tom Connolly
//  Description: Sends a HTTP request to the node server to extract data from the
//                  db and return it. With the HTTP, is sent an ID which allows express
//                  to locate the correct record. This data this then bound to variables
//                  in the $scope.
//
/////////////////////////////////////////////////////////////////////////////////

broken_fields_stats_app.controller("brokenFieldsStatsController", ['$scope','$http','$sce', function($scope,$http, $sce) {
    
    
    $scope.load_broken_field_data = function(){
        //load events from scraping dump db table
        $http({
            method: 'GET',
            url: "/get_broken_fields_stats/"
        }).then(function(response_1){
            $scope.data = response_1.data.data;
            console.log($scope.data);
            
            $scope.sources = [];
            
            for(var i = 0; i < $scope.data.length; i++){
                
                var base_source = $scope.data[i].source.split("/")[2];
                
                if($scope.sources.indexOf(base_source) == -1){
                    console.log(base_source);
                    $scope.sources.push(base_source);
                }
            }
            console.log($scope.sources);
        }, 
        function(response_1) {
            //failed http request
            console.log("HTTP request failed (brokenFieldsStatsController)");
        });
    }
    
    $scope.load_broken_field_data();
}]);