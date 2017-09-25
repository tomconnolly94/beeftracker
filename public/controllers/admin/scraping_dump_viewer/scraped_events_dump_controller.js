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
    
    
    $scope.load_scraped_events = function(){
        //load events from scraping dump db table
        $http({
            method: 'GET',
            url: "/get_scraped_events_dump/"
        }).then(function(response_1){
            $scope.events = response_1.data.events;

            $scope.form_data = {};

            for(var i = 0; i < $scope.events.length; i++){
                $scope.form_data[$scope.events[i]._id] = {};
                $scope.form_data[$scope.events[i]._id].title = $scope.events[i].title;
                $scope.form_data[$scope.events[i]._id].targets = {};
                $scope.form_data[$scope.events[i]._id].description = $scope.events[i].description;
            }
        }, 
        function(response_1) {
            //failed http request
            console.log("HTTP request failed (scrapedEventsDumpController)");
        });
    }
    
    $scope.load_scraped_events();
    
    $scope.approve_record = function(){
        
        var event;
        
        //find event
        for(var i = 0; i < $scope.events.length; i++){
            
            if($scope.events[i]._id == id){
                event = $scope.events[i];
                break;
            }
        }
        
        var form = new FormData();

        $scope.form_data[id].data_sources = event.data_sources;
        $scope.form_data[id].img_link = event.img_title;
        $scope.form_data[id].media_link = event.media_link;
        $scope.form_data[id].highlights = [];
        
        //handle highlight selection
        for(var i = 0; i < Object.keys($scope.form_data[id].highlights_selection).length; i++){
            var highlight_index = Object.keys($scope.form_data[id].highlights_selection)[i];
            
            $scope.form_data[id].highlights.push(event.highlights[highlight_index]);
        }
        delete $scope.form_data[id].highlights_selection;
        
        //handle date
        
        if(event.event_date.indexOf(" ")  > 0){
            var months = [ "january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

            var date_split = event.event_date.split(" ");

            if(date_split.length > 0){

                //handle situations where month is a string
                if(typeof date_split[1] === 'string'){
                    date_split[1] = months.indexOf(date_split[1].toLowerCase());
                }
            }
            $scope.form_data[id].date = date_split[0] + "/" + date_split[1] + "/" + date_split[2];
        }
        
        console.log($scope.form_data[id]);
        
        /*
        //formdata.append('data', $scope.form_data);
        console.log(fileService[0])
        form.append('attachment', fileService[0]);
        form.append('data', JSON.stringify($scope.form_data));        

        console.log(form);*/
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
    
    $scope.scrape_actor = function(actor){
        
        //load events from scraping dump db table
        $http({
            method: 'GET',
            url: "/scrape_actor/" + actor
        }).then(function(response_1){
            var data_scrape = response_1.data.result;
            
            if(typeof data_scrape == "string"){ //actor has not been found
                                
                console.log("string");
                alert("name cannot be scraped")
                
            }
            else if(typeof data_scrape == "object"){ //actor has been found and either data is returned or request needs more info
                
                $scope.scrape_result_type = "";
                
                if(data_scrape.length){ //array further options
                
                    $scope.scrape_result_type = "options";
                    $scope.scraping_options = data_scrape;
                    $scope.url_clarification_string = "";
                }
                else{ //data object
                    
                    $scope.scrape_result_type = "data";
                    $scope.scrape_result = JSON.parse(data_scrape.actor_object);
                    $scope.data_dump = data_scrape.field_data_dump;
                    
                }
                
                
                $("#myModal").modal({
                    show:true
                });
            }
            else{ //un-recognised field
             
                console.log(data_scrape);
            }        
            
            
            
        }, 
        function(response_1) {
            //failed http request
            console.log("HTTP request failed (scrapedEventsDumpController)");
        });
        
    }
    
    $scope.approve_actor = function(actor){
        //approve actor
        var form = new FormData();
        
        form.stage_name = $scope.scrape_result.stage_name;
        form.birth_name = $scope.scrape_result.birth_name;
        form.nicknames = $scope.scrape_result.nicknames;
        form.d_o_b = $scope.scrape_result.d_o_b;
        form.occupations = $scope.scrape_result.occupations;
        form.bio = $scope.scrape_result.bio;
        form.achievements = $scope.scrape_result.achievements;
        form.origin = $scope.scrape_result.origin;
        form.associated_actors = $scope.scrape_result.associated_actors;
        form.data_sources = $scope.scrape_result.data_sources;
        form.img_title = $scope.scrape_result.img_title;
        form.links = $scope.scrape_result.links;
        
        form.append('data', JSON.stringify(form));
        
        console.log(form);
        
        return $http({
            url: "/submit_actordata",
            method: 'POST',
            data: form,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        })
        .then(function (success) {
            console.log("Upload succeeded.");
            //$window.location.href = '/submission_confirmation';
            console.log(success);
        }, function (error) {
            console.log("Upload failed.");
            console.log(error);
        });
    }
    
    $scope.remove_record = function(id){
        
        $http({
            method: 'GET',
            url: "/discard_scraped_beef_event/" + id
        }).then(function(response_1){
            
            $scope.load_scraped_events();
        }, 
        function(response_1) {
            //failed http request
            console.log("HTTP request failed (scrapedEventsDumpController)");
        });        
    }
}]);