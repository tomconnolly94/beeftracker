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
        request.checkBody("title", "No title provided.").notEmpty();
        request.checkBody("title", "Potential HTML code found, please remove this.").detect_xss();
        
        //validate aggressor ids
        request.checkBody("aggressors", "No aggressor ids provided.").notEmpty();
        request.checkBody("aggressors", "Aggressor ids are not formatted correctly.").test_array_of_mongodb_object_ids("mongodb_ids");
        
        //validate target ids
        request.checkBody("targets", "Must have at least one target.").notEmpty();
        request.checkBody("targets", "Target ids are not formatted correctly.").test_array_of_mongodb_object_ids("mongodb_ids");
        
        //validate event date
        request.checkBody("date", "No date provided.").notEmpty();
        request.checkBody("date", "Date is not formatted correctly.").test_valid_date();
        
        //validate description
        request.checkBody("description", "No description provided.").notEmpty();
        request.checkBody("description", "Potential HTML code found, please remove this.").detect_xss();
        
        //validate data_soruces
        request.checkBody("links", "No data sources provided.").notEmpty();
        request.checkBody("links", "Potential HTML code found, please remove this.").detect_xss_in_object_keys_and_fields();
        
        //validate gallery_items
        request.checkBody("gallery_items", "No gallery items provided.").notEmpty();
        request.checkBody("gallery_items", "Gallery items are not formatted correctly.").test_gallery_items_structure();
        
        //validate categories
        request.checkBody("categories", "No categories provided.").notEmpty();
        request.checkBody('categories', 'Categories formatted incorrectly.').test_array_of_ints();
        
        //validate data_soruces
        request.checkBody("data_sources", "No data sources provided.").notEmpty();
        request.checkBody("data_sources", "Potential HTML code found, please remove this.").detect_xss_in_string_array();
        request.checkBody("data_sources", "Data sources are improperly formatted.").test_array_of_urls();
        
        //validate record_origin
        request.checkBody("record_origin", "No record_origin provided.").notEmpty();
        request.checkBody("record_origin", "Potential HTML code found, please remove this.").detect_xss();
        request.checkBody("record_origin", "Record origin is invalid.").test_record_origin();
        
        //validate tags
        request.checkBody("tags", "No tags provided.").notEmpty();
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
        })
    }
};