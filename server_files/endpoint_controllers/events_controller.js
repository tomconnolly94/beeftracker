//controller dependencies
var db_ref = require("../db_config.js");
var storage_ref = require("../storage_config.js");
var storage_interface = require('../interfaces/storage_insert_interface.js');
var db_interface = require('../interfaces/db_insert_interface.js');
var loop = require("async-looper");
var BSON = require('bson');
var Event = require("../schemas/event_schema");

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
                    /*{ $group: {
                        _id : 1,
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
                    }}*/
                    { $project: {
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
                    }}
                ]).toArray(function(queryErr, docs) {
                    if(queryErr){ console.log(queryErr); }
                    else{
                        response.status(200).send( { actors : docs } );
                    }
                });            
            }
        });
    },
    
    createEvent: function(request, response){
        
        //extract data for use later
        var url = process.env.MONGODB_URI; //get db uri
        var submission_data = JSON.parse(request.body.data); //get form data
        var date = submission_data.date.split('/'); //split date by delimeter into "DD", "MM" and "YYYY"
        var aggressor_ids = []; //create array to store target_ids
        var target_ids = []; //create array to store target_ids
        var links_formatted = {}; //create object to store links
        var gallery_items_formatted = [];
        var files;
        var test_mode = false;
        
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
        
        var link_keys = Object.keys(submission_data.links);
        
        for(var i = 0; i < submission_data.links.length; i++){
        
        }
        
        var images = [];
        
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
        
        var event_insert = new Event({
            title: submission_data.title,
            aggressors: aggressor_ids,
            targets: target_ids,
            event_date: new Date(date[2],date[1]-1,date[0]+1),
            date_added: new Date(),
            description: submission_data.description,
            links: links_formatted,
            hit_count: 0,
            gallery_items: submission_data.gallery_items,
            selected_categories: submission_data.selected_categories,
            img_title_thumbnail: "",
            img_title_fullsize: "",
            rating: 0,
            data_sources: submission_data.data_sources,
            contributions: []
        });
        
        if(test_mode){
            console.log("test mode is on.");
            console.log(event_insert);
            
            response.status(200).send({message: "Test mode is on, the db was not updated, nothing was added to the file server."});
        }
        else{
                        
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
                console.log(event_insert);
                
                var db_options = {
                    send_email_notification: true,
                    email_notification_text: "Beef",
                    add_to_scraped_confirmed_table: submission_data.record_origin == "scraped" ? true : false
                };
                response.status(200).send();

                /*db_interface.insert_record_into_db(event_insertevent_insert, db_ref.get_current_event_table(), db_options, function(id){
                    response.send(id);
                });*/
            });
        }
    },
    
    findEvent: function(request, response){
        console.log("test completed 3.");
        console.log(request.params.id);
        response.send({test: "complete 3"});
    },
    
    updateEvent: function(request, response){
        console.log("test completed 3.");
        console.log(request.body);
        response.send({test: "complete 4"});
    },
    
    deleteEvent: function(request, response){
        console.log("test completed 3.");
        console.log(request.body);
        response.send({test: "complete 4"});
    }
}