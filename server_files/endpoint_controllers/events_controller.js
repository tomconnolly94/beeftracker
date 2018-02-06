//controller dependencies
var db_ref = require("../db_config.js");
var storage_ref = require("../storage_config.js");
var storage_interface = require('../interfaces/storage_insert_interface.js');
var db_interface = require('../interfaces/db_insert_interface.js');
var loop = require("async-looper");
var BSON = require('bson');
var Event = require("../schemas/event_schema");
var EventContribution = require("../schemas/event_contribution_schema").model;

var test_mode = false;
var event_projection = {
    $project: {
        "title": 1,
        "aggressors": 1,
        "targets": 1,
        "event_date": 1,
        "date_added": 1,
        "description": 1,
        "links": 1,
        "categories": 1,
        "hit_counts": 1,
        "gallery": 1,
        "thumbnail_img_title": 1,
        "rating": 1,
        "data_sources": 1
    }
}

var format_event_data = function(request, response){
    
    var submission_data = JSON.parse(request.body.data); //get form data
    var date = submission_data.date.split('/'); //split date by delimeter into "DD", "MM" and "YYYY"
    var aggressor_ids = []; //create array to store target_ids
    var target_ids = []; //create array to store target_ids
    var gallery_items_formatted = [];
    var files;

    if(request.files){ //check if the user submitted a file via a file explorer
        files = request.files;
    }

    //format target_ids array
    for(var i = 0; i < submission_data.aggressors.length; i++){
        aggressor_ids.push(BSON.ObjectID.createFromHexString(submission_data.aggressors[i]));
    }

    //format target_ids array
    for(var i = 0; i < submission_data.targets.length; i++){
        target_ids.push(BSON.ObjectID.createFromHexString(submission_data.targets[i]));
    }

    for(var i = 0; i < submission_data.gallery_items.length; i++){

        var gallery_item = submission_data.gallery_items[i];

        /*
        gallery_item.media_type == "video_embed" || 
        gallery_item.media_type == "wikipedia_link" || 
        gallery_item.media_type == "website_link" || 
        gallery_item.media_type == "twitter_embed" || 
        gallery_item.media_type == "soundcloud_embed" 
            no pre-processing is needed
        */

        if(gallery_item.media_type == "image"){

            for(var j = 0; j < files.length; j++){
                if(gallery_item.link == files[j].originalname){
                    gallery_item.file = files[j];
                }
            }
        }            
        if(gallery_item.media_type =="instagram_embed"){
            gallery_item.link = gallery_item.link.split('?')[0];
        }
        else if(gallery_item.media_type == "youtube_embed"){

            if(gallery_item.link.indexOf("embed") == -1){
                var video_id = gallery_item.link.split('v=')[1];
                var ampersandPosition = video_id.indexOf('&');
                if(ampersandPosition != -1) {
                    video_id = video_id.substring(0, ampersandPosition);
                }
                submission_data.gallery_items[i].link = "https://www.youtube.com/embed/" + video_id;
            }
        }
        else if(gallery_item.media_type == "spotify_embed"){
            if(gallery_item.link.indexOf("spotify:track") > 0){
                var video_id = gallery_item.link.split("track:")[1];
                submission_data.gallery_items[i].link = "https://embed.spotify.com/?uri=spotify%3Atrack%3A" + video_id;
            }
            else if(gallery_item.link.indexOf("embed") == -1){

                var video_id = submission_data.gallery_items[i].link.split('track/')[1];
                submission_data.gallery_items[i].link = "https://embed.spotify.com/?uri=spotify%3Atrack%3A" + video_id;
            }
        }
    }

    //create initial contribution record
    var submission_data_keys = Object.keys(submission_data);
    var contribution_collection = [];

    for(var i = 0; i < submission_data_keys.length; i++){

        if(submission_data_keys[i] != "user_id" && submission_data_keys[i] !="record_origin"){
            var record = {
                field: submission_data_keys[i],
                addition: submission_data[submission_data_keys[i]],
                removal: ""
            }
            contribution_collection.push(record);
        }
    }

    var initial_event_contribution = EventContribution({
        user: BSON.ObjectID.createFromHexString(submission_data.user_id),
        date_of_submission: new Date(),
        date_of_approval: null,
        contribution_details: contribution_collection 
    });

    //format beef event record for insertion
    var event_insert = new Event({
        title: submission_data.title,
        aggressors: aggressor_ids,
        targets: target_ids,
        event_date: new Date(date[2],date[1]-1,date[0]+1),
        date_added: new Date(),
        description: submission_data.description,
        links: submission_data.links,
        hit_counts: {
            total: 0,
            last_day: 0,
            last_two_days: 0,
            last_week: 0
        },
        gallery_items: submission_data.gallery_items,
        categories: submission_data.categories,
        img_title_thumbnail: "",
        img_title_fullsize: "",
        rating: 0,
        data_sources: submission_data.data_sources,
        contributions: [ initial_event_contribution ],
        record_origin: submission_data.record_origin
    });
    
    return event_insert;
}

var check_end_or_next = function(event, item, next){
    //if last item, exit loop, else carry on to next iteration
    if(event.gallery_items[event.gallery_items.length-1].link == item.link){
        next(null, loop.END_LOOP);
    }
    else{
        next();
    }
}

module.exports = {
    
    findEvents: function(request, response){
        console.log(request.query);
        var query_parameters = request.query;
        var match_query_content = {};
        var sort_query_content = {};
        var query_present = Object.keys(query_parameters).length === 0 && query_parameters.constructor === Object ? false : true; //check if request comes with query
        
        if(query_present){
            
            var sort_field_name;
            
            if(query_parameters.increasing_order == "name"){ sort_field_name = "name"; }
            else if(query_parameters.increasing_order == "rating" || query_parameters.decreasing_order == "rating"){ sort_field_name = "rating"; }
            else if(query_parameters.increasing_order == "popularity" || query_parameters.decreasing_order == "popularity"){ sort_field_name = "hit_count"; }
            else if(query_parameters.increasing_order == "currently_trending" || query_parameters.increasing_order == "currently_trending"){ sort_field_name = "hit_counts.last_two_days"; }
            else{ query_present = false; }// if no valid queries provided, disallow a sort query

            if(query_parameters.increasing_order){
                sort_query_content[sort_field_name] = 1;
            }
            else if(query_parameters.decreasing_order){
                sort_query_content[sort_field_name] = -1;
            }
            
            if(query_parameters.match_title){ match_query_content = { name: { $regex : query_parameters.match_title, $options: "i" } } }
            else if(query_parameters.match_actor){ match_query_content = { name: { $regex : query_parameters.match_actor, $options: "i" } } }
            else if(query_parameters.match_category){ match_query_content = { name: { $regex : query_parameters.match_category, $options: "i" } } }
            
        }
        
        console.log(sort_query_content);
        console.log(match_query_content);
        
        if(false){
        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{
                //code to create a qry string that matches NEAR to query string
                /*var end = "{ \"$regex\": \"" + identifier + "\", \"$options\": \"i\" }";
                var qry = "{ \"" + field_name + "\" : " + end + " }";
                
                console.log(qry);*/
                
                var aggregate_array = [
                    { $match: match_query_content },
                    { $unwind : "$aggressors"},
                    { $lookup : {
                        from: db_ref.get_current_actor_table(),
                        localField: "aggressors",
                        foreignField: "_id",
                        as: "aggressors" 
                    }},
                    { $unwind : "$targets"},
                    { $lookup : { 
                        from: db_ref.get_current_actor_table(),
                        localField: "targets",
                        foreignField: "_id",
                        as: "targets" 
                    }}, 
                    event_projection
                ]
                
                db.collection(db_ref.get_current_event_table(aggregate_array)).aggregate().toArray(function(queryErr, docs) {
                    if(queryErr){ console.log(queryErr); }
                    else{
                        response.status(200).send( { actors : docs } );
                    }
                });            
            }
        });
        }
    },
    
    findEvent: function(request, response){
        
        //extract data
        var event_id = request.params.event_id;

        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{
                
                var event_id_object = BSON.ObjectID.createFromHexString(event_id);
                
                db.collection(db_ref.get_current_event_table()).aggregate([
                    { $match: { _id: event_id_object } },
                    { $unwind : "$aggressors"},
                    { $lookup : {
                        from: db_ref.get_current_actor_table(),
                        localField: "aggressors",
                        foreignField: "_id",
                        as: "aggressors" 
                    }},
                    { $unwind : "$targets"},
                    { $lookup : { 
                        from: db_ref.get_current_actor_table(),
                        localField: "targets",
                        foreignField: "_id",
                        as: "targets" 
                    }},
                    event_projection
                   ]).toArray(function(queryErr, docs) {
                if(queryErr){ console.log(queryErr); }
                else{
                    if(docs && docs.length > 0){
                        response.status(200).send( docs[0] );
                    }
                    else{
                        response.status(404).send( { message: "Event not found."} );
                    }
                }
                });            
            }
        });
    },
    
    createEvent: function(request, response){
        
        //extract data for use later
        var url = process.env.MONGODB_URI; //get db uri
        
        var event_insert = format_event_data(request, response);
        
        if(test_mode){
            console.log("test mode is on.");
            
            //remove file objects to avoid clogging up the console
            for(var i = 0; i < event_insert.gallery_items.length; i++){ 
                if(event_insert.gallery_items[i].file){
                    event_insert.gallery_items[i].file = null;
                }
            }
            
            console.log(event_insert);
            response.status(200).send({message: "Test mode is on, the db was not updated, nothing was added to the file server.", event: event_insert });
        }
        else{
            
            var thumbnail_img;
            
            //use an asynchronous loop to cycle through gallery items, if item is an image, save image to cloudinary and update gallery item link
            loop(event_insert.gallery_items, function(item, next){
                
                if(item.media_type == "image"){
                    
                    var file_name = item.link;
                    var file_buffer;
                    var requires_download = true;
                    
                    if(item.file){
                        file_name = item.file.originalname;
                        file_buffer = item.file.buffer;
                        requires_download = false;
                    }
                                        
                    storage_interface.upload_image(requires_download, "events", file_name, file_buffer, false, function(img_dl_title){

                        item.link = img_dl_title;
                        
                        if(item.main_graphic){
                            storage_interface.upload_image(requires_download, "events", file_name, file_buffer, true, function(img_dl_title){
                                thumbnail_img = img_dl_title;
                                check_end_or_next(event_insert, item, next);
                            });
                        }
                        else{
                            check_end_or_next(event_insert, item, next);
                        }
                    });
                }
            }, function(){
                
                event_insert.img_title_thumbnail = thumbnail_img;
                
                //remove file objects to avoid adding file buffer to the db
                for(var i = 0; i < event_insert.gallery_items.length; i++){
                    if(event_insert.gallery_items[i].file){
                        event_insert.gallery_items[i].file = null;
                    }
                    
                    if(event_insert.gallery_items[i].main_graphic){
                        event_insert.img_title_fullsize = event_insert.gallery_items[i].link;
                    }
                }
                console.log(event_insert);
                
                var db_options = {
                    send_email_notification: true,
                    email_notification_text: "Beef",
                    add_to_scraped_confirmed_table: request.body.data.record_origin == "scraped" ? true : false
                };

                db_interface.insert_record_into_db(event_insert, db_ref.get_current_event_table(), db_options, function(id){
                    response.status(201).send(id);
                });
            });
        }
    },
    
    updateEvent: function(request, response){
        
        //extract data for use later
        var url = process.env.MONGODB_URI; //get db uri
        var event_id = request.params.event_id;
        
        console.log(request.body);
        
        var event_insert = format_event_data(request, response);
        
        if(test_mode){
            console.log("test mode is on.");
            
            //remove file objects to avoid clogging up the console
            for(var i = 0; i < event_insert.gallery_items.length; i++){ 
                if(event_insert.gallery_items[i].file){
                    event_insert.gallery_items[i].file = null;
                }
            }
            
            console.log(event_insert);
            response.status(200).send({message: "Test mode is on, the db was not updated, nothing was added to the file server.", event: event_insert });
        }
        else{
            
            var thumbnail_img;
            
            //use an asynchronous loop to cycle through gallery items, if item is an image, save image to cloudinary and update gallery item link
            loop(event_insert.gallery_items, function(item, next){
                
                if(item.media_type == "image"){
                    
                    var file_name = item.link;
                    var file_buffer;
                    var requires_download = true;
                    
                    if(item.file){
                        file_name = item.file.originalname;
                        file_buffer = item.file.buffer;
                        requires_download = false;
                    }
                    
                    storage_interface.upload_image(requires_download, "events", file_name, file_buffer, false, function(img_dl_title){
                        
                        item.link = img_dl_title;
                        
                        if(item.main_graphic){
                            storage_interface.upload_image(requires_download, "events", file_name, file_buffer, true, function(img_dl_title){
                                event_insert.thumbnail_img_title = img_dl_title;
                                check_end_or_next(event_insert, item, next);
                            });
                        }
                        else{
                            check_end_or_next(event_insert, item, next);
                        }
                    });
                }
            }, function(){
                
                event_insert.img_title_thumbnail = thumbnail_img;
                                
                //remove file objects to avoid adding file buffer to the db
                for(var i = 0; i < event_insert.gallery_items.length; i++){                
                    if(event_insert.gallery_items[i].file){
                        event_insert.gallery_items[i].file = null;
                    }
                    
                    if(event_insert.gallery_items[i].main_graphic){
                        event_insert.img_title_fullsize = event_insert.gallery_items[i].link;
                    }
                }
                console.log(event_insert);
                
                var db_options = {
                    send_email_notification: true,
                    email_notification_text: "Beef",
                    add_to_scraped_confirmed_table: request.body.data.record_origin == "scraped" ? true : false
                };

                db_interface.update_record_in_db(event_insert, db_ref.get_current_event_table(), db_options, event_id, function(id){
                    response.status(200).send(id);
                });
            });
        }
    },
    
    deleteEvent: function(request, response){
        
        //extract data
        var event_id = request.params.event_id;

        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{
                var event_id_object = BSON.ObjectID.createFromHexString(event_id);
                
                db.collection(db_ref.get_current_event_table()).findOne({ _id: event_id_object }, function(queryErr, event_obj) {
                    if(queryErr){ console.log(queryErr); }
                    else{
                        if(event_obj){
                            
                            //add thumbnail image to list
                            event_obj.gallery_items.push({link: event_obj.img_title_thumbnail});
                
                            console.log(event_obj.gallery_items);
                            console.log(event_obj);
                            
                            loop(event_obj.gallery_items, function(item, next){

                                storage_interface.delete_image("events", item.link, function(img_dl_title){
                                    check_end_or_next(event_obj, item, next);
                                });
                            }, function(){
                                db.collection(db_ref.get_current_event_table()).deleteOne({ _id: event_id_object }, function(queryErr, docs) {
                                    if(queryErr){ console.log(queryErr); }
                                    else{
                                        response.status(200).send( docs[0] );
                                    }
                                });
                            });
                        }
                    }
                });
            }
        });
    }
}