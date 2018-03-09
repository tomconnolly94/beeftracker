//external dependencies

//internal dependencies

module.exports = {
    
    get_custom_validation_functions: function(){
        return {
            
        }
    },
    
    validate: function(request, response, next){
        
        //access form data and reassign it to the request body
        request.body = JSON.parse(request.body.data); //get form data
        
        //validate title
        request.checkBody("name", "No title provided.").notEmpty();
        request.checkBody("name", "Potential HTML code found, please remove this.").detect_xss();
                
        //validate event date
        request.checkBody("date_of_origin", "No date provided.").notEmpty();
        request.checkBody("date_of_origin", "Date is not formatted correctly.").test_valid_date();
        
        //validate event date
        request.checkBody("place_of_origin", "No date provided.").notEmpty();
        request.checkBody("place_of_origin", "Potential HTML code found, please remove this.").detect_xss();
        
        //validate description
        request.checkBody("description", "No description provided.").notEmpty();
        request.checkBody("description", "Potential HTML code found, please remove this.").detect_xss();
        
        //validate target ids
        request.checkBody("associated_actors", "Associated actors ids are not formatted correctly.").optional().test_array_of_mongodb_object_ids("mongodb_ids");
        
        //validate data_soruces
        request.checkBody("data_sources", "No data sources provided.").notEmpty();
        request.checkBody("data_sources", "Potential HTML code found, please remove this.").detect_xss_in_string_array();
        request.checkBody("data_sources", "Data sources are improperly formatted.").test_array_of_urls();
        
        //validate nicknames
        request.checkBody("also_known_as", "No alternative names provided.").notEmpty();
        request.checkBody("data_sources", "Potential HTML code found, please remove this.").detect_xss_in_string_array();
        request.checkBody("also_known_as", "Alternative names are not formatted correctly.").test_array_of_strings();
        
        //validate nicknames
        request.checkBody("classification", "No alternative names provided.").notEmpty();
        request.checkBody("classification", "Potential HTML code found, please remove this.").detect_xss();
        
        //validate nicknames
        request.checkBody("variable_field_values", "No alternative names provided.").notEmpty();
        request.checkBody("variable_field_values", "Potential HTML code found, please remove this.").detect_xss_in_string_array();
        
        //validate nicknames
        request.checkBody("links", "No links provided.").notEmpty();
        request.checkBody("links", "Potential HTML code found, please remove this.").detect_xss_in_object_keys_and_fields();
        request.checkBody("links", "Link items are not formatted correctly.").test_array_of_urls();
        
        //validate gallery_items
        request.checkBody("gallery_items", "No gallery items provided.").notEmpty();
        request.checkBody("gallery_items", "Gallery items are not formatted correctly.").test_gallery_items_structure();
        
        //validate record_origin
        request.checkBody("record_origin", "No record_origin provided.").notEmpty();
        request.checkBody("record_origin", "Potential HTML code found, please remove this.").detect_xss();
        request.checkBody("record_origin", "Record origin is invalid.").test_record_origin();
        
        //validate image files
        for(var i = 0; i < request.files.length; i++){
            var filename = typeof request.files[i] !== "undefined" ? request.files[i].originalname : '';
            request.checkBody('file', 'Please upload an image Jpeg, Png or Gif').test_image(filename);
        }
        
        request.getValidationResult().then(function(validationResult){
            
            if(validationResult.array().length > 0 ){
                console.log(validationResult.isEmpty());
                console.log(validationResult.array());
                console.log("validation failed.");
                response.send({failed: true});
            }
            else{
                console.log("validation succeeded.");
                response.send({failed: false});
            }
        });
    }
};