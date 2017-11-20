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
    },
    
    get_scraped_events_dump_table: function(){
        return "scraped_training_events_dump_v0_1";
    },
    
    get_scraped_events_confirmed_table: function(){
        return "scraped_training_events_confirmed_v0_1";
    },
    
    get_broken_fields_data_table: function(){
        return "broken_fields";
    }
}