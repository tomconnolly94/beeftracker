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
        console.log("validator started.");
        console.log(request.body);
                        
        //validate title
        request.checkBody("username", "No username provided.").notEmpty();
        request.checkBody("username", "Null username provided.").notNull();
        request.checkBody("username", "Potential HTML code found, please remove this.").detect_xss();
                
        //validate event date
        request.checkBody("password", "No actor_id provided.").notEmpty();
        request.checkBody("password", "Null actor_id provided.").notNull();
        request.checkBody("password", "Potential HTML code found, please remove this.").detect_xss();
        
        //validate event date
        request.checkBody("requires_admin", "No requires_admin value provided").notEmpty();
        request.checkBody("requires_admin", "requires_admin value is formatted incorrectly").isBool();
                
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