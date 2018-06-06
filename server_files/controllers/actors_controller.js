//external dependencies
var loop = require("async-looper");
var BSON = require('bson');

//internal dependencies
var db_ref = require("../config/db_config.js");
var storage_ref = require("../config/storage_config.js");
var storage_interface = require('../interfaces/storage_interface.js');
var db_interface = require('../interfaces/db_insert_interface.js');
var format_embeddable_items = require('../tools/formatting.js').format_embeddable_items;

//objects
var Actor = require('../schemas/actor_schema');

var test_mode = false;
var actor_intermediate_projection = {
    $project: {
        _id: 1, 
        name: 1,
        date_of_origin: 1,
        place_of_origin: 1,
        description: 1,
        data_sources: 1,
        also_known_as: 1,
        classification: 1,
        variable_field_values: 1,
        links: 1,
        gallery_items: 1,
        img_title_thumbnail: 1,
        img_title_fullsize: 1,
        rating: 1,
        date_added: 1,
        name_lower: 1,
        also_known_as_lower: 1,
        related_actors: { $setUnion: [ "$related_actors_aggressors", "$related_actors_targets" ] },
        related_events: 1
    }
}
var actor_projection = {
    $project: {
        _id: 1, 
        name: 1,
        date_of_origin: 1,
        place_of_origin: 1,
        description: 1,
        data_sources: 1,
        also_known_as: 1,
        classification: 1,
        variable_field_values: 1,
        links: 1,
        gallery_items: 1,
        img_title_thumbnail: 1,
        img_title_fullsize: 1,
        rating: 1,
        date_added: 1,
        name_lower: 1,
        also_known_as_lower: 1,
        related_actors: 1,
        related_events: 1
    }
}

module.exports = {    
    
    format_actor_data: function(submission_data){
    
        //format data for db insertion
        var date_of_origin = submission_data.date_of_origin.split('/');
        var also_known_as_lower = [];

        for(var i = 0; i < submission_data.also_known_as.length; i++){
            also_known_as_lower[i] = submission_data.also_known_as[i].toLowerCase();
        }
        
        //format object for insertion into pending db
        var actor_insert = new Actor({
            name: submission_data.name,
            date_of_origin: new Date(submission_data.date_of_origin),
            place_of_origin: submission_data.place_of_origin,
            description: submission_data.description,
            associated_actors: [],
            data_sources: submission_data.data_sources,
            also_known_as: submission_data.also_known_as,
            classification: submission_data.classification,
            variable_field_values: submission_data.variable_field_values,
            links: submission_data.links,
            gallery_items: submission_data.gallery_items,
            img_title_thumbnail: "",
            img_title_fullsize: "",
            rating: 0,
            date_added: new Date(),
            name_lower: submission_data.name.toLowerCase(),
            also_known_as_lower: also_known_as_lower,
            record_origin: submission_data.record_origin
        });

        return actor_insert;
    },
    
    findActors: function(query_parameters, callback){
        
        //var query_parameters = request.query;
        var match_query = {};
        var sort_query_content = {};
        var query_present = Object.keys(query_parameters).length === 0 && query_parameters.constructor === Object ? false : true; //check if request comes with query
        var limit_query_content = 0; //max amount of records to return
                
        if(query_present){
            
            //deal with $sort queries
            var sort_field_name;
            
            if(query_parameters.increasing_order == "date_added"){ sort_field_name = "date_added"; }
            else if(query_parameters.decreasing_order == "date_added"){ sort_field_name = "date_added"; }
            else if(query_parameters.increasing_order == "popularity"){ sort_field_name = "popularity"; }
            else if(query_parameters.decreasing_order == "popularity"){ sort_field_name = "popularity"; }
            else if(query_parameters.increasing_order == "name"){ sort_field_name = "name"; }
            else if(query_parameters.decreasing_order == "name"){ sort_field_name = "name"; }
            else{ query_present = false; }// if no valid queries provided, disallow a sort query

            if(query_parameters.increasing_order){
                sort_query_content[sort_field_name] = 1;
            }
            else if(query_parameters.decreasing_order){
                sort_query_content[sort_field_name] = -1;
            }
            
            //deal with $match query
            if(query_parameters.match_name){ match_query = { name: { $regex : query_parameters.match_name, $options: "i" } } }
            if(query_parameters.match_multi_names){ match_query = { $or : [{ name : query_parameters.match_multi_names }, { name_lower : query_parameters.match_multi_names }, { also_known_as : query_parameters.match_multi_names }, { also_known_as_lower : query_parameters.match_multi_names }] } }
            
            //deal with $limit query
            if(query_parameters.limit){ limit_query_content = typeof query_parameters.limit == "string" ? parseInt(query_parameters.limit) : query_parameters.limit }
        }

        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{

                var aggregate_array = [
                    { $match: match_query },
                    { $lookup : { 
                        from: db_ref.get_current_event_table(),
                        localField: "_id",
                        foreignField: "aggressors",
                        as: "related_events" }}, 
                    { $group : { 
                        _id: "$_id", 
                        name: { "$max": "$name" },
                        date_of_origin: { "$max": "$date_of_origin" },
                        place_of_origin: { "$max": "$place_of_origin" },
                        description: { "$max": "$description" },
                        associated_actors: { "$max": "$associated_actors" },
                        data_sources: { "$max": "$data_sources" },
                        also_known_as: { "$max": "$also_known_as" },
                        img_title_fullsize: { "$max": "$img_title_fullsize"},
                        classification: { "$max": "$classification" },
                        variable_field_values: { "$max": "$variable_field_values" },
                        links: { "$max": "$links" },
                        date_added: { "$max": "$date_added" },
                        name_lower: { "$max": "$name_lower" },
                        also_known_as_lower: { "$max": "$also_known_as_lower" }
                    }}
                ];

                if(limit_query_content != 0){
                    aggregate_array.splice(1, 0, { $limit: limit_query_content });
                }
                
                if(Object.keys(sort_query_content).length > 0){
                    aggregate_array.push({ $sort: sort_query_content });
                }
                
                console.log(aggregate_array);
                console.log(match_query);
                
                db.collection(db_ref.get_current_actor_table()).aggregate(aggregate_array).toArray(function(queryErr, docs) {
                    if(queryErr){ console.log(queryErr); }
                    else{
                        if(docs){
                            callback( docs );
                        }
                        else{
                            callback({ failed: true, message: "Actors not found." });
                        }
                    }
                });            
            }
        });
    },
    
    findActor: function(actor_id, callback){
        
        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{
                
                var actor_id_object = BSON.ObjectID.createFromHexString(actor_id);
                console.log(actor_id);
                console.log(actor_id_object);
                
                db.collection(db_ref.get_current_actor_table()).aggregate([
                    { $match: { _id: actor_id_object } },
                    { $lookup : { 
                        from: db_ref.get_current_event_table(),
                        localField: "_id",
                        foreignField: "aggressors",
                        as: "related_events" }},
                    { $unwind: {
                        "path": "$related_events",
                        "preserveNullAndEmptyArrays": true
                    } },
                    { $unwind: {
                        "path": "$related_events.aggressors",
                        "preserveNullAndEmptyArrays": true
                    } },
                    { $unwind: {
                        "path": "$related_events.targets" ,
                        "preserveNullAndEmptyArrays": true
                    } },
                    { $group: {
                        _id: "$_id", 
                        name: { $first: "$name"},
                        date_of_origin: { $addToSet: "$date_of_origin" },
                        place_of_origin: { $addToSet: "$place_of_origin"},
                        description: { $first: "$description"},
                        data_sources: { $first: "$data_sources"},
                        also_known_as: { $first: "$also_known_as"},
                        classification: { $first: "$classification"},
                        variable_field_values: { $first: "$variable_field_values"},
                        links: { $first: "$links"},
                        gallery_items: { $first: "$gallery_items"},
                        img_title_thumbnail: { $first: "$img_title_thumbnail"},
                        img_title_fullsize: { $first: "$img_title_fullsize"},
                        rating: { $first: "$rating"},
                        date_added: { $addToSet: "$date_added"},
                        name_lower: { $first: "$name_lower"},
                        also_known_as_lower: { $first: "$also_known_as_lower"},
                        related_actors_aggressors: { $addToSet: "$related_events.aggressors" },
                        related_actors_targets: { $addToSet: "$related_events.targets" },
                        related_events: { $first: "$img_title_thumbnail"}
                    }},
                    actor_intermediate_projection,
                    { $lookup: {
                        from: db_ref.get_current_actor_table(),
                        localField: "related_actors",
                        foreignField: "_id",
                        as: "related_actors"
                    }},
                    actor_projection
                ]).toArray(function(queryErr, docs) {
                    if(queryErr){ console.log(queryErr); }
                    else{
                        
                        console.log(docs);
                        if(docs[0]){
                            callback( docs[0] );
                        }
                        else{
                            callback({ failed: true, message: "Actor not found." });
                        }
                    }
                });            
            }
        });
    },
    
    createActor: function(submission_data, files, callback){
                
        var record_origin = submission_data.record_origin;
        var actor_insert = module.exports.format_actor_data(submission_data);
        
        if(test_mode){
            console.log("test mode is on.");
            console.log(actor_insert);
        }
        else{        
            //find gallery items that need their embedding links generated
            actor_insert.gallery_items = format_embeddable_items(actor_insert.gallery_items, files);
            try{
                storage_interface.async_loop_upload_items(actor_insert.gallery_items, "actors", files, function(items){

                    actor_insert.gallery_items = items;

                    //function to remove file extension
                    var strip_file_ext = function(string){
                        var split_string = string.split(".");

                        if(split_string.length > 1){
                            var ext = split_string.pop();
                            string = string.replace(ext, "");
                        }

                        return string;
                    }                
                
                    //remove file objects to avoid adding file buffer to the db
                    for(var i = 0; i < actor_insert.gallery_items.length; i++){
                        
                        //remove file extension from all image gallery items
                        if(actor_insert.gallery_items[i].media_type == "image"){ //set file to null to avoid storing file buffer in db
                            actor_insert.gallery_items[i].link = strip_file_ext(actor_insert.gallery_items[i].link);
                            actor_insert.gallery_items[i].file_name = strip_file_ext(actor_insert.gallery_items[i].file_name);
                        }
                    
                        if(actor_insert.gallery_items[i].file){
                            actor_insert.gallery_items[i].file = null;
                        }

                        if(actor_insert.gallery_items[i].main_graphic){
                            actor_insert.img_title_fullsize = actor_insert.gallery_items[i].link; //save fullsize main graphic ref
                            //actor_insert.img_title_thumbnail = actor_insert.gallery_items[i].thumbnail_img_title; //save thumbnail main graphic ref
                        }
                    }

                    var db_options = {
                        send_email_notification: true,
                        email_notification_text: "Beef",
                        add_to_scraped_confirmed_table: record_origin == "scraped" ? true : false
                    };

                    try{
                        db_interface.insert_record_into_db(actor_insert, db_ref.get_current_actor_table(), db_options, function(id){
                            actor_insert._id = id;
                            callback(actor_insert);
                        });
                    }
                    catch(err){
                        callback({ failed: true, message: "Problem with database."});
                    }
                });
            }
            catch(err){
                callback({ failed: true, message: "Problem with file server."});
            }
        }
    },
    
    updateActor: function(event_data, event_files, callback){
             
        var submission_data = event_data; //get form data
        var files = event_files;
        var existing_object_id = request.params.actor_id;
        var existing_actor_id_object = BSON.ObjectID.createFromHexString(existing_object_id);        
        var actor_insert = module.exports.format_actor_data(submission_data);

        if(test_mode){
            console.log("test mode is on.");
            console.log(actor_insert);
        }
        else{
            
            //find gallery items that need their embedding links generated
            actor_insert.gallery_items = format_embeddable_items(actor_insert.gallery_items, files);
            
            storage_interface.async_loop_upload_items(actor_insert.gallery_items, "actors", files, function(items){
                
                actor_insert.gallery_items = items;
                
                //remove file objects to avoid adding file buffer to the db
                for(var i = 0; i < actor_insert.gallery_items.length; i++){
                    if(actor_insert.gallery_items[i].file){
                        actor_insert.gallery_items[i].file = null;
                    }
                    
                    if(actor_insert.gallery_items[i].main_graphic){
                        actor_insert.img_title_fullsize = actor_insert.gallery_items[i].link; //save fullsize main graphic ref
                        actor_insert.img_title_thumbnail = actor_insert.gallery_items[i].thumbnail_img_title; //save thumbnail main graphic ref
                        
                    }
                }
                
                var db_options = {
                    send_email_notification: true,
                    email_notification_text: "Beef",
                    add_to_scraped_confirmed_table: request.body.data.record_origin == "scraped" ? true : false
                };
                
                db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
                    if(err){ console.log(err); }
                    else{
                
                        //get the pre-update actor object to sort gallery items
                        db.collection(db_ref.get_current_actor_table()).find({ _id: existing_actor_id_object } ).toArray(function(queryErr, original_actor) {
                            
                            original_actor = original_actor[0];

                            try{
                                //call to update the db record
                                db_interface.update_record_in_db(actor_insert, db_ref.get_current_actor_table(), db_options, existing_object_id, function(document){

                                    var gallery_items_to_remove = [];

                                    //if new thumbnail doesnt match the existing one the new image will have been uploaded so remove the old file
                                    if(document.img_title_thumbnail != original_actor.img_title_thumbnail){
                                        gallery_items_to_remove.push({link: original_actor.img_title_thumbnail, media_type: "image"});
                                    }

                                    //if new gallery_item doesnt match the existing one the new image will have been uploaded so remove the old file
                                    for(var i = 0; i < original_actor.gallery_items.length; i++){
                                        var gallery_item_found = false;
                                        for(var j = 0; j < document.gallery_items.length; j++){
                                            if(original_actor.gallery_items[i].link == document.gallery_items[j].link){
                                                gallery_item_found = true;
                                            }
                                        }
                                        if(!gallery_item_found){
                                            gallery_items_to_remove.push(original_actor.gallery_items[i]);
                                        }
                                    }

                                    if(gallery_items_to_remove.length > 0){
                                        //remove all old gallery_items
                                        storage_interface.async_loop_remove_items(gallery_items_to_remove, "actors", function(items){
                                            console.log("finish")
                                        });
                                    }
                                    callback(existing_object_id);
                                });
                            }
                            catch(err){
                                callback({ failed: true, message: "Problem with database."});
                            }
                        });
                    }
                });
            });
        }
    },
    
    deleteActor: function(request, response, callback){
        //extract data
        var actor_id = request.params.actor_id;

        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{
                var actor_id_object = BSON.ObjectID.createFromHexString(actor_id);
                
                try{
                    db.collection(db_ref.get_current_actor_table()).findOne({ _id: actor_id_object }, function(queryErr, actor_obj) {
                        if(queryErr){ console.log(queryErr); }
                        else{
                            if(actor_obj){

                                //add thumbnail image to list
                                actor_obj.gallery_items.push({link: actor_obj.img_title_thumbnail, media_type: "image"});

                                try{
                                    storage_interface.async_loop_remove_items(actor_obj.gallery_items, "actors", function(){

                                        db.collection(db_ref.get_current_actor_table()).deleteOne({ _id: actor_id_object }, function(queryErr, docs) {
                                            if(queryErr){ console.log(queryErr); }
                                            else{
                                                callback({});
                                            }
                                        });
                                    });
                                }
                                catch(err){
                                    callback({ failed: true, message: "Problem with database."});
                                }
                            }
                            else{
                                callback({ failed: true, message: "Actor not in database."});
                            }
                        }
                    });
                }
                catch(err){
                    callback({ failed: true, message: "Problem with database."});
                }
            }
        });
    },
    
    getVariableActorFieldsConfig: function(callback){

        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{
                
                try{
                    db.collection(db_ref.get_actor_variable_fields_config()).find({}).toArray(function(queryErr, docs) {
                        if(queryErr){ console.log(queryErr); }
                        else{
                            callback(docs);
                        }
                    });
                }
                catch(err){
                    callback({ failed: true, message: "Problem with database."})
                }
            }
        });
    },
    
}