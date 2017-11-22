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
            
            $scope.fields = [
                "title",
                "relevant_actors",
                "content",
                "date",
                "quotes",
                "categories",
                "img_link",
                "special_feature"
            ];
            $scope.broken_reasons = [
                "empty",
                "incorrect_format",
                "irrelevant",
                "too_long",
                "too_short"
            ];
            $scope.broken_reasons_headers = [
                $scope.broken_reasons[0].charAt(0) + $scope.broken_reasons[0].charAt(1),
                $scope.broken_reasons[1].charAt(0) + $scope.broken_reasons[1].charAt(10),
                $scope.broken_reasons[2].charAt(0) + $scope.broken_reasons[2].charAt(1),
                $scope.broken_reasons[3].charAt(0) + $scope.broken_reasons[3].charAt(4),
                $scope.broken_reasons[4].charAt(0) + $scope.broken_reasons[4].charAt(4),
            ];
            $scope.threshold = 15;
            
            $scope.build_stats = function(){
                
                $scope.stats = {};
                $scope.sources = [];
                
                for(var i = 0; i < $scope.data.length; i++){

                    var record = $scope.data[i];

                    var base_source = record.source.split("/")[2];

                    if($scope.sources.indexOf(base_source) == -1){
                        $scope.sources.push(base_source);

                        $scope.stats[base_source] = {};
                        for(var j = 0; j < $scope.fields.length; j++){

                            $scope.stats[base_source][$scope.fields[j]] = {};

                            for(var k = 0; k < $scope.broken_reasons.length; k++){

                                $scope.stats[base_source][$scope.fields[j]][$scope.broken_reasons[k]] = {};
                                $scope.stats[base_source][$scope.fields[j]][$scope.broken_reasons[k]].value = 0;
                                $scope.stats[base_source][$scope.fields[j]][$scope.broken_reasons[k]].bg_colour = "white";
                                $scope.stats[base_source][$scope.fields[j]][$scope.broken_reasons[k]].incorrect_values = [];
                            }
                        }
                    }
                    else{
                        $scope.stats[base_source][record.broken_field][record.broken_mode].value++;
                        $scope.stats[base_source][record.broken_field][record.broken_mode].incorrect_values.push(record.value);

                        if($scope.stats[base_source][record.broken_field][record.broken_mode].value >= $scope.threshold){
                            $scope.stats[base_source][record.broken_field][record.broken_mode].bg_colour = "red";
                        }
                    }
                }
            }
            $scope.build_stats();
            console.log($scope.stats);
        }, 
        function(response_1) {
            //failed http request
            console.log("HTTP request failed (brokenFieldsStatsController)");
        });
    }
    
    $scope.load_broken_field_data();
}]);