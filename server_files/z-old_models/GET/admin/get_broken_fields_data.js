//model dependencies
var db_ref = require("../../../db_config.js"); //get database reference object
var BSON = require('bson');

module.exports = {
    
    execute : function(request, response) {
    
        var url = process.env.MONGODB_URI;

        db_ref.get_db_object().connect(url, function(err, db) {
            if(err){ console.log(err); }
            else{
                
                db.collection(db_ref.get_broken_fields_data_table()).find({}).toArray(function(queryErr, docs) {
                    response.send({data : docs});
                });
            }
        });

    }
}