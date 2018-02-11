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

                var object = BSON.ObjectID.createFromHexString(identifier);

                db.collection(db_ref.get_current_event_table()).aggregate([{ $match: { aggressor : object } },
                                                            { $unwind : "$targets"}, 
                                                            { $lookup : { from: db_ref.get_current_actor_table(), localField: "aggressor", foreignField: "_id", as: "aggressor_object" }}, 
                                                            { $lookup : { from: db_ref.get_current_actor_table(), localField: "targets", foreignField: "_id", as: "targets" }}
                                                           ]).toArray(function(queryErr, docs) {
                //db.collection(current_event_table).find(JSON.parse(qry)).sort({"date_added" : -1}).limit(6).toArray(function(queryErr, docs) {

                    response.send( { events : docs } );
                });

            }
        });

    }
}