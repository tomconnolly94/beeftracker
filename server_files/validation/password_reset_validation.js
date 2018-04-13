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
        
        //validate email_address
        request.checkBody("id_token", "Field is empty").notEmpty();
        request.checkBody("id_token", "Field is null.").not_null();
        request.checkBody("id_token", "Field is not a string.").is_string();
        request.checkBody("id_token", "Potential HTML code found, please remove this.").detect_xss();
        
        //validate password
        request.checkBody("password", "Field is empty").notEmpty();
        request.checkBody("password", "Field is null.").not_null();
        request.checkBody("password", "Field is not a string.").is_string();
        request.checkBody("password", "Potential HTML code found, please remove this.").detect_xss();
        
        request.getValidationResult().then(function(validationResult){
            
            if(validationResult.array().length > 0 ){
                console.log("validation failed.");
                console.log(validationResult.array());
                response.status(400).send({ failed: true, message: "Validation faled, please format input data properly."});
            }
            else{
                console.log("validation succeeded.");
                request.locals = {};
                request.locals.validated_data = {
                    email_address: request.body.email_address
                };
                next();
            }
        });
    }
};