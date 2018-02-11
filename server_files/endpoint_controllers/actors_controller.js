//external dependencies

//internal dependencies
var db_ref = require("../config/db_config.js");
var storage_ref = require("../config/storage_config.js");
var storage_interface = require('../interfaces/storage_insert_interface.js');
var db_interface = require('../interfaces/db_insert_interface.js');
var handle_gallery_items = require('./shared_endpoint_controller_functions/record_formatting.js').handle_gallery_items;

//objects
var Actor = require('../schemas/actor_schema');


var test_mode = false;

var format_actor_data = function(submission_data){
    
    //format data for db insertion
    var date_of_origin = submission_data.date_of_origin.split('/');
    var also_known_as_lower = [];

    for(var i = 0; i < submission_data.also_known_as.length; i++){
        also_known_as_lower[i] = submission_data.also_known_as[i].toLowerCase();
    }


    //format object for insertion into pending db
    var actor_insert = new Actor({        
        name: submission_data.name,
        date_of_origin: new Date(date_of_origin[2], date_of_origin[1]-1, date_of_origin[0]),
        place_of_origin: submission_data.place_of_origin,
        description: submission_data.description,
        associated_actors: submission_data.associated_actors,
        data_sources: submission_data.data_sources,
        also_known_as: submission_data.also_known_as,
        img_title: submission_data.img_title,
        classification: submission_data.classification,
        variable_field_values: submission_data.variable_field_values,
        links: submission_data.links,
        date_added: new Date(),
        name_lower: submission_data.name.toLowerCase(),
        also_known_as_lower: also_known_as_lower
    });
    
    return actor_insert;
}

module.exports = {    
    
    findActors: function(request, response){
        
        var query_parameters = request.query;
        var match_query = {};
        var sort_query_content = {};
        var query_present = Object.keys(query_parameters).length === 0 && query_parameters.constructor === Object ? false : true; //check if request comes with query
        var limit_query_content = 30; //max amount of records to return
                
        if(query_present){
            
            //deal with $sort queries
            var sort_field_name;
            
            if(query_parameters.increasing_order == "date_added"){ sort_field_name = "date_added"; }
            else if(query_parameters.decreasing_order == "date_added"){ sort_field_name = "date_added"; }
            else if(query_parameters.increasing_order == "popularity"){ sort_field_name = "popularity"; }
            else if(query_parameters.decreasing_order == "popularity"){ sort_field_name = "popularity"; }
            else{ query_present = false; }// if no valid queries provided, disallow a sort query

            if(query_parameters.increasing_order){
                sort_query_content[sort_field_name] = 1;
            }
            else if(query_parameters.decreasing_order){
                sort_query_content[sort_field_name] = -1;
            }
            
            //deal with $match query
            if(query_parameters.match_name){ match_query = { name: { $regex : query_parameters.match_name, $options: "i" } } }
            
            //deal with $limit query
            if(query_parameters.limit){ limit_query_content = query_parameters.limit }
            
        }

        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{

                var aggregate_array = [
                    { $match: match_query },
                    { $unwind :  { "path" : "$associated_actors", "preserveNullAndEmptyArrays": true  }},
                    { $lookup : { 
                        from: db_ref.get_current_actor_table(),
                        localField: "associated_actors",
                        foreignField: "_id",
                        as: "associated_actors" }}, 
                    { $group : { 
                        _id: "$_id", 
                        name: { "$max": "$name" },
                        date_of_origin: { "$max": "$date_of_origin" },
                        place_of_origin: { "$max": "$place_of_origin" },
                        description: { "$max": "$description" },
                        associated_actors: { "$max": "$associated_actors" },
                        data_sources: { "$max": "$data_sources" },
                        also_known_as: { "$max": "$also_known_as" },
                        img_title: { "$max": "$img_title"},
                        classification: { "$max": "$classification" },
                        variable_field_values: { "$max": "$variable_field_values" },
                        links: { "$max": "$links" },
                        date_added: { "$max": "$date_added" },
                        name_lower: { "$max": "$name_lower" },
                        also_known_as_lower: { "$max": "$also_known_as_lower" }
                    }}
                ];

                if(Object.keys(sort_query_content).length > 0){
                    aggregate_array.$sort = sort_query_content;
                }

                if(Object.keys(limit_query_content).length > 0){
                    aggregate_array.$limit = limit_query_content;
                }

                db.collection(db_ref.get_current_actor_table()).aggregate(aggregate_array).toArray(function(queryErr, docs) {
                    if(queryErr){ console.log(queryErr); }
                    else{
                        response.status(200).send( docs );
                    }
                });            
            }
        });
    },
    
    findActor: function(request, response){
        
        //extract data
        var actor_id = request.params.actor_id;

        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{
                
                var actor_id_object = BSON.ObjectID.createFromHexString(actor_id);
                
                db.collection(db_ref.get_current_actor_table()).aggregate([{ $match: { _id: actor_id_object } },
                                                            { $unwind :  { "path" : "$associated_actors", "preserveNullAndEmptyArrays": true  }},
                                                            { $lookup : { 
                                                                from: db_ref.get_current_actor_table(),
                                                                localField: "associated_actors",
                                                                foreignField: "_id",
                                                                as: "associated_actors" }}, 
                                                            { $group : { 
                                                               
                                                                _id: "$_id", 
                                                                name: { "$max": "$name" },
                                                                date_of_origin: { "$max": "$date_of_origin" },
                                                                place_of_origin: { "$max": "$place_of_origin" },
                                                                description: { "$max": "$description" },
                                                                associated_actors: { "$max": "$associated_actors" },
                                                                data_sources: { "$max": "$data_sources" },
                                                                also_known_as: { "$max": "$also_known_as" },
                                                                img_title: { "$max": "$img_title"},
                                                                classification: { "$max": "$classification" },
                                                                variable_field_values: { "$max": "$variable_field_values" },
                                                                links: { "$max": "$links" },
                                                                date_added: { "$max": "$date_added" },
                                                                name_lower: { "$max": "$name_lower" },
                                                                also_known_as_lower: { "$max": "$also_known_as_lower" }
                                                            }}
                                                           ]).toArray(function(queryErr, docs) {
                if(queryErr){ console.log(queryErr); }
                else{
                    console.log("search completed");
                    if(docs && docs.length > 0){
                        response.status(200).send( docs[0] );
                    }
                    else{
                        response.status(404).send( { message: "Actor not found."} );
                    }
                }
                });            
            }
        });
    },
    
    createActor: function(request, response){
        
        var submission_data = JSON.parse(request.body.data); //get form data
        var files;

        if(request.files){
            files = request.files; //get submitted image
        }
        
        var actor_insert = format_actor_data(submission_data);

        if(test_mode){
            console.log("test mode is on.");
            console.log(actor_insert);
        }
        else{
                        
            handle_gallery_items(actor_insert.gallery_items, "actors", files, function(){
                
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
                console.log(actor_insert);
                
                var db_options = {
                    send_email_notification: true,
                    email_notification_text: "Beef",
                    add_to_scraped_confirmed_table: request.body.data.record_origin == "scraped" ? true : false
                };

                db_interface.insert_record_into_db(actor_insert, db_ref.get_current_event_table(), db_options, function(id){
                    response.status(201).send(id);
                });
            });
        }
    },
    
    updateActor: function(request, response){
        
        //extract data for use later
        var db_url = process.env.MONGODB_URI; //get db uri
        var file;
        var test_mode = false;
        var existing_object_id = request.params.actor_id;
        console.log(existing_object_id);
        
        if(request.file){
            file = request.file; //get submitted image
        }
        
        if(typeof request.body =='object'){
            // It is JSON
            submission_data = request.body;
        }
        else{
            submission_data = JSON.parse(request.body);
        }
        
        //format data for db insertion
        var date_of_origin = submission_data.date_of_origin.split('/');
        var also_known_as_lower = [];
        
        for(var i = 0; i < submission_data.also_known_as.length; i++){
            also_known_as_lower[i] = submission_data.also_known_as[i].toLowerCase();
        }
       
        
        //format object for insertion into pending db
        var actor_insert = new Actor({        
            name: submission_data.name,
            date_of_origin: new Date(date_of_origin[2], date_of_origin[1]-1, date_of_origin[0]),
            place_of_origin: submission_data.place_of_origin,
            description: submission_data.description,
            associated_actors: submission_data.associated_actors,
            data_sources: submission_data.data_sources,
            also_known_as: submission_data.also_known_as,
            //img_title: submission_data.img_title,
            classification: submission_data.classification,
            variable_field_values: submission_data.variable_field_values,
            links: submission_data.links,
            date_added: new Date(),
            name_lower: submission_data.name.toLowerCase(),
            also_known_as_lower: also_known_as_lower
        });

        console.log(actor_insert);

        if(test_mode){
            console.log("test mode is on.");
            console.log(actor_insert);
        }
        else{
            
            var db_options = {
                send_email_notification: true,
                email_notification_text: "Actor",
                add_to_scraped_confirmed_table: false,
                actor_id: submission_data.actor_id
            };
            
            var cloudinary_options = { 
                unique_filename: true, 
                folder: storage_ref.get_actor_images_folder()
            };

            db_interface.update_record_in_db(actor_insert, db_ref.get_current_actor_table(), db_options, existing_object_id, function(id){
                response.status(200).send(id);
            });
        }
    },
    
    deleteActor: function(request, response){
        //extract data
        var actor_id = request.params.actor_id;

        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{
                var actor_id_object = BSON.ObjectID.createFromHexString(actor_id);
                
                db.collection(db_ref.get_current_actor_table()).findOne({ _id: actor_id_object }, function(queryErr, actor_obj) {
                    if(queryErr){ console.log(queryErr); }
                    else{
                        if(actor_obj){
                            storage_interface.delete_image("actors", actor_obj.img_title, function(){

                                db.collection(db_ref.get_current_actor_table()).deleteOne({ _id: actor_id_object }, function(queryErr, docs) {
                                    if(queryErr){ console.log(queryErr); }
                                    else{
                                        response.status(200).send();
                                    }
                                });
                            });
                        }
                        else{
                            response.status(404).send( { message: "Actor not found." });
                        }
                    }
                });
            }
        });
    },
    
    getVariableFieldsConfig: function(request, response){

        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{
                
                db.collection(db_ref.get_actor_variable_fields_config()).find({}).toArray(function(queryErr, docs) {
                if(queryErr){ console.log(queryErr); }
                else{
                    response.status(200).send( docs );
                }
                });            
            }
        });
    }
}