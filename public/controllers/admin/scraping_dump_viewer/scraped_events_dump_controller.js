/////////////////////////////////////////////////////////////////////////////////
//
//  File: scraped_events_controller.js
//  Project: beeftracker
//  Contributors: Tom Connolly
//  Description: Sends a HTTP request to the node server to extract data from the
//                  db and return it. With the HTTP, is sent an ID which allows express
//                  to locate the correct record. This data this then bound to variables
//                  in the $scope.
//
/////////////////////////////////////////////////////////////////////////////////

scraping_dump_viewer_app.controller("scrapedEventsDumpController", ['$scope','$http', function($scope,$http) {
    
    //load events from scraping dump db table
    $http({
        method: 'GET',
        url: "/get_scraped_events_dump/"
    }).then(function(response_1){
        $scope.events = response_1.data.events;
    }, 
    function(response_1) {
        //failed http request
        console.log("HTTP request failed (scrapedEventsDumpController)");
    });
    
    $scope.approve_record = function(){
        
        
    }
    
    $scope.remove_record = function(id, form_data){
        
        var event;
        
        //find event
        for(var i = 0; i < $scope.events.length; i++){
            
            if($scope.events[i]._id == id){
                event = $scope.events[i];
                break;
            }
        }
        
        var form = new FormData();

        $scope.form_data.title = event.title;
        $scope.form_data.aggressor = $scope.aggressor;
        $scope.form_data.targets = $scope.targets;
        if($scope.special_feature_select != undefined){
            $scope.form_data.special_feature = {
                type : JSON.parse($scope.special_feature_select).db_ref,
                content : $scope.special_feature.content
            }
        }
        $scope.form_data.description = $scope.description;
        $scope.form_data.date = $scope.datePicker;
        $scope.form_data.highlights = $scope.highlights;
        $scope.form_data.data_sources = $scope.data_sources;
        $scope.form_data.button_links = $scope.button_links;
        $scope.form_data.selected_categories = $scope.selected_categories;

        for(var i = 0; i < $scope.highlights.length; i++){
            if(!$scope.highlights[i].title.length > 0){
                $scope.highlights.splice(i, 1);
                i--;
                continue;
            }

            if($scope.highlights[i].fields.length > 0){
                //remove empty highlight content fields
                for(var j = 0; j < $scope.highlights[i].fields.length; j++){
                    if(!$scope.highlights[i].fields[j].text.length > 0){
                        $scope.highlights[i].fields.splice(j, 1);
                        j--;
                    }
                }
            }
            else{
                $scope.highlights.splice(i, 1);
                i--;
            }
        }

        for(var i = 0; i < $scope.data_sources.length; i++){
            if(!$scope.data_sources[i].url.length > 0){
                $scope.data_sources.splice(i, 1);
            }
        }

        for(var i = 0; i < $scope.button_links.length; i++){
            if(!$scope.button_links[i].url.length > 0 || !$scope.button_links[i].title.length > 0 ){
                $scope.button_links.splice(i, 1);
            }
        }

        console.log($scope.form_data);

        //formdata.append('data', $scope.form_data);
        console.log(fileService[0])
        form.append('attachment', fileService[0]);
        form.append('data', JSON.stringify($scope.form_data));        

        console.log(form);
        /*
        return $http({
            url: "/submit_beefdata",
            method: 'POST',
            data: form,
            //assign content-type as undefined, the browser
            //will assign the correct boundary for us
            headers: { 'Content-Type': undefined},
            //prevents serializing payload.  don't do it.
            transformRequest: angular.identity
        })
        .then(function (success) {
            console.log("Upload succeeded.");
            $window.location.href = '/submission_confirmation';
        }, function (error) {
            console.log("Upload failed.");
            console.log(error);
        });*/
    }
}]);