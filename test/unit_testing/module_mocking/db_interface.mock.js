
module.exports = {
    
    get: function(query_config, callback){
        console.log("get called");
    },
    
    delete: function(query_config, callback){
        console.log("delete called");
    },
    
    insert: function(insert_object, table, options, fn_callback){
        console.log("insert called");
    },
    
    update: function(insert_object, table, options, existing_object_id, fn_callback){
        console.log("update called");
    }    
}