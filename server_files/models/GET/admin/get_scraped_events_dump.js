//model dependencies
var db_ref = require("../../../db_config.js"); //get database reference object
var BSON = require('bson');

module.exports = {
    
    execute : function(request, response) {
    
        var url = process.env.MONGODB_URI;
        var identifier = request.params.actor_id;

        db_ref.get_db_object().connect(url, function(err, db) {
            if(err){ console.log(err); }
            else{


                db.collection(db_ref.get_scraped_events_dump_table()).find({}).limit(60).toArray(function(queryErr, docs) {
                    response.send({events : docs});
                });
            }
        });

    }
}