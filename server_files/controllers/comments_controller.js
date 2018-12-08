////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Module: comments_controller
// Author: Tom Connolly
// Description: Module to handle operations in creating, deleting and finding various comments made 
// on actors, beef events or chains, by users. 
// Testing script: test/unit_testing/controller_tests/comments_controller.test.js
//
////////////////////////////////////////////////////////////////////////////////////////////////////

//external dependencies
var BSON = require("bson");

//internal dependencies
var db_ref = require("../config/db_config.js");
var db_interface = require("../interfaces/db_interface.js");
var logging = require("../tools/logging.js");

//objects
var Comment = require("../schemas/comment.schema");

module.exports = {
    
    createComment: function(comment_data, callback){

        var comment_record = new Comment({
            text: comment_data.text,
            user: BSON.ObjectID.createFromHexString(comment_data.user),
            event_id: comment_data.event_id ? BSON.ObjectID.createFromHexString(comment_data.event_id) : null,
            actor_id: comment_data.actor_id ? BSON.ObjectID.createFromHexString(comment_data.actor_id) : null,
            beef_chain_id: comment_data.beef_chain_id ? BSON.ObjectID.createFromHexString(comment_data.beef_chain_id) : null,
            date_added: new Date(),
            likes: 0
        });
        
        logging.submit_log("alert", "comments_controller", "New comment record" + comment_record);

        var insert_config = {
            record: comment_record,
            table: db_ref.get_comments_table(),
            options: {}
        };

        db_interface.insert(insert_config, function(result){
            callback(result);
        },
        function(error_object){
            callback(error_object);
        });
    },
    
    findCommentsFromEvent: function(event_id, callback){

        var event_id_object = BSON.ObjectID.createFromHexString(event_id);

        var query_config = {
            table: db_ref.get_comments_table(),
            aggregate_array: [
                { $match: { event_id: event_id_object } },
                { $lookup : {
                    from: db_ref.get_user_details_table(),
                    localField: "user",
                    foreignField: "_id",
                    as: "user" 
                }},
                { $project: {
                    "text": 1,
                    "date_added": 1,
                    "likes": 1,
                    "event_id": 1,
                    "actor_id": 1,
                    "user": {
                        $let: {
                            vars: {
                                first_user: {
                                    "$arrayElemAt": [ "$user", 0 ]
                                }
                            },
                            in: {
                                first_name: "$$first_user.first_name",
                                last_name: "$$first_user.last_name",
                                img_title: "$$first_user.img_title"
                            }
                        }
                    }
                }}
            ]
        }

        db_interface.get(query_config, function(results){
            callback(results);
        },
        function(error_object){
            callback(error_object);
        });
    },
    
    findCommentsFromBeefChain: function(beef_chain_id, callback){
        
        var beef_chain_id_object = BSON.ObjectID.createFromHexString(beef_chain_id);

        var query_config = {
            table: db_ref.get_comments_table(),
            aggregate_array: [
                { $match: { beef_chain_id: beef_chain_id_object } },
                { $lookup : {
                    from: db_ref.get_user_details_table(),
                    localField: "user",
                    foreignField: "_id",
                    as: "user" 
                }},
                { $project: {
                    "text": 1,
                    "date_added": 1,
                    "likes": 1,
                    "event_id": 1,
                    "actor_id": 1,
                    "beef_chain_id": 1,
                    "user": {
                        $let: {
                            vars: {
                                first_user: {
                                    "$arrayElemAt": [ "$user", 0 ]
                                }
                            },
                            in: {
                                first_name: "$$first_user.first_name",
                                last_name: "$$first_user.last_name",
                                img_title: "$$first_user.img_title"
                            }
                        }
                    }
                }},
                { $sort: { date_added: -1 } }
            ]
        }

        db_interface.get(query_config, function(results){
            callback(results);
        },
        function(error_object){
            callback(error_object);
        });
    },
    
    findCommentsFromActor: function(actor_id, callback){

        var actor_id_object = BSON.ObjectID.createFromHexString(actor_id);

        var query_config = {
            table: db_ref.get_comments_table(),
            aggregate_array: [
                { $match: { actor_id: actor_id_object } },
                { $lookup : {
                    from: db_ref.get_user_details_table(),
                    localField: "user",
                    foreignField: "_id",
                    as: "user" 
                }},
                { $project: {
                    "text": 1,
                    "date_added": 1,
                    "likes": 1,
                    "event_id": 1,
                    "actor_id": 1,
                    "user": {
                        $let: {
                            vars: {
                                first_user: {
                                    "$arrayElemAt": [ "$user", 0 ]
                                }
                            },
                            in: {
                                first_name: "$$first_user.first_name",
                                last_name: "$$first_user.last_name",
                                img_title: "$$first_user.img_title"
                            }
                        }
                    }
                }}
            ]
        }

        db_interface.get(query_config, function(results){
            callback(results);
        },
        function(error_object){
            callback(error_object);
        });
    },
    
    deleteComment: function(comment_id, callback){

        var comment_id_object = BSON.ObjectID.createFromHexString(comment_id);
        
        var delete_config = {
            table: db_ref.get_comments_table(),
            match_query: { _id: comment_id_object }
        }

        db_interface.delete(delete_config, function(result){
            callback(result);
        },
        function(error_object){
            callback(error_object);
        });
    }
}