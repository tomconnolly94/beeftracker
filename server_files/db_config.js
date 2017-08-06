//file to hold all configuration needed to access appropriate tables in the database

module.exports = {

    //create database reference object
    get_db_object: function(){
        return require('mongodb').MongoClient;
    },

    //create vars for current db table names
    get_current_event_table: function(){
        return "event_data_v0_3";
    },

    get_current_actor_table: function(){
        return "actor_data_v0_3";
    },
    
    get_current_subscriber_details_table: function(){
        return "subscriber_details_v0_3";
    },
    
    get_splash_zone_table: function(){
        return "splash_zone_refs";
    }
}