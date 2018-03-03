//external dependencies

//internal dependencies
var event_validation_custom_functions = require("./event_validation").get_custom_validation_functions;

module.exports = {
    
    get_all_custom_validation_functions: function(){
        
        var validation_modules_list = [ 
            event_validation_custom_functions 
        ];
        var master_functions_object = {};
        
        for(var i = 0; i < validation_modules_list.length; i++){
            master_functions_object = Object.assign(master_functions_object, validation_modules_list[0]()); //combine all functions into the master functions object
        }
        
        console.log(master_functions_object);
        
        return master_functions_object;
    }
    
    
}