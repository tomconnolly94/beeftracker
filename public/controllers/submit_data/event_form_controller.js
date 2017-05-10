/////////////////////////////////////////////////////////////////////////////////
//
//  File: formController.js
//  Project: beeftracker
//  Contributors: Tom Connolly
//  Description: Handles all the interactions necessary to recieve, display, 
//                  format and send new beef data submitteed by a user
//
/////////////////////////////////////////////////////////////////////////////////
submit_app.controller('eventFormController', ['$scope','$http', 'fileService', function($scope, $http, fileService) {
    
    //create var 
    $scope.form_data = {};
    //create array to hold button links
    $scope.button_links = [];
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
    
    $scope.uploadFile = function(){
        //var file = $scope.myFile;
        console.log('file is ' );
        console.log(fileService);
        var uploadUrl = "/fileUpload";
        //fileUpload.uploadFileToUrl(file, uploadUrl);
    };
    
    //function to handle form processing
    $scope.process_form = function() {

        
        var form = new FormData();
        
        $scope.form_data.title = $scope.title;
        console.log($scope.title.$valid);
        $scope.form_data.aggressor = $scope.aggressor;
        $scope.form_data.targets = $scope.targets;
        $scope.form_data.description = $scope.description;
        console.log($scope.datePicker);
        $scope.form_data.date = $scope.datePicker;
        $scope.form_data.highlights = $scope.highlights;
        $scope.form_data.data_sources = $scope.data_sources;
        $scope.form_data.button_links = $scope.button_links;
        $scope.form_data.highlights = $scope.highlights;
        $scope.form_data.data_sources = $scope.data_sources;
        $scope.form_data.button_links = $scope.button_links;
                
        //formdata.append('data', $scope.form_data);
        form.append('attachment', fileService[0]);
        form.append('data', JSON.stringify($scope.form_data));
        
        console.log($scope.datePicker);
        
        
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
        .success(function (data, status, headers, config) {
            
        })
        .error(function (data, status, headers, config) {
            console.log("Upload failed.")
        });
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
    
    //call methods to init text boxes on page load
    $scope.add_source();
    $scope.add_link("Video Link","mf_video_link");
    //$scope.add_link("Image Upload");
    $scope.add_highlight_event();
    
}]);