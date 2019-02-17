////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Module: actors_controller
// Author: Tom Connolly
// Description: Controller to take responsibility for all CRUD operations on actor objects in the db
// Testing script: test/unit_testing/controller_tests/actors_controller.test.js
//
////////////////////////////////////////////////////////////////////////////////////////////////////

//TODO: 08/02/2018
//write test for delete function to ensure refactoring was a success
//write test for update function to ensure refactoring was a success

//external dependencies
var moment = require("moment");
var BSON = require('bson');

//internal dependencies
var db_ref = require("../config/db_config.js");
var storage_ref = require("../config/storage_config.js");
var storage_interface = require('../interfaces/storage_interface.js');
var db_interface = require('../interfaces/db_interface.js');
var format_embeddable_items = require('../tools/formatting.js').format_embeddable_items;

//objects
var Actor = require('../schemas/actor.schema');

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

var get_aggregate_array = function (match_query_content, additional_aggregate_stages) {
    var aggregate_array = [
        { 
            $match: match_query_content 
        },
        { 
            $lookup : {
                from: db_ref.get_current_event_table(),
                localField: "_id",
                foreignField: "aggressors",
                as: "related_events" 
            }
        }, 
        {
            $group: {
                _id: "$_id", 
                name: { $first: "$name"},
                date_of_origin: { $first: "$date_of_origin" },
                place_of_origin: { $first: "$place_of_origin"},
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
            }
        },
        actor_intermediate_projection,
        { 
            $lookup: {
                from: db_ref.get_current_actor_table(),
                localField: "related_actors",
                foreignField: "_id",
                as: "related_actors"
            }
        },
        actor_projection
    ];

    var initial_index = aggregate_array.length - 4;

    for (var i = initial_index; i - initial_index < additional_aggregate_stages.length; i++) {
        aggregate_array.splice(i, 0, additional_aggregate_stages[i - initial_index]);
    }
    return aggregate_array;
}

module.exports = {    
    
    format_actor_data: function(submission_data){
    
        //format data for db insertion
        var date_of_origin;

        var also_known_as_lower = [];

        for(var i = 0; i < submission_data.also_known_as.length; i++){
            also_known_as_lower[i] = submission_data.also_known_as[i].toLowerCase();
        }
        
        //format object for insertion into pending db
        var actor_insert = new Actor({
            name: submission_data.name,
            date_of_origin: submission_data.date_of_origin,
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

        if(submission_data._id){ actor_insert._id = submission_data._id; }

        return actor_insert;
    },
    
    findActors: function(query_parameters, callback){
        
        //var query_parameters = request.query;
        var match_query_content = {};
        var sort_query_content = {};
        var query_present = Object.keys(query_parameters).length === 0 && query_parameters.constructor === Object ? false : true; //check if request comes with query
        var limit_query_content = 0; //max amount of records to return
                
        if(query_present){
            
            //deal with $sort queries
            var sort_field_name;
            
            if(query_parameters.increasing_order == "date_added" || query_parameters.decreasing_order == "date_added"){ sort_field_name = "date_added"; }
            else if(query_parameters.increasing_order == "popularity" || query_parameters.decreasing_order == "popularity"){ sort_field_name = "popularity"; }
            else if(query_parameters.increasing_order == "name" || query_parameters.decreasing_order == "name"){ sort_field_name = "name"; }
            else{ query_present = false; }// if no valid queries provided, disallow a sort query

            if(query_parameters.increasing_order){
                sort_query_content[sort_field_name] = 1;
            }
            else if(query_parameters.decreasing_order){
                sort_query_content[sort_field_name] = -1;
            }
            
            //deal with $match query
            if(query_parameters.match_name){ match_query_content = { name: { $regex : query_parameters.match_name, $options: "i" } } }
            if(query_parameters.match_multi_names){ match_query_content = { $or : [{ name : query_parameters.match_multi_names }, { name_lower : query_parameters.match_multi_names }, { also_known_as : query_parameters.match_multi_names }, { also_known_as_lower : query_parameters.match_multi_names }] } }
            
            //deal with $limit query
            if(query_parameters.limit){ limit_query_content = typeof query_parameters.limit == "string" ? parseInt(query_parameters.limit) : query_parameters.limit }
        }

        var additional_aggregate_stages = [];

        if(Object.keys(sort_query_content).length > 0){
            additional_aggregate_stages.push({ $sort: sort_query_content });
        }

        if(limit_query_content != 0){
            additional_aggregate_stages.push({ $limit: limit_query_content });
        }

        var query_config = {
            table: db_ref.get_current_actor_table(),
            aggregate_array: get_aggregate_array(match_query_content, additional_aggregate_stages)
        }

        db_interface.get(query_config, function(results){
            if(results){
                callback( results );
            }
            else{
                callback({ failed: true, message: "Actors not found." });
            }
        },
        function(error_object){
            callback(error_object)
        });
    },
    
    findActor: function(actor_id, callback){
        
        var additional_aggregate_stages = [
            { 
                $unwind: {
                    "path": "$related_events",
                    "preserveNullAndEmptyArrays": true
                } 
            },
            { 
                $unwind: {
                    "path": "$related_events.aggressors",
                    "preserveNullAndEmptyArrays": true
                } 
            },
            { 
                $unwind: {
                    "path": "$related_events.targets" ,
                    "preserveNullAndEmptyArrays": true
                } 
            }
        ];

        var query_config = {
            table: db_ref.get_current_actor_table(),
            aggregate_array: get_aggregate_array({ _id: BSON.ObjectID.createFromHexString(actor_id) }, additional_aggregate_stages)
        }

        db_interface.get(query_config, function(results){
            if(results && results[0]){
                callback( results[0] );
            }
            else{
                callback({ failed: true, message: "Actor not found." });
            }
        },
        function(error_object){
            callback(error_object)
        });
    },
    
    createActor: function(submission_data, files, callback){
                
        var record_origin = submission_data.record_origin;
        var actor_insert = module.exports.format_actor_data(submission_data);
        
        if(test_mode){
            console.log("test mode is on.");
            console.log(actor_insert);
            
            callback(actor_insert);//{ failed: false, test_mode: true, message: "Test mode is on, the db was not updated, nothing was added to the file server.", actor: actor_insert });
        }
        else{        
            //find gallery items that need their embedding links generated
            actor_insert.gallery_items = format_embeddable_items(actor_insert.gallery_items, files);
            
            var upload_config = {
                record_type: storage_ref.get_actor_images_folder(),
                item_data: actor_insert.gallery_items,
                files: files
            }
            
            storage_interface.upload(upload_config, function(items){

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

                var options = {
                    send_email_notification: true,
                    email_notification_text: "Beef",
                    add_to_scraped_confirmed_table: record_origin == "scraped" ? true : false
                };
                
                var insert_config = {
                    table: db_ref.get_current_actor_table(),
                    record: actor_insert,
                    options: options
                };

                db_interface.insert(insert_config, function(result){
                    callback({
                        _id: result._id,
                        gallery_items: result.gallery_items
                    });
                },
                function(error_object){
                    callback(error_object)
                });
            });
        }
    },
    
    updateActor: function(actor_data, files, existing_object_id, callback){

        //ensures that _id is persistent past the update
        actor_data._id = BSON.ObjectID.createFromHexString(existing_object_id);

        if (test_mode) {
            console.log("test mode is on.");

            //remove file objects to avoid clogging up the console
            for (var i = 0; i < actor_data.gallery_items.length; i++) {
                if (actor_data.gallery_items[i].file) {
                    actor_data.gallery_items[i].file = null;
                }
            }

            callback({ failed: true, test_mode: true, message: "Test mode is on, the db was not updated, nothing was added to the file server.", event: actor_data });
        }
        else {
            //delete existing event with files
            module.exports.deleteActor(existing_object_id, function(result){
                if(!result.failed){
                    //insert new event with files
                    module.exports.createActor(actor_data, files, function(result){
                        callback(result);
                    });
                }
                else{
                    callback(result);
                }
            });
        }
    },
    
    deleteActor: function(actor_id, callback){

        var delete_config = {
            table: db_ref.get_current_actor_table(),
            delete_multiple_records: false,
            match_query: { _id: BSON.ObjectID.createFromHexString(actor_id) }
        }

        db_interface.delete(delete_config, function(actor){

            var remove_config = {
                items: actor.gallery_items.filter(gallery_item => gallery_item.media_type == "image"),
                record_type: storage_ref.get_actor_images_folder()
            }

            storage_interface.remove(remove_config, function(){
                callback({});
            },
            function(error_object){
                callback(error_object);
            });
        },
        function(error_object){
            callback(error_object);
        });
    },
    
    getVariableActorFieldsConfig: function(callback){

        var query_config = {
            table: db_ref.get_actor_variable_fields_config(),
            aggregate_array: [
                {
                    $match: {}
                }
            ]
        }

        db_interface.get(query_config, function(results){
            callback(results);
        },
        function(error_object){
            callback(error_object)
        });
    },
    
}