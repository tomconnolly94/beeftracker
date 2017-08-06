//model dependencies
var db_ref = require("../../db_config.js"); //get database reference object

module.exports = {
    
    execute : function(request, response) {
    
        var url = process.env.MONGODB_URI;
        var identifier = request.params.search_term;

        db_ref.get_db_object().connect(url, function(err, db) {
            if(err){ console.log(err); }
            else{
                var all_objects = new Array();

                async.waterfall([
                    function(callback){
                        //var object = BSON.ObjectID.createFromHexString(identifier);

                        //standard query to match an event and resolve aggressor and targets references
                        db.collection(db_ref.get_current_event_table()).aggregate([{ $match: { title : { $regex : identifier, $options : "i"} } },
                                                                    { $lookup : { 
                                                                        from: db_ref.get_current_actor_table(),
                                                                        localField: "aggressor",
                                                                        foreignField: "_id",
                                                                        as: "aggressor_object" } }
                                                                   ]).toArray(function(queryErr, events) {
                            if(queryErr){ console.log(queryErr); }
                            else{
                                all_objects = events;
                                callback(null);
                            }
                        });

                    },
                    function(callback){ 
                        //standard query to match an event and resolve aggressor and targets references
                        db.collection(db_ref.get_current_actor_table()).aggregate([{ $match: { stage_name : { $regex : identifier, $options : "i"} } },
                                                                    { $lookup : { 
                                                                        from: db_ref.get_current_actor_table(),
                                                                        localField: "_id",
                                                                        foreignField: "_id",
                                                                        as: "aggressor_object" } }
                                                                   ]).toArray(function(queryErr, events) {
                            if(err){ console.log(queryErr); }
                            else{
                                for(var i = 0; i < events.length;i++){
                                    all_objects.push(events[i]);                                
                                }
                                response.send( { objects : all_objects } );
                            }
                        });
                    }
                ], function (error, all_events) {
                    if (error) { console.log(error); }
                    else{

                    }
                });

            }
        });
    }
}