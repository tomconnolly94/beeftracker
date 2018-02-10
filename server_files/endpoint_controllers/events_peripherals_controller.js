//controller dependencies
var BSON = require('bson');
var loop = require("async-looper");

var db_ref = require("../db_config.js");
var event_projection = require("./events_controller.js").event_projection;

module.exports = {
    
    findEventsFromBeefChain: function(request, response){
        
        //extract data
        var beef_chain_id = request.params.beef_chain_id;

        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{
                
                var beef_chain_id_object = BSON.ObjectID.createFromHexString(beef_chain_id);
                
                db.collection(db_ref.get_current_event_table()).aggregate([
                    { $match: { beef_chain_id: beef_chain_id_object } },
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
                        response.status(200).send( docs[0] );
                    }
                    else{
                        response.status(404).send( { message: "Event not found."} );
                    }
                }
                });            
            }
        });
    },
    
    findFeaturedEvents: function(request, response){
        
        var url = process.env.MONGODB_URI;

        db_ref.get_db_object().connect(url, function(err, db) {
            if(err){ console.log(err); }
            else{

                db.collection(db_ref.get_featured_events_table()).aggregate([
                    { $match: { } },
                    { $lookup : { 
                        from: db_ref.get_current_event_table(),
                        localField: "_id",
                        foreignField: "_id",
                        as: "resolved_event" }
                    }, 
                    { $unwind: {
                        path: "$resolved_event",
                        preserveNullAndEmptyArrays: true
                      }
                    }, 
                    { $lookup : { 
                        from: db_ref.get_current_actor_table(),
                        localField: "resolved_event.aggressor",
                        foreignField: "_id",
                        as: "resolved_event.aggressor_object" }
                    },
                    { $group: {
                        _id : "$_id",
                        resolved_event: { $first: "$resolved_event" }
                    }
                    },
                    { $sort : { order : -1} }
                ]).sort({ order : -1 }).toArray(function(queryErr, docs) {
                    console.log(docs[0]._id)
                    console.log(docs[1]._id)
                    console.log(docs[2]._id)
                    console.log(docs[3]._id)
                    
                    response.send( docs );
                });
            }
        });
    },
    
    findEventsRelatedToEvent: function(request, response){
        
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
                                var events = this.findEventsRelatedToActor({ params: { actor_id: actor_id } });
                                
                                if(!events.message){
                                    events.concat(events);
                                }
                                
                                loop_count++;
                                
                                if(loop_count == actors.length){
                                    next(null, loop.END_LOOP);
                                }
                                else{
                                    next();
                                }
                                
                            }, function(){
                                if(response){ response.status(200).send( events ); }
                            });
                        }
                        else{
                            response.status(404).send( { message: "Event not found."} );
                        }
                    }
                });
            }
        });
    },
    
    findEventsRelatedToActor: function(request, response){
        
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
                        if(response){ response.status(200).send( docs ); }
                        else{ return docs; }
                    }
                    else{
                        if(response){ response.status(404).send( { message: "No events found."} ); }
                        else{ return { message: "No events found."}; }
                    }
                }
                });            
            }
        });
    }

}