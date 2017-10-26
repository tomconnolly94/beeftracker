//get database reference object
var db_ref = require("../../../../db_config.js");
var BSON = require('bson');

//configure testing mode, if set: true, record will be collected, printed but not sent to db and no email notification will be sent.
var test_mode = false;

module.exports = {
    
    execute : function(request, response) {

        var url = process.env.MONGODB_URI;
        var event_ids = request.body.event_ids;        
        
        //store data temporarily until submission is confirmed
        db_ref.get_db_object().connect(url, function(err, db) {
            if(err){ console.log(err); }
            else{
                db.collection(db_ref.get_splash_zone_table()).remove(function(err, document){
                    
                    var insert_objects_list = [];
                    
                    for(var i = 0; i < event_ids.length; i++){
                    
                        var insert_object = {
                            _id: BSON.ObjectID.createFromHexString(event_ids[i]),
                            order: i + 1
                        }
                        insert_objects_list.push(insert_object)
                    }
                    
                    console.log(insert_objects_list)
                    //standard query to match an event and resolve aggressor and targets references
                    db.collection(db_ref.get_splash_zone_table()).insert(insert_objects_list, function(err, document){
                        if(err){ console.log(err); }
                    });
                });
            }
        });
    }
}