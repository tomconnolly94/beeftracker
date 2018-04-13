//external dependencies
var path = require("path");
var valid_url = require('valid-url');

//internal dependencies
var actor_data_validator = require("../validation/actor_validation");
var event_data_validator = require("../validation/event_validation");

module.exports = {
    
    get_custom_validation_functions: function(){
        return {
        }
    },
    
    validate: function(request, response, next){
        console.log("validator started.");
        console.log(request.body);
        
        request.body = JSON.parse(request.body.data); //get form data
                        
        //validate title
        request.checkBody("user_id", "Field is empty.").notEmpty();
        request.checkBody("user_id", "Field is null.").not_null();
        request.checkBody("user_id", "No event_id provided.").test_mongodb_object_id();
        
        console.log(request.body.type);
        
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
                    response.status(400).send({ failed: true, message: "Validation failed, please format input data properly."});
                }
                else{
                    console.log("validation succeeded.");
                    request.locals = {};
                    request.locals.validated_data = {
                        user_id: request.body.user_id,
                        type: request.body.type,
                        data: request.body.data
                    };
                    next();
                }
            });
        }
        
        var full_object = request.body;
        request.body = request.body.data;
        
        //determine which kind of data to validate
        if(full_object.type == "event"){
            event_data_validator.validate(request, response, function(){
                inspect_errors(request, response, next);
            });
        }
        else if(full_object.type == "actor"){
            actor_data_validator.validate(request, response, function(){
                inspect_errors(request, response, next);
            });
        }
        else{
            console.log("validation failed.");
            response.status(400).send({ failed: true, message: "Validation failed, please format input data properly."});
        }
    }
};