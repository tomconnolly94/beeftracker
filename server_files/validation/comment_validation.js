//external dependencies
var path = require("path");
var valid_url = require('valid-url');

//internal dependencies

module.exports = {
    
    get_custom_validation_functions: function(){
        return {
            test_mongodb_object_id: function(input){
                if(!input){
                    return false;
                }
                console.log(input)
                
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
            }
        }
    },
    
    validate: function(request, response, next){
        
        console.log(request.body);
                
        //validate title
        request.checkBody("event_id", "No event_id provided.").notEmpty();
        request.checkBody("event_id", "No event_id provided.").notNull();
        request.checkBody("event_id", "No event_id provided.").test_mongodb_object_id();
                
        //validate event date
        request.checkBody("actor_id", "No actor_id provided.").notEmpty();
        request.checkBody("actor_id", "No actor_id provided.").notNull();
        request.checkBody("actor_id", "No actor_id provided.").test_mongodb_object_id();
        
        //validate event date
        request.checkBody("text", "No text provided.").notEmpty();
        
        //validate event date
        request.checkBody("user", "No user provided.").notEmpty();
        request.checkBody("user", "No user provided.").test_mongodb_object_id();
        
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
        })
    }
};