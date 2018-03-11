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
        request.checkBody("cat_id", "No cat_id provided.").notEmpty();
        request.checkBody("cat_id", "No cat_id provided.").notNull();
        request.checkBody("cat_id", "cat_id formatted incorrectly.").test_int();
        
        //validate event date
        request.checkBody("name", "No actor_id provided.").notEmpty();
        request.checkBody("name", "Null actor_id provided.").notNull();
        request.checkBody("name", "actor_id is formatted incorrectly.").test_mongodb_object_id();
        
        request.getValidationResult().then(function(validationResult){
            
            if(validationResult.array().length > 0 ){
                console.log(validationResult.isEmpty());
                console.log(validationResult.array());
                console.log("validation failed.");
                response.send({failed: true});
            }
            else{
                console.log("validation succeeded.");
                response.send({failed: false});
            }
        });
    }
};