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

scraping_dump_viewer_app.controller("scrapedEventsDumpController", ['$scope','$http','$sce', function($scope,$http, $sce) {
    
    
    $scope.load_scraped_events = function(){
        //load events from scraping dump db table
        $http({
            method: 'GET',
            url: "/get_scraped_events_dump/"
        }).then(function(response_1){
            $scope.events = response_1.data.events;
            console.log($scope.events);

            $scope.form_data = {};

            for(var i = 0; i < $scope.events.length; i++){
                $scope.form_data[$scope.events[i]._id] = {};
                $scope.form_data[$scope.events[i]._id].title = $scope.events[i].title;
                $scope.form_data[$scope.events[i]._id].targets = {};
                $scope.form_data[$scope.events[i]._id].description = $scope.events[i].description;
                $scope.form_data[$scope.events[i]._id].categories_selection = {};
                $scope.form_data[$scope.events[i]._id].delete_checkbox = false;
                $scope.events[i].relevant_actors.push({name: "", db_id: ""});
            }
            $scope.get_category_data();
        }, 
        function(response_1) {
            //failed http request
            console.log("HTTP request failed (scrapedEventsDumpController)");
        });
    }
    
    $scope.load_scraped_events();
    
    //function to request data about beef event categories in order to present it in the form
    $scope.get_category_data = function(){
        //request to get artists to fill aggressor and targets option inputs
        //$http.get("/search_all_artists/").success(function(response){
        $http({
            method: 'GET',
            url: "/get_event_categories/"
        }).then(function(response){
            //validate the url tagId to make sure the event exists                
            if(response != undefined){
                console.log(response);
                
                $scope.categories = response.data.categories;
                
                for(var i = 0; i < $scope.events.length; i++){
                    
                    var event = $scope.events[i];
                    
                    for(var j = 0; j < event.selected_categories.length; j++){
                        
                        $scope.form_data[$scope.events[i]._id].categories_selection[event.selected_categories[j]] = true;
                    }
                    
                }
            }
            else{
                //error msg
                console.log("No events found in database");
            }
        }, function(response) {
            //failed http request
            console.log("Error in HTTP request in search_controller.js:searchController");
        });
    }
    
    $scope.approve_record = function(event_id){
        
        var event;
        
        //find event
        for(var i = 0; i < $scope.events.length; i++){
            
            if($scope.events[i]._id == event_id){
                event = $scope.events[i];
                break;
            }
        }
        
        $scope.form_data[event_id].data_sources = [{url: event.data_source}];
        $scope.form_data[event_id].img_title = event.img_title;
        $scope.form_data[event_id].highlights = [];
        $scope.form_data[event_id].targets = [];
        $scope.form_data[event_id].button_links = [];
        $scope.form_data[event_id].selected_categories = [];
        $scope.form_data[event_id].date = event.event_date;
        $scope.form_data[event_id].special_feature = {
            title: event.media_link.link,
            type: event.media_link.type,
            content: event.media_link.link
        };
        
        $scope.source = "scraping";
        
        //handle highlight selection
        if($scope.form_data[event_id].highlights_selection && Object.keys($scope.form_data[event_id].highlights_selection).length){
            
            var highlights_object = {};
            highlights_object.title = "Top Quotes";
            highlights_object.fields = [];
            
            for(var i = 0; i < Object.keys($scope.form_data[event_id].highlights_selection).length; i++){
                var highlight_index = Object.keys($scope.form_data[event_id].highlights_selection)[i];
                
                highlights_object.fields.push({ text: event.highlights[highlight_index] });
            }
            $scope.form_data[event_id].highlights.push(highlights_object);
            delete $scope.form_data[event_id].highlights_selection;
        }
        
        //handle targets selection
        if($scope.form_data[event_id].targets_selection && Object.keys($scope.form_data[event_id].targets_selection).length){
            for(var i = 0; i < Object.keys($scope.form_data[event_id].targets_selection).length; i++){
                var target_index = Object.keys($scope.form_data[event_id].targets_selection)[i];

                $scope.form_data[event_id].targets.push(event.relevant_actors[target_index].db_id);
            }
            delete $scope.form_data[event_id].targets_selection;
        }
        
        //handle category selection
        if($scope.form_data[event_id].categories_selection && Object.keys($scope.form_data[event_id].categories_selection).length){
            for(var i = 0; i < Object.keys($scope.form_data[event_id].categories_selection).length; i++){
                var category_index = Object.keys($scope.form_data[event_id].categories_selection)[i];

                $scope.form_data[event_id].selected_categories.push($scope.categories[category_index].cat_id);
            }
            delete $scope.form_data[event_id].categories_selection;
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
        
        $scope.form_data[event_id].record_origin = "scraped";
        
        console.log($scope.form_data[event_id]);
        var form = JSON.stringify({data: $scope.form_data[event_id]});
           
        return $http({
            url: "/submit_beefdata",
            method: 'POST',
            data: form,
            headers: { 'Content-Type': "application/json"}
            //headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        })
        .then(function (success) {
            
            console.log("Upload succeeded.");
            $scope.remove_record(event_id);
            $('.collapse').collapse('hide');
            
        }, function (error) {
            console.log("Upload failed.");
            console.log(error);
        });
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

                    console.log(data_scrape);

                    if(data_scrape.error){ //actor has not been found
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

        for(var i = 0; i < $scope.scrape_result.links.length; i++){
            if(!$scope.scrape_result.links[i].length > 0){
                $scope.scrape_result.links.splice(i, 1);
            }
            else{ 
                var link_objs = {};
                
                var str = $scope.scrape_result.links[i];
                
                var reg = /www.|.com|.co.uk|.org|.gov|.co|.fr|.de|.net|http:/ig;
                str = str.replace(reg, ""); 
                
                var link_obj = {};
                
                link_obj.title = str;
                link_obj.special_title = str;
                link_obj.url = $scope.scrape_result.links[i];
                
                $scope.scrape_result.links[i] = link_obj;
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
        form.data_sources = [$scope.scrape_result.data_source];
        form.img_title = $scope.scrape_result.img_title;
        form.button_links = $scope.scrape_result.links;
        $scope.source = "scraping";
        
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
        
        var event_ids = [id];
        
        for(var i = 0; i < $scope.events.length; i++){
            
            if($scope.form_data[$scope.events[i]._id].delete_checkbox){
                event_ids.push($scope.events[i]._id);
            }
            $scope.form_data[$scope.events[i]._id].delete_checkbox = false;
        }
        
        
        for(var i = 0; i < event_ids.length; i++){
            $http({
                method: 'DELETE',
                url: "/discard_scraped_beef_event/" + event_ids[i]
            }).then(function(response_1){

            }, 
            function(response_1) {
                //failed http request
                console.log("HTTP request failed (scrapedEventsDumpController)");
            });
        }
        $scope.load_scraped_events();
    }
    
    $scope.show_modal = function(bool){
        $("#myModal").modal({ show : bool });
    }
    
    $scope.trustSrc = function(src) {
        return $sce.trustAsResourceUrl(src);
    }
}]);