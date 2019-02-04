//external dependencies
var sanitizer = require('sanitizer');
var path = require("path");
var valid_url = require('valid-url');

//internal dependencies
var actor_validation_custom_functions = require("./actor_validation").get_custom_validation_functions;
var authentication_request_validation_custom_functions = require("./authentication_request_validation").get_custom_validation_functions;
var comment_validation_custom_functions = require("./comment_validation").get_custom_validation_functions;
var event_categories_validation_custom_functions = require("./event_categories_validation").get_custom_validation_functions;
var event_validation_custom_functions = require("./event_validation").get_custom_validation_functions;
var update_request_validation_custom_functions = require("./update_request_validation").get_custom_validation_functions;
var user_validation_custom_functions = require("./user_validation").get_custom_validation_functions;

var master_functions_object = {
    test_array_of_mongodb_object_ids: function(input_array){

        for(var i = 0; i < input_array.length; i++){

            var input = input_array[i];
            var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
            var invalid_value_found = false;

            if(input && input.match(checkForHexRegExp)){
                continue;
            }
            else{
                return false;
            }
        }
        return true
    },
    test_valid_date: function(date){

        var parsed_date = Date.parse(date);
        
        if(isNaN(parsed_date)){
            return false;
        }
        else{ 
            return true;
        }
    },
    test_record_origin: function(input){

        if(input == "scraped" || input == "submitted"){
            return true;
        }
        else{
            return false;
        }
    },
    test_gallery_items_structure: function(gallery_items, files){
                
        for(var i = 0; i < gallery_items.length; i++){
            
            var gallery_item = gallery_items[i];
            var gallery_item_found_in_files = false;
                        
            if(gallery_item.media_type == "image"){
                //loop through files to make sure the gallery item link is included
                for(var j = 0; j < files.length; j++){
                    if(gallery_item.link == files[j].originalname){
                        gallery_item_found_in_files = true;
                        break;
                    }
                }
                
                if(!gallery_item_found_in_files){
                    return false;
                }
            }
            

            if(gallery_item["media_type"] == 'undefined' || gallery_item["media_type"].length < 1){
                return false;
            }
            else if(gallery_item["link"] == 'undefined' || gallery_item["link"].length < 1){
                return false;
            }
            else if(gallery_item["main_graphic"] == 'undefined'){
                return false;
            }
        }
        return true
    },
    test_image: function(file, mimetype) {

        if(mimetype == "application/octet-stream"){
            return true;
        }

        var mimetype_split = mimetype.split("/");
        
        switch (mimetype_split[mimetype_split.length - 1]) {
            case 'jpg':
                return true;
            case 'jpeg':
                return true;
            case  'png':
                return true;
            case  'blob':
                return true;
            default:
                return false;
        }
    },
    test_array_of_urls: function(urls) {

        for(var i = 0; i < urls.length; i++){
            var url = urls[i];

            if (valid_url.isUri(url)){
                continue;
            } 
            else {
                return false;
            }
        }
        return true;
    },
    test_array_of_links: function(links) {

        if(links){    
            for(var i = 0; i < links.length; i++){
                var url = links[i].url;

                if (valid_url.isUri(url)){
                    continue;
                } 
                else {
                    return false;
                }
            }
            return true;
        }
        else{
            return false;
        }
    },
    test_int: function(number) {

        if (isNaN(number) /*|| number !== parseInt(number, 10)*/){
            return false;
        } 
        else {
            return true;
        }
    },
    test_array_of_ints: function(numbers) {

        if(!Array.isArray(numbers)){
            return false;
        }

        for(var i = 0; i < numbers.length; i++){
            var number = numbers[i];

            if (isNaN(number)){
                return false;
            } 
            else {
                continue;
            }
        }
        return true;
    },
    test_array_of_strings: function(strings) {

        if(!Array.isArray(strings)){
            return false;
        }

        for(var i = 0; i < strings.length; i++){
            var string = strings[i];

            if (typeof string != "string"){
                return false;
            } 
            else {
                continue;
            }
        }
        return true;
    },
    test_mongodb_object_id: function(input){
        if(!input){
            return false;
        }

        var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

        if(input.match(checkForHexRegExp)){
            return true;
        }
        else{
            return false;
        }
    },
    not_null: function(input){
        if(input == null || input == undefined){
            return false;
        }
        else{
            return true;
        }
    },
    detect_xss: function(input){
        var sanitised_input = sanitizer.sanitize(input);
        
        if(input === sanitised_input){
            return true;
        }
        else{
            return false;
        }
    },
    detect_xss_in_string_array: function(inputs){
        
        for(var i = 0; i < inputs.length; i++){
            
            var input = inputs[i];
            var sanitised_input = sanitizer.sanitize(input);

            if(input === sanitised_input){
                continue;
            }
            else{
                return false;
            }
        }
        return true;
    },
    detect_xss_in_object_keys_and_fields: function(object){
        
        var keys = Object.keys(object);
        
        for(var i = 0; i < keys.length; i++){
            
            var key = keys[i];
            var field = object[key];
            
            var sanitised_key = sanitizer.sanitize(key);
            var sanitised_field = sanitizer.sanitize(field);

            if(key === sanitised_key && field === sanitised_field){
                continue;
            }
            else{
                return false;
            }
        }
        return true;
    },
    detect_xss_in_array_of_objects_keys_and_fields: function(objects){
        
        if(objects){
            for(var j = 0; j < objects.length; j++){

                var object = objects[j];

                var keys = Object.keys(objects);

                for(var i = 0; i < keys.length; i++){

                    var key = keys[i];
                    var field = object[key];

                    var sanitised_key = sanitizer.sanitize(key);
                    var sanitised_field = sanitizer.sanitize(field);

                    if(key === sanitised_key && field === sanitised_field){
                        continue;
                    }
                    else{
                        return false;
                    }
                }
                return true;
            }
        }
        else{
            return false;
        }
    },
    is_bool: function(input){
        
        if(typeof input === "boolean" || input == "true" || input == "false"){
            return true;
        }
        else{
            return false;
        }
    },
    is_string: function(input){
        
        if(typeof input === "string"){
            return true;
        }
        else{
            return false;
        }
    }
};

module.exports = {
    
    get_all_custom_validation_functions: function(){
        
        //list of validation modules
        var validation_modules_list = [
            actor_validation_custom_functions,
            authentication_request_validation_custom_functions,
            comment_validation_custom_functions,
            event_categories_validation_custom_functions,
            event_validation_custom_functions,
            update_request_validation_custom_functions,
            user_validation_custom_functions
        ];
                
        //loop through the validation modules and use the get custom validator functions function to group all the custom validator functions into one object
        for(var i = 0; i < validation_modules_list.length; i++){
            master_functions_object = Object.assign(master_functions_object, validation_modules_list[i]()); //combine all functions into the master functions object
        }
        
        return master_functions_object;
    }
}