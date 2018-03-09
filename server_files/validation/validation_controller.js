//external dependencies

//internal dependencies
var actor_validation_custom_functions = require("./actor_validation").get_custom_validation_functions;
var authentication_request_validation_custom_functions = require("./authentication_request_validation").get_custom_validation_functions;
var comment_validation_custom_functions = require("./comment_validation").get_custom_validation_functions;
var event_categories_validation_custom_functions = require("./event_categories_validation").get_custom_validation_functions;
var event_validation_custom_functions = require("./event_validation").get_custom_validation_functions;
var update_request_validation_custom_functions = require("./update_request_validation").get_custom_validation_functions;
var user_validation_custom_functions = require("./user_validation").get_custom_validation_functions;

module.exports = {
    
    get_all_custom_validation_functions: function(){
        
        //list of validation modules
        var validation_modules_list = [
            actor_validation_custom_functions,
            authentication_request_validation_custom_functions,
            comment_validation_custom_functions,
            event_categories_validation_custom_functions,
            event_validation_custom_functions,
            update_request_validation_custom_functions,
            user_validation_custom_functions
        ];
        var master_functions_object = {};
        
        //loop through the validation modules and use the get custom validator functions function to group all the custom validator functions into one object
        for(var i = 0; i < validation_modules_list.length; i++){
            master_functions_object = Object.assign(master_functions_object, validation_modules_list[i]()); //combine all functions into the master functions object
        }
        
        return master_functions_object;
    }
}