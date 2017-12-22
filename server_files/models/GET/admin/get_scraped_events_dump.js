//model dependencies
var db_ref = require("../../../db_config.js"); //get database reference object
var BSON = require('bson');

module.exports = {
    
    get_events : function(request, response) {
    
        var url = process.env.MONGODB_URI;

        db_ref.get_db_object().connect(url, function(err, db) {
            if(err){ console.log(err); }
            else{

                var limit = 20;
                
                db.collection(db_ref.get_scraped_events_dump_table()).aggregate([{ $match: { } },
                                                                                { $lookup : { 
                                                                                        from: db_ref.get_event_classification_table(), 
                                                                                        localField: "title", 
                                                                                        foreignField: "title", 
                                                                                        as: "classification_object" 
                                                                                }}
                                                                                ]).sort({date_added: 1 }).limit(limit).toArray(function(queryErr, docs) {
                    response.send({events : docs});
                });
            }
        });

    },
    
    get_num_of_events : function(request, response) {
    
        var url = process.env.MONGODB_URI;

        db_ref.get_db_object().connect(url, function(err, db) {
            if(err){ console.log(err); }
            else{
                
                db.collection(db_ref.get_scraped_events_dump_table()).find({}).count(function(queryErr, count) {
                    response.send({count : count});
                });
            }
        });

    }
}