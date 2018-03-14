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
        request.checkBody("username", "Field is empty").notEmpty();
        request.checkBody("username", "Field is null.").not_null();
        request.checkBody("username", "username provided is not a string.").is_string();
        request.checkBody("username", "Potential HTML code found, please remove this.").detect_xss();
                
        //validate event date
        request.checkBody("password", "Field is empty").notEmpty();
        request.checkBody("password", "Field is null.").not_null();
        request.checkBody("password", "username provided is not a string.").is_string();
        request.checkBody("password", "Potential HTML code found, please remove this.").detect_xss();
        
        //validate event date
        request.checkBody("requires_admin", "Field is empty").notEmpty();
        request.checkBody("requires_admin", "Field is null.").not_null();
        request.checkBody("requires_admin", "Field is not boolean.").is_bool();
                
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