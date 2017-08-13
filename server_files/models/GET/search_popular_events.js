//model dependencies
var db_ref = require("../../db_config.js"); //get database reference object

module.exports = {
    
    execute : function(request, response) {

        //get necessary fields for use later
        var url = process.env.MONGODB_URI;
        var limit = parseInt(request.params.num_of_events);

        db_ref.get_db_object().connect(url, function(err, db) {
            if(err){ console.log(err); }
            else{
                var field_name = 'aggressor';

                db.collection(db_ref.get_current_event_table()).aggregate( [ { $lookup : 
                                                                              { from: db_ref.get_current_actor_table(), 
                                                                               localField: "aggressor", 
                                                                               foreignField: "_id",
                                                                               as: "aggressor_object" 
                                                                              }}]).sort({"hit_count" : -1}).limit(limit).toArray(function(queryErr, docs) {
                    response.send( { events : docs } );
                });
            }
        });
    }
}