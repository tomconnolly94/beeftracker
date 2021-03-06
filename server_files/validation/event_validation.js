//external dependencies
var underscore = require('underscore');

//internal dependencies
var logger = require("../tools/logging.js");

module.exports = {
    
    get_custom_validation_functions: function(){
        return {
            
        }
    },
    
    validate: function(request, response, next){
        var filename_split = __filename.split("/");
        logger.submit_log(logger.LOG_TYPE.INFO, filename_split[filename_split.length - 1].split(".")[0] + " started.");

        var xss_warning = "Potential HTML code found, please remove this.";
                
        //access form data and reassign it to the request body
        if (typeof request.body.data === 'string' || request.body.data instanceof String){
            request.body = JSON.parse(request.body.data); //get form data
        }
        //validate title
        request.checkBody("title", "Field is empty").notEmpty();
        request.checkBody("title", "Field is null.").not_null();
        request.checkBody("title", xss_warning).detect_xss();
        
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
        request.checkBody("description", xss_warning).detect_xss();
        
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
        request.checkBody("data_sources", xss_warning).detect_xss_in_string_array();
        request.checkBody("data_sources", "Data sources are improperly formatted.").test_array_of_urls();
        
        //validate record_origin
        request.checkBody("record_origin", "Field is empty").notEmpty();
        request.checkBody("record_origin", "Field is null.").not_null();
        request.checkBody("record_origin", xss_warning).detect_xss();
        request.checkBody("record_origin", "Record origin is invalid.").test_record_origin();
        
        if(request.body.tags.length > 0){
            request.checkBody("tags", xss_warning).detect_xss_in_string_array();
            request.checkBody("tags", "Tags are not formatted correctly.").test_array_of_strings();
        }

        //validate image files
        for(var i = 0; i < request.files.length; i++){
            request.checkBody("file", 'Please upload an image Jpeg, Png, blob or Gif').test_image(request.files[i].mimetype);
        }
        
        request.getValidationResult().then(function(validationResult){
            
            if(validationResult.array().length > 0 ){
                logger.submit_log(logger.LOG_TYPE.ERROR, "validation failed.");
                logger.submit_log(logger.LOG_TYPE.ERROR, validationResult.array());
                response.status(400).send({ failed: true, stage: "server_validation", message: "Validation faled, please format input data properly.", details: validationResult.array() });
            }
            else{
                logger.submit_log(logger.LOG_TYPE.INFO, "validation succeeded.");
                if(!request.locals){ request.locals = {}; }
                if(!request.locals.validated_data){ request.locals.validated_data = {}; }

                underscore.extend(request.locals.validated_data, {
                    title: request.body.title,
                    aggressors: request.body.aggressors,
                    targets: request.body.targets,
                    date: request.body.date,
                    description: request.body.description,
                    links: request.body.links,
                    gallery_items: request.body.gallery_items,
                    categories: request.body.categories,
                    data_sources: request.body.data_sources,
                    user_id: request.body.user_id,
                    record_origin: request.body.record_origin,
                    tags: request.body.tags,
                });
                next();
            }
        });
    }
};