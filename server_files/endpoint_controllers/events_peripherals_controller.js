

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
        console.log("test completed 3.");
        console.log(request.params.id);
        response.send({test: "complete 3"});
    },
    
    findEventsRelatedToActor: function(request, response){
        console.log("test completed 3.");
        console.log(request.body);
        response.send({test: "complete 4"});
    }
}