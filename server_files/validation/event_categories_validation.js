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
                        
        //validate title
        request.checkBody("cat_id", "No cat_id provided.").notEmpty();
        request.checkBody("cat_id", "No cat_id provided.").not_null();
        request.checkBody("cat_id", "cat_id formatted incorrectly.").test_int();
        
        //validate event date
        request.checkBody("name", "No actor_id provided.").notEmpty();
        request.checkBody("name", "Null actor_id provided.").not_null();
        request.checkBody("name", "Field is not a string.").is_string();
        request.checkBody("name", "Potential HTML code found, please remove this.").detect_xss();
        
        request.getValidationResult().then(function(validationResult){
            
            if(validationResult.array().length > 0 ){
                console.log("validation failed.");
                console.log(validationResult.array());
                response.status(400).send({ failed: true, stage: "validation", message: "Validation faled, please format input data properly."});
            }
            else{
                console.log("validation succeeded.");
                if(!request.locals){ request.locals = {}; }
                request.validated_data = {
                    cat_id: request.body.cat_id,
                    name: request.body.name
                };
                next();
            }
        });
    }
};