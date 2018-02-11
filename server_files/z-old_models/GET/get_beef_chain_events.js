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
                                                           ]).forEach(function(beef_chain) {
                    var events = [];

                    for(var i = 0; i < beef_chain.events.length; i++){
                        events.push(beef_chain.events[i][0]);
                    }
                    
                    response.send({ events: events});
                });
            }
        });
    }
}

//scripted version
/*
db_ref.get_db_object().connect("mongodb://dev_server:yHwOd7f3ufSOrAssMdjf@ds141088.mlab.com:41088/heroku_b6mb54md", function(err, db) {
    if(err){ console.log(err); }
    else{
        var object = BSON.ObjectID.createFromHexString("5a637f81f299446e48404e87");
        
        
        //standard query to match an event and resolve aggressor and targets references
        //db.collection(db_ref.get_beef_chain_table()).aggregate([{ $match: {  } },
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
                                                                   ]).forEach(function(beef_chain) {
           
            console.log(beef_chain);
            console.log("events:");

            for(var i = 0; i < beef_chain.events.length; i++){
                console.log(beef_chain.events[i][0]);
            }

            console.log("actors:");

            for(var i = 0; i < beef_chain.actors.length; i++){
                console.log(beef_chain.actors[i][0]);
            }
            
        });
    }
});*/