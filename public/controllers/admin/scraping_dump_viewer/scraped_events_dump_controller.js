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
    
    $scope.approve_record = function(event_id){
        
        var event;
        
        //find event
        for(var i = 0; i < $scope.events.length; i++){
            
            if($scope.events[i]._id == event_id){
                event = $scope.events[i];
                break;
            }
        }
        
        var form = new FormData();

        $scope.form_data[event_id].data_sources = event.data_sources;
        $scope.form_data[event_id].img_link = event.img_title;
        $scope.form_data[event_id].media_link = event.media_link;
        $scope.form_data[event_id].highlights = [];
        $scope.form_data[event_id].targets = [];
        
        //handle highlight selection
        if($scope.form_data[event_id].highlights_selection && Object.keys($scope.form_data[event_id].highlights_selection).length){
            for(var i = 0; i < Object.keys($scope.form_data[event_id].highlights_selection).length; i++){
                var highlight_index = Object.keys($scope.form_data[event_id].highlights_selection)[i];

                $scope.form_data[event_id].highlights.push(event.highlights[highlight_index]);
            }
            delete $scope.form_data[event_id].highlights_selection;
        }
        
        //handle highlight selection
        if($scope.form_data[event_id].targets_selection && Object.keys($scope.form_data[event_id].targets_selection).length){
            for(var i = 0; i < Object.keys($scope.form_data[event_id].targets_selection).length; i++){
                var target_index = Object.keys($scope.form_data[event_id].targets_selection)[i];

                $scope.form_data[event_id].targets.push(event.relevant_actors[target_index].db_id);
            }
            delete $scope.form_data[event_id].targets_selection;
        }
        
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
            $scope.form_data[event_id].date = date_split[0] + "/" + date_split[1] + "/" + date_split[2];
        }
        
        console.log($scope.form_data[event_id]);
        
        
        //formdata.append('data', $scope.form_data);
        console.log(fileService[0])
        form.append('attachment', fileService[0]);
        form.append('data', JSON.stringify($scope.form_data));        

        console.log(form);
        
        /*return $http({
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
    
    $scope.scrape_actor = function(actor, event_id){
        
        //invoke an endpoint to searh the db for an actor with name == actor, return _id if exists, avoid scraping if an _id is returned and assign _id to actor.db_id
        $http({
            method: 'GET',
            url: "/search_actors_by_stage_name/" + actor
        }).then(function(response_1){
            
            console.log(response_1);
            
            var actors = response_1.data.actors;
            
            if(actors.length == 1){
                            
                for(var i = 0; i < $scope.events.length; i++){

                    var event = $scope.events[i];
                    if(event._id == event_id){
                        for(var j = 0; j < event.relevant_actors.length; j++){
                            var rel_actor = event.relevant_actors[j];
                            if(rel_actor.name == actors[0].stage_name){
                                rel_actor.db_id = actors[0]._id;
                            }
                        }
                    }
                }
            }
        
            else if(actors.length == 0){
                //load events from scraping dump db table
                $http({
                    method: 'GET',
                    url: "/scrape_actor/" + actor
                }).then(function(response_2){
                    var data_scrape = JSON.parse(response_2.data.result);



                    if(typeof data_scrape == "string"){ //actor has not been found
                        alert("name cannot be scraped")
                    }
                    else if(typeof data_scrape == "object"){ //actor has been found and either data is returned or request needs more info

                        $scope.scrape_result_type = "";

                        if(data_scrape.length){ //array further options

                            $scope.scrape_result_type = "options";
                            $scope.scraping_options = data_scrape;
                            $scope.scraping_options_conf = {};
                            $scope.scraping_options_conf.conf = "";
                            $scope.scraping_options_conf.event_id = event_id;
                        }
                        else{ //data object

                            $scope.scrape_result_type = "data";
                            $scope.scrape_result = JSON.parse(data_scrape.actor_object);
                            //add extra fields to allow additions
                            $scope.scrape_result.nicknames.push("");
                            $scope.scrape_result.occupations.push("");
                            $scope.scrape_result.achievements.push("");
                            $scope.scrape_result.associated_actors.push("");
                            $scope.scrape_result.links.push("");
                            $scope.scrape_result.event_id = event_id;
                            $scope.data_dump = data_scrape.field_data_dump;

                        }
                        $("#myModal").modal({ show : true });
                    }
                    else{ //un-recognised field
                        console.log(data_scrape);
                    }        
                }, 
                function(response_2) {
                    //failed http request
                    console.log("HTTP request failed (scrapedEventsDumpController)");
                });
            }
            else{
                console.log("Found " + actors.length + "actors. ???");
            }
        }, 
        function(response_1) {
            //failed http request
            console.log("HTTP request failed (scrapedEventsDumpController)");
        });
    }
    
    $scope.approve_actor = function(actor, event_id){
        //approve actor
        var form = {};
                
        for(var i = 0; i < $scope.scrape_result.nicknames.length; i++){
            if(!$scope.scrape_result.nicknames[i].length > 0){
                $scope.scrape_result.nicknames.splice(i, 1);
                i--;
            }
        }

        for(var i = 0; i < $scope.scrape_result.occupations.length; i++){
            if(!$scope.scrape_result.occupations[i].length > 0){
                $scope.scrape_result.occupations.splice(i, 1);
                i--;
            }
        }

        for(var i = 0; i < $scope.scrape_result.achievements.length; i++){
            if(!$scope.scrape_result.achievements[i].length > 0){
                $scope.scrape_result.achievements.splice(i, 1);
                i--;
            }
        }

        for(var i = 0; i < $scope.scrape_result.data_sources.length; i++){
            if(!$scope.scrape_result.data_sources[i].length > 0){
                $scope.scrape_result.data_sources.splice(i, 1);
            }
        }

        for(var i = 0; i < $scope.scrape_result.links.length; i++){
            if(!$scope.scrape_result.links[i].length > 0){
                $scope.scrape_result.links.splice(i, 1);
            }
        }
        
        form.stage_name = $scope.scrape_result.stage_name;
        form.birth_name = $scope.scrape_result.birth_name;
        form.nicknames = $scope.scrape_result.nicknames;
        form.date = $scope.scrape_result.d_o_b;
        form.occupations = $scope.scrape_result.occupations;
        form.bio = $scope.scrape_result.bio;
        form.achievements = $scope.scrape_result.achievements;
        form.origin = $scope.scrape_result.origin;
        form.assoc_actors = $scope.scrape_result.associated_actors;
        form.data_sources = [$scope.scrape_result.data_sources];
        form.img_title = $scope.scrape_result.img_title;
        form.button_links = $scope.scrape_result.links;
        
        //form.append('data', form);
        form = JSON.stringify({data: form});
                
        return $http({
            url: "/submit_actordata",
            method: 'POST',
            data: form,
            headers: { 'Content-Type': "application/json"}
            //headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        })
        .then(function (success) {
            console.log("Upload succeeded.");
            //$window.location.href = '/submission_confirmation';
            console.log(success);
            console.log(success.data.id);
            
            //store newly created id
            
            
            $('#myModal').modal('hide'); //close modal
            
            for(var i = 0; i < $scope.events.length; i++){
                
                var event = $scope.events[i];
                if(event._id == event_id){
                    for(var j = 0; j < event.relevant_actors.length; j++){
                        var rel_actor = event.relevant_actors[j];
                        if(rel_actor.name == $scope.scrape_result.stage_name){
                            rel_actor.db_id = success.data.id;
                        }
                    }
                }
            }            
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
    
    $scope.show_modal = function(bool){
        $("#myModal").modal({ show : bool });
    }
}]);