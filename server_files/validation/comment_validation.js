//external dependencies

//internal dependencies

module.exports = {
    
    get_custom_validation_functions: function(){
        return {
            
        }
    },
    
    validate: function(request, response, next){
        console.log("validator started.");
        console.log(request.body);
        
        //validate title
        request.checkBody("event_id", "No event_id provided.").notEmpty();
        request.checkBody("event_id", "No event_id provided.").not_null();
        request.checkBody("event_id", "No event_id provided.").test_mongodb_object_id();
                
        //validate event date
        request.checkBody("actor_id", "No actor_id provided.").notEmpty();
        request.checkBody("actor_id", "Null actor_id provided.").not_null();
        request.checkBody("actor_id", "actor_id is formatted incorrectly.").test_mongodb_object_id();
        
        //validate event date
        request.checkBody("text", "No text provided.").notEmpty();
        request.checkBody("text", "Potential HTML code found, please remove this.").detect_xss();
        
        //validate user id
        request.checkBody("user", "No user provided.").notEmpty();
        request.checkBody("user", "Null user provided.").not_null();
        request.checkBody("user", "User is not formatted correctly.").test_mongodb_object_id();
        
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