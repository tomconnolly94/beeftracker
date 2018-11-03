//external dependencies
var BSON = require('bson');

//internal dependencies
var db_ref = require("../config/db_config.js");
var db_interface = require("../config/db_interface.js");

function add_vote_to_user_record(db, event_id, user_id){
    
    var user_id_object = BSON.ObjectID.createFromHexString(user_id);
                                                        
    //standard query to match an event and resolve aggressor and targets references
    db.collection(db_ref.get_user_details_table()).update({ _id: user_id_object }, { $push: { voted_on_beef_ids : event_id }}, function(err, docs) {
        //handle error
        if(err) { console.log(err);}
        else{
            console.log(docs);
        }
    });
}

//objects
module.exports = {
    
    addVoteToEvent: function(event_id, vote_direction, user_id, callback){
        
        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{
                var event_id_object = BSON.ObjectID.createFromHexString(event_id);
                
                var update_query = {};
                
                if(vote_direction == 1){
                    update_query = {
                        $inc: {
                            "votes.upvotes": 1
                        }
                    }
                }
                else if(vote_direction == 0){
                    update_query = {
                        $inc: {
                            "votes.downvotes": 1
                        }
                    }
                }
                else{
                    callback({ failed: true, message: "vote_direction is invalid."})
                }
                
                //standard query to match an event and resolve aggressor and targets references
                db.collection(db_ref.get_current_event_table()).update({ _id: event_id_object }, update_query, function(err, docs) {
                    //handle error
                    if(err) { console.log(err);}
                    else{
                        callback(docs);
                        if(user_id){
                            add_vote_to_user_record(db, event_id, user_id);
                        }
                    }
                });
            }
        });
    }
}