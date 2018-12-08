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

module.exports = {
        
    findActivityLogsFromEvent: function(request, callback){
        
        var event_id_object = BSON.ObjectID.createFromHexString(request.params.event_id);

        var query_config = {
            table: db_ref.get_activity_logs_table(),
            aggregate_array: [
                { 
                    $match: {
                        event_id: event_id_object 
                    }
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
                        "user_object": {
                            $let: {
                                vars: {
                                    first_user: {
                                        "$arrayElemAt": [ "$user_object", 0 ]
                                    }
                                },
                                in: {
                                    first_name: "$$first_user.first_name",
                                    last_name: "$$first_user.last_name",
                                    img_title: "$$first_user.img_title"
                                }
                            }
                        }
                    }
                }
            ]
        }
        
        db_interface.get(query_config, function(results){
            callback(results);
        },
        function(error_object){
            callback(error_object)
        });
    },
    
    findActivityLogsFromActor: function(request, callback){
        
        var actor_id_object = BSON.ObjectID.createFromHexString(request.params.actor_id);
        
        var query_config = {
            table: db_ref.get_activity_logs_table(),
            aggregate_array: [
                { 
                    $match: { 
                        actor_id: actor_id_object 
                    }
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
                        "user_object": {
                            $let: {
                                vars: {
                                    first_user: {
                                        "$arrayElemAt": [ "$user_object", 0 ]
                                    }
                                },
                                in: {
                                    first_name: "$$first_user.first_name",
                                    last_name: "$$first_user.first_name",
                                    img_title: "$$first_user.first_name"
                                }
                            }
                        }
                    }
                }
            ]
        }
        
        db_interface.get(query_config, function(results){
            callback(results);
        },
        function(error_object){
            callback(error_object)
        });
    }
}