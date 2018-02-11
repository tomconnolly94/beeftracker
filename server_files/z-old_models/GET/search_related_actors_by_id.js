//model dependencies
var db_ref = require("../../db_config.js"); //get database reference object
var async = require("async");
var BSON = require('bson');

module.exports = {
    
    execute : function(request, response) {
    
        var url = process.env.MONGODB_URI;
        var identifier = request.params.actor_id;

        db_ref.get_db_object().connect(url, function(err, db) {
            if(err){ console.log(err); }
            else{

                var object = BSON.ObjectID.createFromHexString(identifier);

                async.waterfall([
                    function(callback){
                        var object = BSON.ObjectID.createFromHexString(identifier);

                        //standard query to match an event and resolve aggressor and targets references
                        db.collection(db_ref.get_current_actor_table()).find( { _id : object }).toArray(function(queryErr, response) {
                            if(queryErr){ console.log(queryErr); }
                            else{
                                if(response != undefined){
                                    callback(null,response[0].associated_actors);
                                }
                            }
                        });

                    },
                    function(associated_actors, callback){


                        assoc_act_arr = new Array();

                        if(associated_actors != undefined){
                            for(var i = 0; i < Object.keys(associated_actors).length; i++){
                                assoc_act_arr.push(associated_actors[i]);
                            }
                        }
                        db.collection(db_ref.get_current_actor_table()).find({ _id : { $in : assoc_act_arr }}).toArray(function(queryErr, actors) {
                            if(err){ console.log(queryErr); }
                            else{
                                response.send( { actors : actors } );
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