//controller dependencies
var db_ref = require("../db_config.js");

module.exports = {
    
    getEventCategories: function(request, response){
        
        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{

                //standard query to match an event and resolve aggressor and targets references
                db.collection(db_ref.get_event_categories_table()).find({}).toArray(function(err, docs) {
                    //handle error
                    if(err) { console.log(err);}
                    else{
                        response.send({ categories: docs });
                    }
                });
            }
        });
    },
    
    createEventCategory: function(request, response){
        
        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{
 
                db.collection(db_ref.get_event_categories_table()).find({}).count(function(err, count) {
                    //handle error
                    if(err) { console.log(err);}
                    else{
                        
                        var new_category_record = {
                            cat_id: count,
                            name: request.body.name
                        };
                        
                        db.collection(db_ref.get_event_categories_table()).insert(new_category_record, function(err, count) {
                            //handle error
                            if(err) { console.log(err);}
                            else{
                                response.send({ success: true, message: "Category created." });
                            }
                        });
                    }
                });
            }
        });
    }
}