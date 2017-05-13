/////////////////////////////////////////////////////////////////////////////////
//
//  File: formController.js
//  Project: beeftracker
//  Contributors: Tom Connolly
//  Description: Handles all the interactions necessary to recieve, display, 
//                  format and send new beef data submitteed by a user
//
/////////////////////////////////////////////////////////////////////////////////
submit_app.controller('actorFormController', ['$scope','$http', 'fileService', '$window', '$location', function($scope, $http, fileService, $window, $location) {
    
    //create var 
    $scope.form_data = {};
    //create array to hold button links
    $scope.button_links = [];
    //create array to hold data sources
    $scope.data_sources = [];
    //create arrays to hold features
    $scope.nicknames = [];
    $scope.occupations = [];
    $scope.achievements = [];
    $scope.assoc_actors = [];
    
    //request to get actors to fill aggressor and targets option inputs
    //$http.get("/search_all_artists/").success(function(response){
    $http({
        method: 'GET',
        url: "/search_all_artists/"
    }).then(function(response){
        
        //validate the url tagId to make sure the event exists                
        if(response != undefined){
            $scope.actors = response.actors;
        }
        else{
            //error msg
            console.log("No events found in database");
        }
    }, function(response) {
        //failed http request
        console.log("Error in HTTP request in search_controller.js:searchController");
    });
    
    $scope.validate_input = function() {
        
        var base_err = "Error: ";
        
        $scope.error_message = "";
        
        //test if stage_name is empty
        if($scope.actor_form.stage_name.$untouched || $scope.actor_form.stage_name.length > 0){
            $scope.error_message = base_err + "Stage name is empty.";
            return false;
        }
        else if($scope.actor_form.stage_name.$invalid){
            $scope.error_message = base_err + "Stage name is not valid.";
            return false;
        }
        
        //test if birth_name is empty
        if($scope.actor_form.birth_name.$untouched || $scope.actor_form.birth_name.length > 0){
            $scope.error_message = base_err + "Birth name is empty.";
            return false;
        }
        else if($scope.actor_form.birth_name.$invalid){
            $scope.error_message = base_err + "Birth name is not valid.";
            return false;
        }

        //test if file is empty
        if(fileService[0] == undefined){
            $scope.error_message = base_err + "Please select an image file for the actor.";
            return false;
        }
        
        //test if datepicker is empty
        if($scope.actor_form.datepicker == undefined){
            $scope.error_message = base_err + "Please select a date.";
            return false;
        }
        
        console.log($scope.occupations);
        
        //test if occupation is empty
        if(!$scope.occupations.length > 0){
            $scope.error_message = base_err + "Please select at least one occupation.";
            return false;
        }
             
        //test if title is empty
        if($scope.actor_form.origin.$untouched || $scope.actor_form.origin.length > 0){
            $scope.error_message = base_err + "Birthplace is empty.";
            return false;
        }
        else if($scope.actor_form.origin.$invalid){
            $scope.error_message = base_err + "Birthplace is not valid.";
            return false;
        }
        
        //test if title is empty
        if($scope.actor_form.bio.$untouched || $scope.actor_form.bio.length > 0){
            $scope.error_message = base_err + "Bio is empty.";
            return false;
        }
        else if($scope.actor_form.bio.$invalid){
            $scope.error_message = base_err + "Bio is not valid.";
            return false;
        }
        
        //test if title is empty
        if($scope.data_sources.length > 0){
            var found_valid_src = false;
            
            for(var i = 0; i < $scope.data_sources.length; i++){
                if($scope.data_sources[i].text.length > 0){
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
        
        return true;
    };
        
    //function to process, format and send all form data to servers
    $scope.process_form = function() {
        
        if($scope.validate_input()){

            var form = new FormData();
            
            $scope.form_data.stage_name = $scope.stage_name;
            $scope.form_data.birth_name = $scope.birth_name;
            $scope.form_data.nicknames = $scope.nicknames;
            $scope.form_data.date = $scope.datePicker;
            $scope.form_data.occupations = $scope.occupations;
            $scope.form_data.origin = $scope.origin;
            $scope.form_data.achievements = $scope.achievements;
            $scope.form_data.bio = $scope.bio;
            $scope.form_data.data_sources = $scope.data_sources;
            $scope.form_data.assoc_actors = $scope.assoc_actors;
            $scope.form_data.button_links = $scope.button_links;
            
            for(var i = 0; i < $scope.nicknames.length; i++){
                if(!$scope.nicknames[i].text.length > 0){
                    $scope.nicknames.splice(i, 1);
                    i--;
                }
            }
            
            for(var i = 0; i < $scope.occupations.length; i++){
                if(!$scope.occupations[i].text.length > 0){
                    $scope.occupations.splice(i, 1);
                    i--;
                }
            }
            
            for(var i = 0; i < $scope.achievements.length; i++){
                if(!$scope.achievements[i].text.length > 0){
                    $scope.achievements.splice(i, 1);
                    i--;
                }
            }
            
            for(var i = 0; i < $scope.data_sources.length; i++){
                if(!$scope.data_sources[i].text.length > 0){
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
            form.append('attachment', fileService[0]);
            form.append('data', JSON.stringify($scope.form_data));        

            return $http({
                url: "/submit_actordata",
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
                var url_arr = $location.absUrl().split('/');
                
                if(url_arr[url_arr.length-1] == "add_actor"){
                    $window.location.href = '/submission_confirmation';
                }
                else if(url_arr[url_arr.length-1] == "add_beef"){
                    angular.element(document.getElementById('event_form')).scope().get_actor_data();
                    $('#myModal').modal('hide');
                }
            }, function (error) {
                console.log("Upload failed.");
            });
        }
    };
    
    //function to dynamcially add input boxes for nicknames
    $scope.add_nickname = function(){
        
        console.log("add nickname called.");
        
        $scope.nicknames.push({
            text: ""
        });
    }
    
    //function to dynamcially remove input boxes for nicknames
    $scope.remove_nickname = function(){
        if($scope.nicknames.length > 1){
            $scope.nicknames.splice($scope.nicknames.length-1,1)
        }
    }
    
    //function to dynamcially add input boxes for occupations
    $scope.add_occupation = function(){
                
        $scope.occupations.push({
            text: ""
        });
    }
    
    //function to dynamcially remove input boxes for occupations
    $scope.remove_occupation = function(){
        if($scope.occupations.length > 1){
            $scope.occupations.splice($scope.occupations.length-1,1)
        }
    }
    
    //function to dynamcially add input boxes for occupations
    $scope.add_achievement = function(){
                
        $scope.achievements.push({
            text: ""
        });
    }
    
    //function to dynamcially remove input boxes for occupations
    $scope.remove_achievement = function(){
        if($scope.achievements.length > 1){
            $scope.achievements.splice($scope.achievements.length-1,1)
        }
    }

    //function to dynamcially add input boxes for data_sources
    $scope.add_source = function(){
        
        $scope.data_sources.push({
            text: ""
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
    
    //call methods to init text boxes on page load
    $scope.add_source();
    $scope.add_nickname();
    $scope.add_occupation();
    $scope.add_achievement();
    $scope.add_link();
    /*$scope.add_highlight_event();*/
    
}]);