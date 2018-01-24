//controller dependencies
var db_ref = require("../db_config.js");
var BSON = require("bson");

module.exports = {
    
    findCommentsFromEvent: function(request, response){
        var event_id = request.params.event_id;
        
        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{
                var event_id_object = BSON.ObjectID.createFromHexString(event_id);

                //standard query to match an event and resolve aggressor and targets references
                db.collection(db_ref.get_comments_table()).aggregate([{ $match: { event_id: event_id_object } },
                                                                     { $lookup : { 
                                                                        from: db_ref.get_user_details_table(),
                                                                        localField: "user",
                                                                        foreignField: "_id",
                                                                        as: "user" }}, 
                                                                     ]).toArray(function(err, docs) {
                    //handle error
                    if(err) { console.log(err);}
                    else{
                        response.send({ comments: docs });
                    }
                });
            }
        });
    },
    
    createComment: function(request, response){
        
        var comment_data = request.body;
        
        var comment_record = {
            text: comment_data.text,
            user: comment_data.user_id,
            event_id: comment_data.event_id ? comment_data.event_id : null,
            actor_id: comment_data.actor_id ? comment_data.actor_id : null,
            date_added: new Date(),
            likes: 0
        };
        
        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{
                //standard query to match an event and resolve aggressor and targets references
                db.collection(db_ref.get_comments_table()).insert(comment_record, function(err, docs) {
                    //handle error
                    if(err) { console.log(err);}
                    else{
                        response.send({ success: true, message: "Record Inserted."});
                    }
                });
            }
        });
    },
    
    findCommentsFromActor: function(request, response){
        var actor_id = request.params.actor_id;
        
        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{
                var actor_id_object = BSON.ObjectID.createFromHexString(actor_id);

                //standard query to match an event and resolve aggressor and targets references
                db.collection(db_ref.get_comments_table()).aggregate([{ $match: { actor_id: actor_id_object } },
                                                                     { $lookup : { 
                                                                        from: db_ref.get_user_details_table(),
                                                                        localField: "user",
                                                                        foreignField: "_id",
                                                                        as: "user" }}, 
                                                                     ]).toArray(function(err, docs) {
                    //handle error
                    if(err) { console.log(err);}
                    else{
                        response.send({ comments: docs });
                    }
                });
            }
        });
    },
    
    deleteComment: function(request, response){
        
        var comment_id = request.params.comment_id;
        
        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{
                var comment_id_object = BSON.ObjectID.createFromHexString(comment_id);

                //standard query to match an event and resolve aggressor and targets references
                db.collection(db_ref.get_comments_table()).remove({ comment_id: comment_id_object }, function(err, docs) {
                    //handle error
                    if(err) { console.log(err);}
                    else{
                        response.send({ success: true });
                    }
                });
            }
        });
    }
}