//external dependencies
var path = require("path");
var valid_url = require('valid-url');

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
        
        //validate event date
        request.checkBody("place_of_origin", "No date provided.").notEmpty();
        request.checkBody("date_of_origin", "Date is not formatted correctly.").test_valid_date();
        
        //validate event date
        request.checkBody("date_of_origin", "No date provided.").notEmpty();
        request.checkBody("date_of_origin", "Date is not formatted correctly.").test_valid_date();
        
        //validate description
        request.checkBody("description", "No description provided.").notEmpty();
        
        //validate target ids
        request.checkBody("associated_actors", "Associated actors ids are not formatted correctly.").optional().test_array_of_mongodb_object_ids("mongodb_ids");
        
        //validate data_soruces
        request.checkBody("data_sources", "No data sources provided.").notEmpty();
        request.checkBody("data_sources", "Data sources are improperly formatted.").test_array_of_urls();
        
        //validate tags
        request.checkBody("also_known_as", "No alternative names provided.").notEmpty();
        request.checkBody("also_known_as", "Alternative names are not formatted correctly.").test_array_of_strings();
        
        //validate gallery_items
        request.checkBody("gallery_items", "No gallery items provided.").notEmpty();
        request.checkBody("gallery_items", "Gallery items are not formatted correctly.").test_gallery_items_structure();
        
        //validate categories
        request.checkBody("categories", "No categories provided.").notEmpty();
        request.checkBody('categories', 'Categories formatted incorrectly.').test_array_of_numbers();
        
        //validate record_origin
        request.checkBody("record_origin", "No record_origin provided.").notEmpty();
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
        })
    }
};