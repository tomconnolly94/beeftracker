//model dependencies
var db_ref = require("../../db_config.js"); //get database reference object

module.exports = {
    
    execute : function(request, response) {

        var url = process.env.MONGODB_URI;

        db_ref.get_db_object().connect(url, function(err, db) {
            if(err){ console.log(err); }
            else{
                //standard query to match an event and resolve aggressor and targets references
                db.collection(db_ref.get_current_actor_table()).find().sort({"stage_name" : 1}).toArray(function(queryErr, docs) {
                    response.send({items : docs});
                });
            }
        });
    }
}