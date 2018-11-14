
module.exports = {
    
    get: function(query_config, callback){
        console.log("get called");
    },
    
    delete: function(query_config, callback){
        console.log("delete called");
    },
    
    insert_record_into_db: function(insert_object, table, options, fn_callback){
        console.log("insert_record_into_db called");
    },
    
    update_record_in_db: function(insert_object, table, options, existing_object_id, fn_callback){
        console.log("update_record_in_db called");
    }    
}