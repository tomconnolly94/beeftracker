/////////////////////////////////////////////////////////////////////////////////
//
//  File: formController.js
//  Project: beeftracker
//  Contributors: Tom Connolly
//  Description: Handles all the interactions necessary to recieve, display, 
//                  format and send new beef data submitteed by a user
//
/////////////////////////////////////////////////////////////////////////////////
submit_app.controller('eventFormController', ['$scope','$http', 'fileService', '$window', 'deviceDetector', function($scope, $http, fileService, $window, deviceDetector) {
    
    //create var 
    $scope.form_data = {};
    //create array to hold button links
    $scope.button_links = [];
    //create array to hold data sources
    $scope.data_sources = [];
    //create array to hold highlights
    $scope.highlights = [];
    $scope.categories = [];
    $scope.datepicker = "00/00/0000";
    $scope.error_message = "";
    var test_mode = true;
    
    //function to request data about actors in order to present it in the form
    $scope.get_actor_data = function(){
        //request to get artists to fill aggressor and targets option inputs
        $http({
            method: 'GET',
            url: "/search_all_actors/"
        }).then(function(response){
            //validate the url tagId to make sure the event exists                
            if(response != undefined){
                console.log(response);
                $scope.actors = response.data.items;
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

    //function to validate inputs to ensure they will be safe and interpretable when they pulled out of the db
    $scope.validate_input = function() {
        
        var base_err = "Error: ";
        
        $scope.error_message = "";
        
        //test if title is empty
        if($scope.event_form.title.$untouched || $scope.event_form.title.length > 0){
            $scope.error_message = base_err + "Title is empty.";
            return false;
        }
        else if($scope.event_form.title.$invalid){
            $scope.error_message = base_err + "Title is not valid.";
            return false;
        }
        
        //test if aggressor is empty
        if($scope.event_form.aggressor.$untouched || $scope.event_form.aggressor.length > 0){
            $scope.error_message = base_err + "Please select an aggressor.";
            return false;
        }
        
        //test if title is empty
        if($scope.event_form.targets.$untouched || $scope.event_form.targets.length > 0){
            $scope.error_message = base_err + "Please select at least one target.";
            return false;
        }
        
        //test if title is empty
        if(fileService[0] == undefined){
            $scope.error_message = base_err + "Please select an image file for the event.";
            return false;
        }
                        
        //test if title is empty
        if($scope.event_form.description.$untouched || $scope.event_form.description.length > 0){
            $scope.error_message = base_err + "Description is empty.";
            return false;
        }
        else if($scope.event_form.title.$invalid){
            $scope.error_message = base_err + "Description is not valid.";
            return false;
        }
        
        //test if title is empty
        if($scope.event_form.datepicker == undefined){
            $scope.error_message = base_err + "Please select a date.";
            return false;
        }
        
        //test if title is empty
        if($scope.data_sources.length > 0){
            var found_valid_src = false;
            
            for(var i = 0; i < $scope.data_sources.length; i++){
                if($scope.data_sources[i].url.length > 0){
                    found_valid_src = true;
                }
                else{
                    //$scope.data_sources.splice(i,1);
                }
            }
            if(!found_valid_src){
                $scope.error_message = base_err + "Please enter at least one data source.";
                return false;
            }
        }
        
        //test if title is empty
        if(fileService[0] == undefined){
            $scope.error_message = base_err + "Please select an Image for the event.";
            return false;
        }
        
        return true;
    };
    
    //function to process, format and send all form data to servers
    $scope.process_form = function(button) {
        button.disabled = true;
        console.log($scope.event_form);
        
        if(($scope.event_form.$valid && $scope.validate_input()) || test_mode){

            var form = new FormData();
            $scope.form_data = {};
            
            $scope.form_data.title = $scope.title;
            $scope.form_data.aggressor = $scope.aggressor;
            $scope.form_data.targets = $scope.targets;
            if($scope.special_feature_select != undefined){
                $scope.form_data.special_feature = {
                    type : JSON.parse($scope.special_feature_select).db_ref,
                    content : $scope.special_feature.content
                }
            }
            $scope.form_data.description = $scope.description;
            $scope.form_data.date = $scope.datePicker.getDate() + "/" + $scope.datePicker.getMonth() + "/" + $scope.datePicker.getFullYear();
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
            });
        }
    };
    
    //function to dynamcially add input boxes for highlights
    $scope.add_highlight_event = function(){
        
        $scope.highlights.push({
            title: "",
            fields: [ { text: "", add_button: true, symbol: "+" }]
        });
    }
    
    //function to dynamcially remove input boxes for highlights
    $scope.remove_highlight_event = function(){
        
        if($scope.highlights.length > 1){
            $scope.highlights.splice($scope.highlights.length-1,1)
        }
    }
    
    //function to dynamcially add/remove sub input boxes for highlights
    $scope.modify_fields = function(highlight,field,add_button){
        
        console.log("h3llo");
        
        if(add_button){
            highlight.fields.push({
                text: "",
                add_button: false,
                symbol: "-"
            });
        }
        else{
            var specific_field_index = highlight.fields.indexOf(field);
            highlight.fields.splice(specific_field_index,1);
        }
    }
      
    //function to dynamcially add input boxes for data_sources
    $scope.add_source = function(){
        
        $scope.data_sources.push({
            url: ""
        });
    }
    
    //function to dynamcially remove input boxes for data_sources
    $scope.remove_source = function(){
        if($scope.data_sources.length > 1){
            $scope.data_sources.splice($scope.data_sources.length-1,1)
        }
    }
    
    //function to dynamcially add input boxes for links
    $scope.add_link = function(init_title, init_special_title){
        
        if(init_title == undefined){
            init_title = "";
        }
        
        $scope.button_links.push({
            title: init_title,
            special_title : init_special_title,
            url: ""
        });
    }
    
    //function to dynamcially remove input boxes for links
    $scope.remove_link = function(){
        if($scope.button_links.length > 1){
            $scope.button_links.splice($scope.button_links.length-1,1)
        }
    }
    
    //function to configure the special feature input depending on the users selection
    $scope.config_special_feature = function(){
        $scope.special_feature_modes = [
            {
                db_ref : "youtube_embed",
                title : "YouTube Video"
            },
            {
                db_ref : "spotify_embed", //spotify features not supported yet
                title : "Spotify Track"
            },
            {
                db_ref : "video_embed", //spotify features not supported yet
                title : "Embedded Video Link"
            }/*,
            {
                db_ref : "soundcloud_embed", //soundcloud features not supported yet
                title : "Soundcloud Track"
            },
            {
                db_ref : "twitter_embed", //twitter features not supported yet
                title : "Tweet"
            }*/
                                    ];
        
        console.log("config_special_feature called.");
        console.log($scope.special_feature_select);
        
        if($scope.special_feature_select != undefined){
            
            switch($scope.special_feature_select){
                case "youtube_embed":
                    $scope.mf_type = "text";
                    $scope.mf_file_model = "";
                    break;
            }      
        }
        else{
            $scope.mf_type = "text";
            $scope.mf_file_model = "";
        }
    }
    
    //call methods to init text boxes on page load
    $scope.get_actor_data();
    $scope.get_category_data();
    $scope.add_source();
    $scope.add_link("","");
    $scope.config_special_feature();
    //$scope.add_link("Image Upload");
    $scope.add_highlight_event();
    
    $scope.browser = deviceDetector.browser;
    
    if(test_mode){
        //preload data from url for testing
        var hashParams = window.location.href.split('?');
        
        if(hashParams.length > 1){
            
            hashParams = hashParams[1].split('&');
        
            for(var i = 0; i < hashParams.length; i++){
                var p = hashParams[i].split('=');

                console.log(p[0]);
                console.log(p[1]);

                if(p[1].indexOf(',') >= 0){
                    $scope[p[0]] = p[1].split(",");
                }
                else{
                    $scope[p[0]] = p[1];//decodeURIComponent(p[1]);
                }
            }
            console.log($scope);
        }
        
    }
    
}]);