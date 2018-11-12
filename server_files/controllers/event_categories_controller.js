//external dependencies

//internal dependencies
var db_ref = require("../config/db_config.js");
var db_interface = require("../config/db_interface.js");

//objects
var EventCategory = require("../schemas/event_category_schema");

module.exports = {
    
    getEventCategories: function(callback){
        
        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{

                //standard query to match an event and resolve aggressor and targets references
                db.collection(db_ref.get_event_categories_table()).find({}).toArray(function(err, docs) {
                    //handle error
                    if(err) { console.log(err);}
                    else{
                        callback(docs);
                    }
                });
            }
        });
    },
    
    createEventCategory: function(event_category_data){
        
        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{
 
                db.collection(db_ref.get_event_categories_table()).find({}).count(function(err, count) {
                    //handle error
                    if(err) { console.log(err);}
                    else{
                        
                        var new_category_record = EventCategory({
                            cat_id: count,
                            name: request.body.name
                        });
                        
                        db.collection(db_ref.get_event_categories_table()).insert(new_category_record, function(err, count) {
                            //handle error
                            if(err) { console.log(err);}
                            else{
                                callback({ failed: false, message: "Category created." });
                            }
                        });
                    }
                });
            }
        });
    }
}