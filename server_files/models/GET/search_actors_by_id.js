//get database reference object
var db_ref = require("../../db_config.js");
var BSON = require('bson');

module.exports = {
    
    execute : function(request, response) {
    
        var url = process.env.MONGODB_URI;
        var identifier = request.params.actor_id;

        db_ref.get_db_object().connect(url, function(err, db) {
            if(err){ console.log(err); }
            else{
                var object = BSON.ObjectID.createFromHexString(identifier);

                db.collection(db_ref.get_current_actor_table()).aggregate([{ $match: { _id : object } }/*, 
                                                            { $unwind : "$associated_actors"},
                                                            { $lookup : { 
                                                                from: current_actor_table,
                                                                         localField: "associated_actors",
                                                                         foreignField: "_id",
                                                                         as: "associated_actor_objects" }}*/
                                                           ]).toArray(function(queryErr, docs) {
                    if(queryErr){ console.log(queryErr); }
                    else{
                        response.send( { actor : docs[0] } );
                    }
                });
            }
        });
    }

}
