//get database reference object
var db_ref = require("../../db_config.js");

module.exports = {
    
    execute : function(request, response) {
    
        var url = process.env.MONGODB_URI;
        var identifier = request.params.actor_name.toLowerCase();
        
        console.log(identifier);

        db_ref.get_db_object().connect(url, function(err, db) {
            if(err){ console.log(err); }
            else{
                var field_name = "stage_name";
                //code to create a qry string that matches NEAR to query string
                /*var end = "{ \"$regex\": \"" + identifier + "\", \"$options\": \"i\" }";
                var qry = "{ \"" + field_name + "\" : " + end + " }";
                
                console.log(qry);*/
                
                db.collection(db_ref.get_current_actor_table()).aggregate([{ $match: { stage_name_lower : identifier} },
                                                            { $unwind :  { "path" : "$associated_actors", "preserveNullAndEmptyArrays": true  }},
                                                            { $lookup : { 
                                                                from: db_ref.get_current_actor_table(),
                                                                localField: "associated_actors",
                                                                foreignField: "_id",
                                                                as: "associated_actors" }}, 
                                                            { $group : { 
                                                                _id: "$_id", 
                                                                stage_name: { "$max": "$stage_name" },
                                                                stage_name_lower: { "$max": "$stage_name_lower" },
                                                                birth_name: { "$max": "$birth_name" },
                                                                nicknames: { "$max": "$nicknames" },
                                                                d_o_b: { "$max": "$d_o_b" },
                                                                occupations: { "$max": "$occupations" },
                                                                origin: { "$max": "$origin" },
                                                                achievements: { "$max": "$achievements" },
                                                                bio: { "$max": "$bio" },
                                                                data_sources: { "$max": "$data_sources" },
                                                                associated_actors: { "$addToSet": "$target_objects" },
                                                                links: { "$max": "$links" },
                                                                date_added: { "$max": "$date_added" },
                                                                img_title: { "$max": "$img_title"} }}
                                                           ]).toArray(function(queryErr, docs) {
                if(queryErr){ console.log(queryErr); }
                else{
                    response.send( { actors : docs } );
                }
                });            
            }
        });
    }
}
