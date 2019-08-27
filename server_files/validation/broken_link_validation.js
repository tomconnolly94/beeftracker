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
        
        //validate title
        request.checkBody("event_id", "Field is empty.").notEmpty();
        request.checkBody("event_id", "Field is null.").not_null();
        request.checkBody("event_id", "No existing_id provided.").test_mongodb_object_id();

        //validate gallery_items
        request.checkBody("gallery_items", "Field is empty").notEmpty();
        request.checkBody("gallery_items", "Field is null.").not_null();
        request.checkBody("gallery_items", "Gallery items are not formatted correctly.").test_gallery_items_structure(null);
        
        request.getValidationResult().then(function(validationResult){
            
            if(validationResult.array().length > 0 ){
                logger.submit_log(logger.LOG_TYPE.ERROR, "validation failed.");
                logger.submit_log(logger.LOG_TYPE.ERROR, validationResult.array());
                response.status(400).send({ failed: true, stage: "server_validation", message: "Validation faled, please format input data properly.", details: validationResult.array()});
            }
            else{
                logger.submit_log(logger.LOG_TYPE.INFO, "validation succeeded.");
                if(!request.locals){ request.locals = {}; }
                if(!request.locals.validated_data){ request.locals.validated_data = {}; }
                
                underscore.extend(request.locals.validated_data, {
                    event_id: request.body.event_id,
                    gallery_items: request.body.gallery_items,
                });
                next();
            }
        });
    }
};