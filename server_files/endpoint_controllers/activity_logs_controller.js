//controller dependencies
var db_ref = require("../db_config.js");
var BSON = require("bson");

module.exports = {
    
    findActivityLogsFromEvent: function(request, response){
        
        var event_id = request.params.event_id;
        
        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{
                var event_id_object = BSON.ObjectID.createFromHexString(event_id);

                //standard query to match an event and resolve aggressor and targets references
                db.collection(db_ref.get_activity_logs_table()).find({ event_id: event_id_object }).toArray(function(err, docs) {
                    //handle error
                    if(err) { console.log(err);}
                    else{
                        //if(docs.length > 0){
                            response.send({ activity_logs : docs });
                        /*}
                        else{
                            response.send({ comments : [] });
                        }*/
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
                db.collection(db_ref.get_activity_logs_table()).find({ actor_id: actor_id_object }).toArray(function(err, docs) {
                    //handle error
                    if(err) { console.log(err);}
                    else{
                        //if(docs.length > 0){
                            response.send({ activity_logs : docs });
                        /*}
                        else{
                            response.send({ comments : [] });
                        }*/
                    }
                });
            }
        });
    }
}