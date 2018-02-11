//model dependencies
var db_ref = require("../../db_config.js"); //get database reference object
//var ObjectID = require('mongodb').ObjectID;
var BSON = require('bson');

module.exports = {
    
    execute : function(request, response) {

        var url = process.env.MONGODB_URI;
        var identifier = request.params.event_id;

        db_ref.get_db_object().connect(url, function(err, db) {
            if(err){ console.log(err); }
            else{
                var object = BSON.ObjectID.createFromHexString(identifier);

                //standard query to match an event and resolve aggressor and targets references
                db.collection(db_ref.get_current_event_table()).aggregate([{ $match: { _id : object } }, //query 
                                                            { $unwind : "$targets" }, //allows the $lookup with each field in $targets
                                                            { $lookup : { 
                                                                from: db_ref.get_current_actor_table(), 
                                                                localField: "aggressor", 
                                                                foreignField: "_id", 
                                                                as: "aggressor_object" 
                                                            }}, //resolve the 'aggressor' field
                                                            { $lookup : { 
                                                                from: db_ref.get_current_actor_table(), 
                                                                localField: "targets", 
                                                                foreignField: "_id", 
                                                                as: "target_objects" 
                                                            }},
                                                            { $group: {
                                                                _id : "$_id",
                                                                title : { "$max" : "$title"},
                                                                aggressor_object : { "$max" : "$aggressor_object"},
                                                                aggressor : { "$max" : "$aggressor"},
                                                                description : { "$max" : "$description"},
                                                                date_added : { "$max" : "$date_added"},
                                                                event_date : { "$max" : "$event_date"},
                                                                highlights : { "$max" : "$highlights"},
                                                                data_sources : { "$max" : "$data_sources"},
                                                                links : { "$max" : "$links"},
                                                                targets : { "$addToSet": "$target_objects" },
                                                                img_title : { "$max" : "$img_title"},
                                                                special_feature : { "$max" : "$special_feature"}
                                                            }} //resolve each of the targets fields
                                                           ]).toArray(function(err, docs) {
                    //handle error
                    if(err) { console.log(err);}
                    else{    
                        db.collection(db_ref.get_current_event_table()).update({ _id: object },{$inc: {'hit_count': 0.5}}, { multi : true });
                        response.send({eventObject : docs[0]});
                    }
                });
            }
        });
    }
}