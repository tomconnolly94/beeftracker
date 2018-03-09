//external dependencies
var path = require("path");
var valid_url = require('valid-url');
var sanitizer = require('sanitizer');

//internal dependencies

module.exports = {
    
    get_custom_validation_functions: function(){
        return {
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
            notNull: function(input){
                if(input){
                    return true;
                }
                else{
                    return false;
                }
            },
            detect_xss: function(input){
                var sanitised_input = sanitizer.escape(input);
                
                if(input === sanitised_input){
                    return true;
                }
                else{
                    return false;
                }
            }
        }
    },
    
    validate: function(request, response, next){
        console.log("validator started.");
        console.log(request.body);
        
        //validate title
        request.checkBody("event_id", "No event_id provided.").notEmpty();
        request.checkBody("event_id", "No event_id provided.").notNull();
        request.checkBody("event_id", "No event_id provided.").test_mongodb_object_id();
                
        //validate event date
        request.checkBody("actor_id", "No actor_id provided.").notEmpty();
        request.checkBody("actor_id", "Null actor_id provided.").notNull();
        request.checkBody("actor_id", "actor_id is formatted incorrectly.").test_mongodb_object_id();
        
        //validate event date
        request.checkBody("text", "No text provided.").notEmpty();
        request.checkBody("text", "Potential HTML code found, please remove this.").detect_xss();
        
        //validate event date
        request.checkBody("user", "No user provided.").notEmpty();
        request.checkBody("user", "No user provided.").test_mongodb_object_id();
        
        request.getValidationResult().then(function(validationResult){
            
            if(validationResult.array().length > 0 ){
                
                var errors = validationResult.array();
                var errors_master = [];
                errors_master.actor_id_errors = [];
                errors_master.event_id_errors = [];
                non_id_errors = [];
                
                for(var i = 0; i < errors.length; i++){
                    
                    var error = errors[i];
                    if(error.param == "actor_id" || error.param == "event_id"){
                        errors_master[error.param + "_errors"].push(error);
                    }
                    else{
                        non_id_errors.push(error);
                    }
                }
                
                //only confirm validation if there are more than one errors
                if((errors_master.actor_id_errors.length > 0 && errors_master.event_id_errors.length == 0 || errors_master.event_id_errors.length > 0 && errors_master.actor_id_errors.length == 0) && non_id_errors.length == 0){
                    console.log("validation succeeded.");
                    request.validated_data = request.body;
                    next();
                }
                else{
                    console.log("Validation failed. Both actor_id and event_id were valid.");
                    console.log(errors);
                    response.status(400).send({ failed: true, message: "Validation faled, please format input data properly."});
                }
            }
            else{
                console.log("Validation failed. Both actor_id and event_id were valid.");
                console.log(errors);
                response.status(400).send({ failed: true, message: "Validation faled, please format input data properly."});
            }
        })
    }
};