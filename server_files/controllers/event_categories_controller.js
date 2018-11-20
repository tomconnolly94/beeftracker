////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Module: 
// Author: Tom Connolly
// Description: 
// Testing script:
//
////////////////////////////////////////////////////////////////////////////////////////////////////

//external dependencies

//internal dependencies
var db_ref = require("../config/db_config.js");
var db_interface = require("../interfaces/db_interface.js");

//objects
var EventCategory = require("../schemas/event_category.schema");

module.exports = {
    
    getEventCategories: function(callback){

        var query_config = {
            table: db_ref.get_event_categories_table(),
            aggregate_array: [
                {
                    $match: {}
                }
            ]
        };

        db_interface.get(query_config, function(results){
            callback(results);
        },
        function(error_object){
            callback(error_object);
        });
    },
    

    createEventCategory: function(event_category_data, callback){

        var count_title = "event_category_count";

        var query_config = {
            table: db_ref.get_event_categories_table(),
            aggregate_array: [
                {
                    $count: "event_category_count"
                }
            ]
        };

        db_interface.get(query_config, function(result){
        
            var new_category_record = EventCategory({
                cat_id: result[count_title],
                name: event_category_data
            });

            var insert_config = {
                record: new_category_record,
                table: db_ref.get_event_categories_table(),
                options: {}
            };

            db_interface.insert(insert_config, function(result){
                callback(result);
            },
            function(error_object){
                callback(error_object);
            });
        },
        function(error_object){
            callback(error_object);
        });
    }
}