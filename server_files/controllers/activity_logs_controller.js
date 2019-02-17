////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Module: activity_logs_controller
// Author: Tom Connolly
// Description: Controller module to take care of accessing activity logs from the db
// Testing script: test/unit_testing/controller_tests/activity_logs_controller.test.js
//
////////////////////////////////////////////////////////////////////////////////////////////////////

//external dependencies
var BSON = require("bson");

//internal dependencies
var db_ref = require("../config/db_config.js");
var db_interface = require('../interfaces/db_interface.js');

var get_aggregate_array = function(match_query){
    return [
        { 
            $match: match_query
        },
        {
            $lookup : { 
                from: db_ref.get_user_details_table(),
                localField: "user_id",
                foreignField: "_id",
                as: "user_object" 
            }
        },
        { 
            $project: {
                "action": 1,
                "date": 1,
                "likes": 1,
                "user_object": 1
            }
        }
    ]
}

module.exports = {
        
    findActivityLogsFromEvent: function(event_id, callback){
        
        var query_config = {
            table: db_ref.get_activity_logs_table(),
            aggregate_array: get_aggregate_array({ event_id: BSON.ObjectID.createFromHexString(event_id) })
        }
        
        db_interface.get(query_config, function(results){
            callback(results);
        },
        function(error_object){
            callback(error_object)
        });
    },
    
    findActivityLogsFromActor: function(actor_id, callback){
                
        var query_config = {
            table: db_ref.get_activity_logs_table(),
            aggregate_array: get_aggregate_array({ actor_id: BSON.ObjectID.createFromHexString(actor_id) })
        }
        
        db_interface.get(query_config, function(results){
            callback(results);
        },
        function(error_object){
            callback(error_object)
        });
    }
}