//external dependencies
var BSON = require("bson");

//internal dependencies
var db_ref = require("../config/db_config.js");

module.exports = {
    
    findActivityLogsFromEvent: function(request, response, callback){
        
        var event_id = request.params.event_id;
        
        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{
                var event_id_object = BSON.ObjectID.createFromHexString(event_id);

                //standard query to match an event and resolve aggressor and targets references
                db.collection(db_ref.get_activity_logs_table()).aggregate([{ $match: { event_id: event_id_object }},
                                                                            { $lookup : { 
                                                                                from: db_ref.get_user_details_table(),
                                                                                localField: "user_id",
                                                                                foreignField: "_id",
                                                                                as: "user_object" }},
                                                                           { $project: {
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
                                                                           }}
                                                                          ]).toArray(function(err, docs) {
                    //handle error
                    if(err) { console.log(err);}
                    else{
                        callback(docs);
                    }
                });
            }
        });
    },
    
    findActivityLogsFromActor: function(request, response){
        
        var actor_id = request.params.actor_id;
        
        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{
                var actor_id_object = BSON.ObjectID.createFromHexString(actor_id);

                //standard query to match an event and resolve aggressor and targets references
                db.collection(db_ref.get_activity_logs_table()).aggregate([{ $match: { actor_id: actor_id_object }},
                                                                            { $lookup : { 
                                                                                from: db_ref.get_user_details_table(),
                                                                                localField: "user_id",
                                                                                foreignField: "_id",
                                                                                as: "user_object" }},
                                                                           { $project: {
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
                                                                           }}
                                                                          ]).toArray(function(err, docs) {
                    //handle error
                    if(err) { console.log(err);}
                    else{
                        callback(docs);
                    }
                });
            }
        });
    }
}