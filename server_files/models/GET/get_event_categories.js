//get database reference object
var db_ref = require("../../db_config.js");

module.exports = {
    
    execute : function(request, response) {

        var url = process.env.MONGODB_URI;

        db_ref.get_db_object().connect(url, function(err, db) {
            if(err){ console.log(err); }
            else{
                //standard query to match an event and resolve aggressor and targets references
                db.collection("event_categories").find().toArray(function(queryErr, docs) {
                    response.send({categories : docs});
                });
            }
        });
    }
}
