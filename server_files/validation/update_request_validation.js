//external dependencies
var path = require("path");
var valid_url = require('valid-url');

//internal dependencies
var actor_data_validator = require("../validation/actor_validation");
var event_data_validator = require("../validation/event_validation");
var logger = require("../tools/logging.js");

module.exports = {
    
    get_custom_validation_functions: function(){
        return {
        }
    },
    
    validate: function(request, response, next){

        var filename_split = __filename.split("/");
        logger.submit_log(logger.LOG_TYPE.INFO, filename_split[filename_split.length - 1].split(".")[0] + " started.");
        
        request.body = JSON.parse(request.body.data); //get form data

        //validate title
        request.checkBody("existing_id", "Field is empty.").notEmpty();
        request.checkBody("existing_id", "Field is null.").not_null();
        request.checkBody("existing_id", "No existing_id provided.").test_mongodb_object_id();

        //validate type
        request.checkBody("type", "Field is empty").notEmpty();
        request.checkBody("type", "Field is null.").not_null();
        request.checkBody("type", "Field is not a string.").is_string();
        request.checkBody("type", "Potential HTML code found, please remove this.").detect_xss();
        
        var inspect_errors = function(request, response, next){
            request.getValidationResult().then(function(validationResult){

                if(validationResult.array().length > 0 ){
                    console.log("validation failed.");
                    console.log(validationResult.array());
                    response.status(400).send({ failed: true, stage: "validation", message: "Validation failed, please format input data properly."});
                }
                else{
                    console.log("validation succeeded.");
                    if(!request.locals){ request.locals = {}; }
                    var validated_metadata = {
                        user_id: request.body.user_id,
                        type: request.body.type,
                        existing_id: request.body.existing_id
                    };


                    var full_object = request.body;
                    request.body = request.body.update_data;

                    //determine which kind of data to validate
                    if(full_object.type == "event"){
                        event_data_validator.validate(request, response, function(){
                            request.locals.validated_data = {
                                data: request.locals.validated_data,
                                user_id: validated_metadata["user_id"],
                                type: validated_metadata["type"],
                                existing_id: validated_metadata["existing_id"],
                            }
                            next();
                        });
                    }
                    else if(full_object.type == "actor"){
                        actor_data_validator.validate(request, response, function(){
                            request.locals.validated_data = {
                                data: request.locals.validated_data,
                                user_id: validated_metadata["user_id"],
                                type: validated_metadata["type"],
                                existing_id: validated_metadata["existing_id"],
                            }
                            next();
                        });
                    }
                    else{
                        console.log("validation failed.");
                        response.status(400).send({ failed: true, stage: "validation", message: "Validation failed, please format input data properly."});
                    }
                }
            });
        }
        
        inspect_errors(request, response, next);
        
        // //determine which kind of data to validate
        // if(full_object.type == "event"){
        //     event_data_validator.validate(request, response, function(){
        //         inspect_errors(request, response, next);
        //     });
        // }
        // else if(full_object.type == "actor"){
        //     actor_data_validator.validate(request, response, function(){
        //         inspect_errors(request, response, next);
        //     });
        // }
        // else{
        //     console.log("validation failed.");
        //     response.status(400).send({ failed: true, stage: "validation", message: "Validation failed, please format input data properly."});
        // }
    }
};