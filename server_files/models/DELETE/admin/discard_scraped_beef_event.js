//model dependencies
var db_ref = require("../../../db_config.js"); //get database reference object
var async = require("async");
var BSON = require('bson');

module.exports = {
    
    execute : function(request, response) {
    
        var url = process.env.MONGODB_URI;
        var data;
        
        console.log(request.body);
        
        if(typeof request.body.data =='object'){
            // It is JSON
            data = request.body.data; //get form data
        }
        else{
            data = JSON.parse(request.body.data);
        }
        
        var new_classification = data.classification;
        var identifier = data.event_id;
        
        console.log(new_classification);
        console.log(identifier);
        
        var object = BSON.ObjectID.createFromHexString(identifier);

        db_ref.get_db_object().connect(url, function(err, db) {
            if(err){ console.log(err); }
            else{
                db.collection(db_ref.get_scraped_events_dump_table()).findOneAndDelete( { _id: object }, function(err, document_1){
                    if(err){ console.log(err); } 
                    else if(!document_1.value){ console.log("event not found in scraping dump table."); }
                    else{
                        console.log(document_1);

                        async.waterfall([
                            function(callback){ //update broken field

                                var broken_record = {
                                    "broken_field": "none",
                                    "source": document_1.value.data_source,
                                    "broken_mode": "irrelevant",
                                    "value": document_1.value.title
                                };

                                db.collection(db_ref.get_broken_fields_data_table()).insert( broken_record, function(err, document_2){ callback(null, document_1); });
                            },
                            function(document_2, callback){ //gather all the targets' responses
                                    
                                console.log(new_classification);
                                console.log(document_2);                                
                                
                                db.collection(db_ref.get_event_classification_table()).update( { title: document_2.value.title }, { $set: { classification: new_classification } }, function(err, document_3){
                                    if(err){ console.log(err); }
                                    callback(null);
                                });
                            }
                        ], function (error) {
                            if (error) { console.log(error); }
                            else{
                                console.log("sending response.")
                                response.send();
                            }
                        });
                    }
                });
                
            }
        });

    }
}