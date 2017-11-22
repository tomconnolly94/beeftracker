//model dependencies
var db_ref = require("../../../db_config.js"); //get database reference object
var BSON = require('bson');

module.exports = {
    
    execute : function(request, response) {
    
        var url = process.env.MONGODB_URI;
        var identifier = request.params.id;
        
        console.log(identifier);
        
        var object = BSON.ObjectID.createFromHexString(identifier);

        db_ref.get_db_object().connect(url, function(err, db) {
            if(err){ console.log(err); }
            else{
                db.collection(db_ref.get_scraped_events_dump_table()).findOneAndDelete( { _id: object }, function(err, document){
                    console.log(document);
                    
                    var broken_record = {
                        "broken_field": "none",
                        "source": document.value.data_source,
                        "broken_mode": "irrelevant",
                        "value": document.value.title
                    };
                    
                    db.collection(db_ref.get_broken_fields_data_table()).insert( broken_record, function(err, document){
                        response.send();
                    });
                });
                
            }
        });

    }
}