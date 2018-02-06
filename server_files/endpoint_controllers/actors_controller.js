//controller dependencies
var db_ref = require("../db_config.js");
var storage_ref = require("../storage_config.js");
var storage_interface = require('../interfaces/storage_insert_interface.js');
var db_interface = require('../interfaces/db_insert_interface.js');
var Actor = require('../schemas/actor_schema');

module.exports = {
    
    findActors: function(request, response){
        
        var query_parameters = request.query;
        var match_query = {};
        var sort_query_content = {};
        var query_present = Object.keys(query_parameters).length === 0 && query_parameters.constructor === Object ? false : true; //check if request comes with query
        
        var response_function = function(queryErr, response, docs){
            if(queryErr){ console.log(queryErr); }
            else{
                response.status(200).send( docs );
            }
        };
        
        if(query_present){
            
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
            
            if(query_parameters.match_name){ match_query = { name: { $regex : query_parameters.match_name, $options: "i" } } }
            
        }
            
        if(sort_field_name){ //run this clause only if a sort query is present
            db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
                if(err){ console.log(err); }
                else{

                    db.collection(db_ref.get_current_actor_table()).aggregate([
                        { $match: match_query },
                        { $sort: sort_query_content },
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
                        response_function(queryErr, response, docs);
                    });            
                }
            });
        }
        else{
            db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
                if(err){ console.log(err); }
                else{
                    //code to create a qry string that matches NEAR to query string
                    /*var end = "{ \"$regex\": \"" + identifier + "\", \"$options\": \"i\" }";
                    var qry = "{ \"" + field_name + "\" : " + end + " }";

                    console.log(qry);*/
                    
                    db.collection(db_ref.get_current_actor_table()).aggregate([
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
                       ]).toArray(function(queryErr, docs) {
                        response_function(queryErr, response, docs);
                    });            
                }
            });
        }
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
        
        //extract data for use later
        var db_url = process.env.MONGODB_URI; //get db uri
        var file;
        var test_mode = false;
        
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
            img_title: submission_data.img_title,
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
                add_to_scraped_confirmed_table: false
            };
            
            var cloudinary_options = { 
                unique_filename: true, 
                folder: storage_ref.get_actor_images_folder()
            };
                                    
            if(file){
                storage_interface.upload_image(false, "actors", file.originalname, file.buffer, false, function(img_dl_title){
                    actor_insert.img_title = img_dl_title;
                    db_interface.insert_record_into_db(actor_insert, db_ref.get_current_actor_table(), db_options, function(id){
                        response.status(201).send(id);
                    });
                });
            }
            else{
                if(submission_data.img_title.length > 0){
                    storage_interface.upload_image(true, "actors", submission_data.img_title, null, false, function(img_dl_title){
                        actor_insert.img_title = img_dl_title;
                        db_interface.insert_record_into_db(actor_insert, db_ref.get_current_actor_table(), db_options, function(id){
                            response.status(201).send(id);
                        });
                    });            
                }
            }
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