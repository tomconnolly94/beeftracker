
module.exports = {
    dummy_object_id: "5a69027a01e599f97e278f73",

    compare_object_fields: function(object_1, object_2){
        var object_1_keys = Object.keys(object_1);
        var object_2_keys = Object.keys(object_2);
        
        if(object_1_keys.length != object_2_keys.length){
            return false;
        }

        object_1_keys.sort();
        object_2_keys.sort();

        for(var key_index = 0; key_index < object_1_keys.length; key_index++){
            if(object_1_keys[key_index] != object_2_keys[key_index]){
                return false;
            }
        }
        return true;
    },

    compare_objects: function(object_1, object_2, fields_to_skip = []){

        if(!this.compare_object_fields(object_1, object_2)){
            return false;
        }

        var object_1_keys = Object.keys(object_1).sort();
        var object_2_keys = Object.keys(object_2).sort();

        for(var key_index = 0; key_index < object_1_keys.length; key_index++){
            if(typeof(object_1[object_1_keys[key_index]]) == 'object'){
                if(!module.exports.compare_objects(object_1[object_1_keys[key_index]], object_2[object_2_keys[key_index]], fields_to_skip)){
                    return false;
                }
            }
            else{
                if(isNaN(object_1_keys[key_index])){ //object_1 is an object
                    if(!fields_to_skip.includes(object_1_keys[key_index])){
                        if(object_1[object_1_keys[key_index]] != object_2[object_2_keys[key_index]]){
                            return false;
                        }
                    }
                }
                else{ //object_1 is an array
                    if(!object_2.includes(object_1[key_index])){
                        return false;
                    }
                }
            }
        }
        return true;
    }
}