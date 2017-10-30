//get database reference object
var db_ref = require("../../db_config.js");
var storage_ref = require("../../storage_config.js");
var BSON = require('bson');
var nodemailer = require('nodemailer');
var storage_interface = require('../../interfacing/storage_interface.js');
var db_interface = require('../../interfacing/db_interface.js');

//configure testing mode, if set: true, record will be collected, printed but not sent to db and no email notification will be sent.
var test_mode = false;

module.exports = {
    
    execute : function(request, response) {
        
        console.log("Insert Beef record procedure started.")

        //extract data for use later
        var url = process.env.MONGODB_URI; //get db uri
        var file;
        if(request.file){
            file = request.file; //get submitted image
        }
        
        var submission_data;

        if(typeof request.body.data =='object'){
            // It is JSON
            submission_data = request.body.data; //get form data
        }
        else{
            submission_data = JSON.parse(request.body.data);
        }
        
        //format data for db insertion
        var actor_object = BSON.ObjectID.createFromHexString(submission_data.aggressor);
        var date = submission_data.date.split('/');
        var targets_formatted = new Array();
        var highlights_formatted = {};
        var data_sources_formatted = new Array();
        var links_formatted = {};
        
        //create array of target objectIds
        for(var i = 0; i < submission_data.targets.length; i++){
            targets_formatted.push(BSON.ObjectID.createFromHexString(submission_data.targets[i]));
        }

        //create array of target objectIds
        for(var i = 0; i < submission_data.highlights.length; i++){
            //build array of highlihgt contents
            var highlight_contents = new Array();
            for(var j = 0; j < submission_data.highlights[i].fields.length; j++){
                highlight_contents.push(submission_data.highlights[i].fields[j].text);
            }
            var title = submission_data.highlights[i].title;

            var new_highlight = {};
            highlights_formatted[title] = highlight_contents;

        }

        //create array of target objectIds
        for(var i = 0; i < submission_data.data_sources.length; i++){
            data_sources_formatted.push(submission_data.data_sources[i].url);
        }

        //create array of target objectIds ## unfinished need to deal with images and videos that are not null  and other button links too
        for(var i = 0; i < submission_data.button_links.length; i++){
            if(submission_data.button_links[i].special_title != undefined && submission_data.button_links[i].special_title.length > 0){
                links_formatted[submission_data.button_links[i].special_title] = submission_data.button_links[i].url;
            }else{
                links_formatted[submission_data.button_links[i].title] = submission_data.button_links[i].url;
            }
        }

        var formatted_special_feature_content = "";

        if(submission_data.special_feature == undefined){
            submission_data.special_feature = {};
            submission_data.special_feature.type = "";
            formatted_special_feature_content = "";
        }
        //format special feature for storage
        else if(submission_data.special_feature.type == "youtube_embed"){

            if(submission_data.special_feature.content && submission_data.special_feature.content.length > 0){
                if(submission_data.special_feature.content.indexOf("embed") == -1){

                    var video_id = submission_data.special_feature.content.split('v=')[1];
                    var ampersandPosition = video_id.indexOf('&');
                    if(ampersandPosition != -1) {
                        video_id = video_id.substring(0, ampersandPosition);
                    }

                    formatted_special_feature_content = "https://www.youtube.com/embed/" + video_id;
                }
                else{
                    formatted_special_feature_content = submission_data.special_feature.content;
                }
            }
        }
        else if(submission_data.special_feature.type == "spotify_embed"){

            var video_id = submission_data.special_feature.content.split('track/')[1];

            formatted_special_feature_content = "https://embed.spotify.com/?uri=spotify%3Atrack%3A" + video_id;
        }
        else if(submission_data.special_feature.type == "video_embed"){

            formatted_special_feature_content = submission_data.special_feature.content;
        }
        
        var insert_object = {
            "title" : submission_data.title,
            "aggressor" : actor_object,
            "targets" : targets_formatted,
            "description" : submission_data.description,
            "date_added" : new Date(),
            "event_date" : new Date(date[2],date[1]-1,date[0]+1),
            "highlights" : highlights_formatted,
            "data_sources" : data_sources_formatted,
            "links" : links_formatted,
            "selected_categories" : submission_data.selected_categories,
            "img_title" : "",
            "special_feature" : {
                type : submission_data.special_feature.type,
                content : formatted_special_feature_content
            }
        }
                
        var img_title;
        
        if(test_mode){
            console.log("test mode is on.");
            console.log(insert_object);
        }
        else{
            
            var db_options = {
                send_email_notification: true,
                email_notification_text: "Beef",
                add_to_scraped_confirmed_table: submission_data.record_origin == "scraped" ? true : false
            };
                                    
            if(file){
                console.log(file)
                storage_interface.upload_image(false, "events", file.originalname, file.buffer, function(img_dl_title){
                    insert_object.img_title = img_dl_title;
                    db_interface.insert_record_into_db(insert_object, db_ref.get_current_event_table(), db_options, function(){
                        response.send();
                    });
                });
            }
            else{
                if(submission_data.img_title.length > 0){
                    storage_interface.upload_image(true, "events", submission_data.img_title, null, function(img_dl_title){
                        insert_object.img_title = img_dl_title;
                        db_interface.insert_record_into_db(insert_object, db_ref.get_current_event_table(), db_options, function(){
                            response.send();
                        });
                    });            
                }
            }
        }        
    }
}