//model dependencies
var db_ref = require("../../db_config.js"); //get database reference object
var BSON = require('bson');

module.exports = {
    
    execute : function(request, response) {
    
        var url = process.env.MONGODB_URI;
        var identifier = request.params.actor_id;

        db_ref.get_db_object().connect(url, function(err, db) {
            if(err){ console.log(err); }
            else{


                db.collection(db_ref.get_splash_zone_table()).aggregate([{ $match: { } },
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
                    
                    response.send({events : docs});
                });
            }
        });

    }
}