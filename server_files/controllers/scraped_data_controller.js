//external dependencies
var BSON = require('bson');

//internal dependencies
var db_ref = require("../config/db_config.js");

module.exports = {

    findScrapedEventData: function(query_parameters, callback){

        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{
                
                db.collection(db_ref.get_scraped_events_dump_table()).find({}).toArray(function(err, docs) {
                    if(err){ console.log(err); }
                    else{
                        if(docs){
                            //console.log(docs)
                            callback( docs );
                        }
                        else{
                            callback({ failed: true, message: "Events not found." });
                        }
                    }
                });   
            }
        });
    }
}