////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Module: event_peripherals_controller
// Author: Tom Connolly
// Description: Module to store extra operations that help encapsulate repeated operations that are
// required for event objects but are not part of core 'event' functionality
// Testing script: test/unit_testing/controller_tests/event_peripherals_controller.test.js
//
////////////////////////////////////////////////////////////////////////////////////////////////////

//external dependencies
var BSON = require('bson');
var loop = require("async-looper");

//internal dependencies
var db_ref = require("../config/db_config.js");
var db_interface = require("../interfaces/db_interface.js");

//objects
var get_aggregate_array = require("./events_controller.js").get_aggregate_array;

module.exports = {
    
    findEventsFromBeefChain: function(beef_chain_id, callback){

        var query_config = {
            table: db_ref.get_beef_chain_table(),
            aggregate_array: [
                { 
                    $match: {
                        _id: BSON.ObjectID.createFromHexString(beef_chain_id)
                    }
                },
                {
                    $lookup: {
                        from: db_ref.get_current_event_table(),
                        localField: "event_ids",
                        foreignField: "_id",
                        as: "events"
                    }
                }
            ]
        };

        db_interface.get(query_config, function(results){

            var beef_chain = results[0];
            var events = beef_chain.events;
            var events_map = events.map(function(event){ return String(event._id); })

            for(var i = 0; i < beef_chain.event_ids.length; i++){
                if(events_map.indexOf(String(beef_chain.event_ids[i])) == -1){
                    events.push({ _id: beef_chain.event_ids[i] });
                }
            }

            callback(events);
        },
        function(error_object){
            callback(error_object);
        });
    },
    
    findEventsRelatedToEvent: function(event_id, callback){
        
        var query_config = {
            table: db_ref.get_current_event_table(),
            aggregate_array: [
                { 
                    $match: { _id: BSON.ObjectID.createFromHexString(event_id) } 
                },
                event_projection
            ]
        };

        db_interface.get(query_config, function(results){
            
            var event = results[0];
            var events = [];
            var actor_query_promises = [];

            var actor_limit = 3;

            var actors = event.aggressors.slice(0, actor_limit).concat(event.targets.slice(0, actor_limit));
            var event_limit_per_actor = Math.ceil(10 / actors.length);

            for(var actor_index = 0; actor_index < actors.length; actor_index++){
                actor_query_promises.push(
                    new Promise(function(resolve, reject){
                        module.exports.findEventsRelatedToActor(actors[actor_index], function(results){
                            if(results.failed){
                                reject(results);
                            }
                            else{
                                resolve(results);
                            }
                        });
                    })
                );
            }
                
            Promise.all(actor_query_promises).then(function(values) {
                
                for(var i = 0; i < values.length; i++){
                    events = events.concat(values[i].slice(0, event_limit_per_actor));
                }

                callback(events);

            }).catch(function(error){
                console.log(error);
                callback(error);
            });
        });
    },
    
    findEventsRelatedToActor: function(actor_id, callback){
        
        var query_config = {
            table: db_ref.get_current_event_table(),
            aggregate_array: [
                { $match: { $or: [{ aggressors: BSON.ObjectID.createFromHexString(actor_id) }, { targets: BSON.ObjectID.createFromHexString(actor_id) }] } },
                { $unwind : "$aggressors"},
                { $lookup : {
                    from: db_ref.get_current_actor_table(),
                    localField: "aggressors",
                    foreignField: "_id",
                    as: "aggressors" 
                }},
                { $unwind : "$targets"},
                { $lookup : { 
                    from: db_ref.get_current_actor_table(),
                    localField: "targets",
                    foreignField: "_id",
                    as: "targets" 
                }},
                { $limit: 30 },
                event_projection
            ]
        };

        db_interface.get(query_config, function(results){
            callback(results);
        },
        function(error_object){
            callback(error_object);
        });
    }
}