//external dependencies

//internal dependencies

module.exports = {
    
    get_custom_validation_functions: function(){
        return {
            
        }
    },
    
    validate: function(request, response, next){
        
        console.log("validation started.")
        
        //access form data and reassign it to the request body
        request.body = JSON.parse(request.body.data); //get form data
        
        //validate title
        request.checkBody("name", "Field is empty").notEmpty();
        request.checkBody("name", "Field is null.").not_null();
        request.checkBody("name", "Field is not a string").is_string();
        request.checkBody("name", "Potential HTML code found, please remove this.").detect_xss();
                
        //validate event date
        request.checkBody("date_of_origin", "Field is empty").notEmpty();
        request.checkBody("date_of_origin", "Field is null.").not_null();
        request.checkBody("date_of_origin", "date_of_origin is not formatted correctly.").test_valid_date();
        
        //validate event date
        request.checkBody("place_of_origin", "Field is empty").notEmpty();
        request.checkBody("place_of_origin", "Field is null.").not_null();
        request.checkBody("place_of_origin", "username provided is not a string.").is_string();
        request.checkBody("place_of_origin", "Potential HTML code found, please remove this.").detect_xss();
        
        //validate description
        request.checkBody("description", "Field is empty").notEmpty();
        request.checkBody("description", "Field is null.").not_null();
        request.checkBody("description", "username provided is not a string.").is_string();
        request.checkBody("description", "Potential HTML code found, please remove this.").detect_xss();
        
        //validate data_sources
        request.checkBody("data_sources", "Field is empty").notEmpty();
        request.checkBody("data_sources", "Field is null.").not_null();
        request.checkBody("data_sources", "Potential HTML code found, please remove this.").detect_xss_in_string_array();
        request.checkBody("data_sources", "Not an array of urls.").test_array_of_urls();
        
        //validate nicknames
        request.checkBody("also_known_as", "Field is empty").notEmpty();
        request.checkBody("also_known_as", "Field is null.").not_null();
        request.checkBody("also_known_as", "Potential HTML code found, please remove this.").detect_xss_in_string_array();
        request.checkBody("also_known_as", "Not an array of strings.").test_array_of_strings();
        
        //validate nicknames
        request.checkBody("classification", "Field is empty").notEmpty();
        request.checkBody("classification", "Field is null.").not_null();
        request.checkBody("classification", "Potential HTML code found, please remove this.").detect_xss();
        
        //validate nicknames
        request.checkBody("variable_field_values", "Field is empty").notEmpty();
        request.checkBody("variable_field_values", "Field is null.").not_null();
        request.checkBody("variable_field_values", "Potential HTML code found, please remove this.").detect_xss_in_string_array();
        
        //validate nicknames
        request.checkBody("links", "Field is empty").notEmpty();
        request.checkBody("links", "Field is null.").not_null();
        request.checkBody("links", "Potential HTML code found, please remove this.").detect_xss_in_array_of_objects_keys_and_fields();
        request.checkBody("links", "Not an array of links.").test_array_of_links();
        
        //validate gallery_items
        request.checkBody("gallery_items", "Field is empty").notEmpty();
        request.checkBody("gallery_items", "Field is null.").not_null();
        request.checkBody("gallery_items", "Gallery items are not formatted correctly.").test_gallery_items_structure(request.files);
        
        //validate record_origin
        request.checkBody("record_origin", "Field is empty").notEmpty();
        request.checkBody("record_origin", "Field is null.").not_null();
        request.checkBody("record_origin", "Potential HTML code found, please remove this.").detect_xss();
        request.checkBody("record_origin", "Record origin is invalid.").test_record_origin();
        
        //validate image files
        for(var i = 0; i < request.files.length; i++){
            var filename = typeof request.files[i] !== "undefined" ? request.files[i].originalname : '';
            request.checkBody('file', 'Please upload an image Jpeg, Png or Gif.').test_image(filename);
        }
        
        request.getValidationResult().then(function(validationResult){
            
            if(validationResult.array().length > 0 ){
                console.log("validation failed.");
                console.log(validationResult.array());
                response.status(400).send({ failed: true, message: "Validation faled, please format input data properly."});
            }
            else{
                console.log("validation succeeded.");
                request.locals = {};
                request.locals.validated_data = {
                    name: request.body.name,
                    date_of_origin: request.body.date_of_origin,
                    place_of_origin: request.body.place_of_origin,
                    description: request.body.description,
                    associated_actors: request.body.associated_actors,
                    data_sources: request.body.data_sources,
                    also_known_as: request.body.also_known_as,
                    classification: request.body.classification,
                    variable_field_values: request.body.variable_field_values,
                    links: request.body.links,
                    gallery_items: request.body.gallery_items,
                    record_origin: request.body.record_origin
                };
                next();
            }
        });
    }
};