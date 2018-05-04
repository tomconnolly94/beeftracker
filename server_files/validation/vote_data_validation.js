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
        //validate email_address
        request.checkBody("event_id", "Field is empty").notEmpty();
        request.checkBody("event_id", "Field is null.").not_null();
        request.checkBody("event_id", "Potential HTML code found, please remove this.").test_mongodb_object_id();
        
        //validate email_address
        request.checkBody("vote_direction", "Field is empty").notEmpty();
        request.checkBody("vote_direction", "Field is null.").not_null();
        request.checkBody("vote_direction", "Field is not an integer").test_int();
        
        request.getValidationResult().then(function(validationResult){
            
            if(validationResult.array().length > 0 ){
                console.log("validation failed.");
                console.log(validationResult.array());
                response.status(400).send({ failed: true, message: "Validation faled, please format input data properly."});
            }
            else{
                console.log("validation succeeded.");
                if(!request.locals){ request.locals = {}; }
                request.locals.validated_data = {
                    event_id: request.body.event_id,
                    vote_direction: request.body.vote_direction
                };
                next();
            }
        });
    }
};