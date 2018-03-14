//external dependencies

//internal dependencies

module.exports = {
    
    get_custom_validation_functions: function(){
        return {
            
        }
    },
    
    validate: function(request, response, next){
        
        //access form data and reassign it to the request body
        if (typeof request.body.data === 'string' || request.body.data instanceof String){
            request.body = JSON.parse(request.body.data); //get form data
        }
        
        //validate title
        request.checkBody("title", "Field is empty").notEmpty();
        request.checkBody("title", "Field is null.").not_null();
        request.checkBody("title", "Potential HTML code found, please remove this.").detect_xss();
        
        //validate aggressor ids
        request.checkBody("aggressors", "Field is empty").notEmpty();
        request.checkBody("aggressors", "Field is null.").not_null();
        request.checkBody("aggressors", "Aggressor ids are not formatted correctly.").test_array_of_mongodb_object_ids("mongodb_ids");
        
        //validate target ids
        request.checkBody("targets", "Field is empty").notEmpty();
        request.checkBody("targets", "Field is null.").not_null();
        request.checkBody("targets", "Target ids are not formatted correctly.").test_array_of_mongodb_object_ids("mongodb_ids");
        
        //validate event date
        request.checkBody("date", "Field is empty").notEmpty();
        request.checkBody("date", "Field is null.").not_null();
        request.checkBody("date", "Date is not formatted correctly.").test_valid_date();
        
        //validate description
        request.checkBody("description", "Field is empty").notEmpty();
        request.checkBody("description", "Field is null.").not_null();
        request.checkBody("description", "Potential HTML code found, please remove this.").detect_xss();
        
        //validate data_soruces
        request.checkBody("links", "Field is empty").notEmpty();
        request.checkBody("links", "Field is null.").not_null();
        request.checkBody("links", "Potential HTML code found, please remove this.").detect_xss_in_object_keys_and_fields();
        
        //validate gallery_items
        request.checkBody("gallery_items", "Field is empty").notEmpty();
        request.checkBody("gallery_items", "Field is null.").not_null();
        request.checkBody("gallery_items", "Gallery items are not formatted correctly.").test_gallery_items_structure(request.files);
        
        //validate categories
        request.checkBody("categories", "Field is empty").notEmpty();
        request.checkBody("categories", "Field is null.").not_null();
        request.checkBody('categories', 'Categories formatted incorrectly.').test_array_of_ints();
        
        //validate data_soruces
        request.checkBody("data_sources", "Field is empty").notEmpty();
        request.checkBody("data_sources", "Field is null.").not_null();
        request.checkBody("data_sources", "Potential HTML code found, please remove this.").detect_xss_in_string_array();
        request.checkBody("data_sources", "Data sources are improperly formatted.").test_array_of_urls();
        
        //validate record_origin
        request.checkBody("record_origin", "Field is empty").notEmpty();
        request.checkBody("record_origin", "Field is null.").not_null();
        request.checkBody("record_origin", "Potential HTML code found, please remove this.").detect_xss();
        request.checkBody("record_origin", "Record origin is invalid.").test_record_origin();
        
        //validate tags
        request.checkBody("tags", "Field is empty").notEmpty();
        request.checkBody("tags", "Field is null.").not_null();
        request.checkBody("tags", "Potential HTML code found, please remove this.").detect_xss_in_string_array();
        request.checkBody("tags", "Tags are not formatted correctly.").test_array_of_strings();
        
        //validate image files
        for(var i = 0; i < request.files.length; i++){
            var filename = typeof request.files[i] !== "undefined" ? request.files[i].originalname : '';
            request.checkBody('file', 'Please upload an image Jpeg, Png or Gif').test_image(filename);
        }
        
        request.getValidationResult().then(function(validationResult){
            
            if(validationResult.array().length > 0 ){
                console.log("validation failed.");
                console.log(validationResult.array());
                response.status(400).send({ failed: true, message: "Validation faled, please format input data properly."});
            }
            else{
                console.log("validation succeeded.");
                request.validated_data = request.body;
                next();
            }
        });
    }
};