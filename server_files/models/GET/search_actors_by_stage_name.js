//get database reference object
var db_ref = require("../../db_config.js");

module.exports = {
    
    execute : function(request, response) {
    
        var url = process.env.MONGODB_URI;
        var identifier = request.params.actor_name;

        db_ref.get_db_object().connect(url, function(err, db) {
            if(err){ console.log(err); }
            else{
                var field_name = 'stage_name';

                //code to create a qry string that matches NEAR to query string
                var end = "{ \"$regex\": \"" + identifier + "\", \"$options\": \"i\" }";
                var qry = "{ \"" + field_name + "\" : " + end + " }";
                db.collection(db_ref.get_current_actor_table()).aggregate([{ $match: { _id : object } },
                                                            { $unwind : "$associated_actors"},
                                                            { $lookup : { 
                                                                from: db_ref.get_current_actor_table(),
                                                                localField: "associated_actors",
                                                                foreignField: "_id",
                                                                as: "associated_actors" }} 
                                                           ]).toArray(function(queryErr, docs) {
                if(queryErr){ console.log(queryErr); }
                else{
                    response.send( { eventObject : docs } );
                }
                });            
            }
        });
    }
}
