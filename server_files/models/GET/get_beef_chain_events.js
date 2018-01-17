//get database reference object
var db_ref = require("../../db_config.js");
var BSON = require("bson");

module.exports = {
    
    execute : function(request, response) {

        var url = process.env.MONGODB_URI;
        var identifier = request.params.beef_chain_id;

        db_ref.get_db_object().connect(url, function(err, db) {
            if(err){ console.log(err); }
            else{
                var object = BSON.ObjectID.createFromHexString(identifier);


                //standard query to match an event and resolve aggressor and targets references
                db.collection(db_ref.get_beef_chain_table()).aggregate([{ $match: { _id: object } },
                                                                            { $unwind : { "path" : "$events", "preserveNullAndEmptyArrays": true  }},
                                                                            { $lookup : { 
                                                                                from: db_ref.get_current_event_table(),
                                                                                localField: "events",
                                                                                foreignField: "_id",
                                                                                as: "event_objects" }},
                                                                            { $unwind : { "path" : "$actors", "preserveNullAndEmptyArrays": true  }},
                                                                            { $lookup : { 
                                                                                from: db_ref.get_current_actor_table(),
                                                                                localField: "actors",
                                                                                foreignField: "_id",
                                                                                as: "actor_objects" }},
                                                                            { $group: {
                                                                                _id : "$_id",
                                                                                events : { "$addToSet": "$event_objects" },
                                                                                actors : { "$addToSet": "$actor_objects" }
                                                                            }}
                                                                           ]).toArray(function(err, docs) {
                    if(err){
                        console.log(err);
                    }
                    else if(docs.length == 0){
                        console.log("No events found.");
                        response.send({message: "No beef chains found."});
                    }
                    else{
                        response.send({beef_chain: docs[0]});
                    }
                });
            }
        });
    }
}

//scripted version
/*
var url = process.env.MONGODB_URI;

db_ref.get_db_object().connect("mongodb://dev_server:yHwOd7f3ufSOrAssMdjf@ds141088.mlab.com:41088/heroku_b6mb54md", function(err, db) {
    if(err){ console.log(err); }
    else{
        var object = BSON.ObjectID.createFromHexString("5a5e70bb0e5cbd3a061423a6");
        
        
        //standard query to match an event and resolve aggressor and targets references
        db.collection(db_ref.get_beef_chain_table()).aggregate([{ $match: { _id: object } },
                                                                    { $unwind : { "path" : "$events", "preserveNullAndEmptyArrays": true  }},
                                                                    { $lookup : { 
                                                                        from: db_ref.get_current_event_table(),
                                                                        localField: "events",
                                                                        foreignField: "_id",
                                                                        as: "event_objects" }},
                                                                    { $unwind : { "path" : "$actors", "preserveNullAndEmptyArrays": true  }},
                                                                    { $lookup : { 
                                                                        from: db_ref.get_current_actor_table(),
                                                                        localField: "actors",
                                                                        foreignField: "_id",
                                                                        as: "actor_objects" }},
                                                                    { $group: {
                                                                        _id : "$_id",
                                                                        events : { "$addToSet": "$event_objects" },
                                                                        actors : { "$addToSet": "$actor_objects" }
                                                                    }}
                                                                   ]).toArray(function(err, docs) {
            if(err){
                
                console.log(err)
            }
            else if(docs.length == 0){
                console.log("No events found.")
            }
            else{
                console.log(docs);

                for(var i = 0; i < docs[0].events.length; i++){
                    console.log(docs[0].events[i]);
                }
                
                for(var i = 0; i < docs[0].actors.length; i++){
                    console.log(docs[0].actors[i]);
                }
            }
        });
    }
});*/