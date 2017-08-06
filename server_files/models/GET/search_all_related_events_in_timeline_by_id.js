//model dependencies
var db_ref = require("../../db_config.js"); //get database reference object
var async = require("async");
var BSON = require('bson');

module.exports = {
    
    execute : function(request, response) {
    
        var url = process.env.MONGODB_URI;
        var identifier = request.params.event_id;

        db_ref.get_db_object().connect(url, function(err, db) {
            if(err){ console.log(err); }
            else{

                async.waterfall([
                    function(callback){
                        var object = BSON.ObjectID.createFromHexString(identifier);

                        //standard query to match an event and resolve aggressor and targets references
                        db.collection(db_ref.get_current_event_table()).aggregate([{ $match: { _id : object } },
                                                                    { $lookup : { 
                                                                        from: db_ref.get_current_actor_table(),
                                                                        localField: "aggressor",
                                                                        foreignField: "_id",
                                                                        as: "aggressor_object" }},
                                                                    { $unwind : "$targets"},
                                                                    { $lookup : { 
                                                                        from: db_ref.get_current_actor_table(),
                                                                        localField: "targets",
                                                                        foreignField: "_id",
                                                                        as: "target_objects" }},
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
                                                                    }}
                                                                   ]).toArray(function(queryErr, main_event) {
                            if(queryErr){ console.log(queryErr); }
                            else{
                                callback(null,main_event[0]);
                            }
                        });

                    },
                    function(main_event, callback){ //gather all the targets' responses

                        var actors = new Array();
                        actors.push(main_event.aggressor_object[0]._id);

                        for(var i = 0; i < main_event.targets.length; i++){
                            actors.push(main_event.targets[i][0]._id);
                        }

                        var all_events = new Array();

                        //standard query to match an event and resolve aggressor and targets references
                        db.collection(db_ref.get_current_event_table()).aggregate([{ $match: { $or : [{ aggressor : { $in : actors }},{ targets : { $in : actors }} ]}},
                                                                    { $unwind : "$targets"}, 
                                                                    { $lookup : { 
                                                                        from: db_ref.get_current_actor_table(), 
                                                                        localField: "aggressor", 
                                                                        foreignField: "_id", 
                                                                        as: "aggressor_object" }}, 
                                                                    { $lookup : { 
                                                                        from: db_ref.get_current_actor_table(), 
                                                                        localField: "targets", 
                                                                        foreignField: "_id", 
                                                                        as: "target_objects" }},
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
                                                                    }}
                                                                   ]).toArray(function(queryErr, events) {
                            if(err){ console.log(queryErr); }
                            else{

                                var event_store = new Array();

                                async.each(events, function(event, callback) {

                                        if(event.aggressor.toString() == main_event.aggressor.toString()){
                                            all_events.push(event);
                                        }
                                        else{

                                            all_events.push(event);

                                            //loop through targets to check that one of them is orig_actor_name
                                           /* for(var sub_target_num = 0; sub_target_num < event.targets.length; sub_target_num++){

                                                var target = event.targets[sub_target_num][0];

                                                //should this event be included
                                                if(target._id.toString() === main_event.aggressor_object[0]._id.toString()){
                                                        all_events.push(event);
                                                }
                                            }*/
                                        }
                                });
                                response.send( { events : all_events } );
                            }
                        });
                    }
                ], function (error, all_events) {
                    if (error) { console.log(error); }
                    else{

                    }
                });
            }
        });
    }
}
