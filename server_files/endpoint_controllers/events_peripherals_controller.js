//external dependencies
var BSON = require('bson');
var loop = require("async-looper");

//internal dependencies
var db_ref = require("../config/db_config.js");

//objects
var event_projection = require("./events_controller.js").event_projection;

module.exports = {
    
    findEventsFromBeefChain: function(request, response, callback){
        
        //extract data
        var beef_chain_id = request.params.beef_chain_id;

        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{
                
                var beef_chain_id_object = BSON.ObjectID.createFromHexString(beef_chain_id);
                
                db.collection(db_ref.get_current_event_table()).aggregate([
                    { $match: { beef_chain_ids: beef_chain_id_object } },
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
                    event_projection
                   ]).toArray(function(queryErr, docs) {
                if(queryErr){ console.log(queryErr); }
                else{
                    if(docs && docs.length > 0){
                        callback( docs );
                    }
                    else{
                        callback({ failed: true, message: "Event not found." });
                    }
                }
                });            
            }
        });
    },
    
    findEventsRelatedToEvent: function(request, response, callback){
        
        var event_id = request.params.event_id;

        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{
                        
                var event_id_object = BSON.ObjectID.createFromHexString(event_id);

                db.collection(db_ref.get_current_event_table()).aggregate([
                    { $match: { _id: event_id_object } },
                    event_projection
                ]).toArray(function(queryErr, docs) {
                    if(queryErr){ console.log(queryErr); }
                    else{
                        if(docs && docs.length > 0){

                            var event = docs[0];
                            var actors = event.aggressors.concat(event.targets);
                            var event_limit_per_actor = 10 / actors.length;
                            var events = [];
                            var loop_count = 0
                            
                            //use an asynchronous loop to cycle through gallery items, if item is an image, save image to cloudinary and update gallery item link
                            loop(actors, function(actor_id, next){
                                var new_events = module.exports.findEventsRelatedToActor({ params: { actor_id: actor_id } });
                                
                                if(!events.message){
                                    events.concat(new_events);
                                }
                                
                                loop_count++;
                                
                                if(loop_count == actors.length){
                                    next(null, loop.END_LOOP);
                                }
                                else{
                                    next();
                                }
                                
                            }, function(){
                                callback( events );
                            });
                        }
                        else{
                            callback({ failed: true, message: "Event not found." });
                        }
                    }
                });
            }
        });
    },
    
    findEventsRelatedToActor: function(request, response, callback){
        
        //extract data
        var actor_id = request.params.actor_id;
        
        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{
                                
                db.collection(db_ref.get_current_event_table()).aggregate([
                    { $match: { $or: [{ aggressors: actor_id }, { targets: actor_id }] } },
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
                    { $limit: limit },
                    event_projection
                   ]).toArray(function(queryErr, docs) {
                if(queryErr){ console.log(queryErr); }
                else{
                    if(docs && docs.length > 0){
                         callback( docs );
                    }
                    else{
                        callback({ failed: true, message: "No events found." });
                    }
                }
                });            
            }
        });
    }

}