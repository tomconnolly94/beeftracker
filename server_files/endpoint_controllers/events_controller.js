//controller dependencies
var db_ref = require("../db_config.js");
var storage_ref = require("../storage_config.js");
var storage_interface = require('../interfaces/storage_insert_interface.js');
var db_interface = require('../interfaces/db_insert_interface.js');
var loop = require("async-looper");
var BSON = require('bson');
var Event = require("../schemas/event_schema");
var EventContribution = require("../schemas/event_contribution_schema").model;

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
        "hit_count": 1,
        "gallery": 1,
        "thumbnail_img_title": 1,
        "rating": 1,
        "data_sources": 1
    }
}
var test_mode = false;

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
        hit_count: 0,
        gallery_items: submission_data.gallery_items,
        categories: submission_data.categories,
        img_title_thumbnail: "",
        img_title_fullsize: "",
        rating: 0,
        data_sources: submission_data.data_sources,
        contributions: [ initial_event_contribution ]
    });
    
    return event_insert;
}

module.exports = {
    
    findEvents: function(request, response){
        
        var query_parameters = request.query;
        var match_query = {};
        
        /*if(query_parameters.all_names){
            match_query.
        }
        else if(query_parameters.nickname){
            
        }*/
        
        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{
                //code to create a qry string that matches NEAR to query string
                /*var end = "{ \"$regex\": \"" + identifier + "\", \"$options\": \"i\" }";
                var qry = "{ \"" + field_name + "\" : " + end + " }";
                
                console.log(qry);*/
                
                db.collection(db_ref.get_current_event_table()).aggregate([
                    { $match: match_query },
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
                        response.status(200).send( { actors : docs } );
                    }
                });            
            }
        });
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
                    console.log("search completed");
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
        console.log(request.body.data)
        
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
                    
                    var check_end_or_next = function(){
                        //if last item, exit loop, else carry on to next iteration
                        if(event_insert.gallery_items[event_insert.gallery_items.length-1].link == item.link){
                            next(null, loop.END_LOOP);
                        }
                        else{
                            next();
                        }
                    }
                    
                    storage_interface.upload_image(requires_download, "events", file_name, file_buffer, false, function(img_dl_title){

                        console.log("upload callback");
                        item.link = img_dl_title;
                        
                        if(item.main_graphic){
                            storage_interface.upload_image(requires_download, "events", file_name, file_buffer, true, function(img_dl_title){
                                event_insert.thumbnail_img_title = img_dl_title;
                                check_end_or_next()
                            });
                        }
                        else{
                            check_end_or_next();
                        }
                    });
                }
            }, function(){
                
                console.log("done function");
                
                //remove file objects to avoid adding file buffer to the db
                for(var i = 0; i < event_insert.gallery_items.length; i++){                
                    if(event_insert.gallery_items[i].file){
                        event_insert.gallery_items[i].file = null;
                    }
                }
                
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
                    
                    var check_end_or_next = function(){
                        //if last item, exit loop, else carry on to next iteration
                        if(event_insert.gallery_items[event_insert.gallery_items.length-1].link == item.link){
                            next(null, loop.END_LOOP);
                        }
                        else{
                            next();
                        }
                    }
                    
                    storage_interface.upload_image(requires_download, "events", file_name, file_buffer, false, function(img_dl_title){

                        console.log("upload callback");
                        item.link = img_dl_title;
                        
                        if(item.main_graphic){
                            storage_interface.upload_image(requires_download, "events", file_name, file_buffer, true, function(img_dl_title){
                                event_insert.thumbnail_img_title = img_dl_title;
                                check_end_or_next()
                            });
                        }
                        else{
                            check_end_or_next();
                        }
                    });
                }
            }, function(){
                
                console.log("done function");
                
                //remove file objects to avoid adding file buffer to the db
                for(var i = 0; i < event_insert.gallery_items.length; i++){                
                    if(event_insert.gallery_items[i].file){
                        event_insert.gallery_items[i].file = null;
                    }
                }
                
                var db_options = {
                    send_email_notification: true,
                    email_notification_text: "Beef",
                    add_to_scraped_confirmed_table: submission_data.record_origin == "scraped" ? true : false
                };

                db_interface.update_record_into_db(event_insert, db_ref.get_current_event_table(), db_options, function(id){
                    response.status(200).send(id);
                });
            });
        }
    },
    
    deleteEvent: function(request, response){
        console.log("test completed 3.");
        console.log(request.body);
        response.send({test: "complete 4"});
    }
}