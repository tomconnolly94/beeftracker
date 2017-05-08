/////////////////////////////////////////////////////////////////////////////////
//
//  File: formController.js
//  Project: beeftracker
//  Contributors: Tom Connolly
//  Description: Handles all the interactions necessary to recieve, display, 
//                  format and send new beef data submitteed by a user
//
/////////////////////////////////////////////////////////////////////////////////

submit_actor_app.controller('actorFormController', ['$scope','$http', function($scope, $http) {
    
    //create var 
    $scope.form_data = {};
    //create array to hold button links
    $scope.nicknames = [];
    //create array to hold data sources
    $scope.data_sources = [];
    //create array to hold highlights
    $scope.highlights = [];
    
    //request to get artists to fill aggressor and targets option inputs
    $http.get("/search_all_artists/").success(function(response){
        
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
    
    //function to handle form processing
    $scope.process_form = function() {

        
        $scope.form_data.title = $scope.title;
        $scope.form_data.aggressor = $scope.aggressor;
        console.log($scope.aggressor);
        $scope.form_data.targets = $scope.targets;
        console.log($scope.targets);
        $scope.form_data.description = $scope.description;
        $scope.form_data.date = $scope.date;
        console.log($scope.date);
        $scope.form_data.highlights = $scope.highlights;
        $scope.form_data.data_sources = $scope.data_sources;
        $scope.form_data.button_links = $scope.button_links;
        $scope.form_data.highlights = $scope.highlights;
        $scope.form_data.data_sources = $scope.data_sources;
        $scope.form_data.button_links = $scope.button_links;
    
        console.log($scope.form_data);
        
        $http.post("/submit_beefdata", $scope.form_data)
        .success(function (data, status, headers, config) {
                
            console.log("form submit success");
        
        })
        .error(function (data, status, header, config) {
            console.log("form submit failed.");
        
        });
    };
             
    //function to dynamcially add input boxes for data_sources
    $scope.add_nickname = function(){
        
        $scope.nicknames.push({
            url: ""
        });
    }
    
    //function to dynamcially remove input boxes for data_sources
    $scope.remove_nickname = function(){
        if($scope.data_sources.length > 1){
            $scope.data_sources.splice($scope.data_sources.length-1,1)
        }
    }
    
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

    //function to dynamcially add input boxes for links
    $scope.add_link = function(init_title){
        
        if(init_title == undefined){
            init_title = "";
        }
        
        $scope.button_links.push({
            title: init_title,
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
    $scope.add_link("Video Link");
    $scope.add_link("Image Upload");
    $scope.add_highlight_event();
    
}]);