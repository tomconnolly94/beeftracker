//get database reference object
var db_ref = require("../../db_config.js");
var storage_ref = require("../../storage_config.js");
var BSON = require('bson');
var nodemailer = require('nodemailer');
var fs = require('fs');
var dl_request = require('request');
var datauri = require('datauri');
var path = require('path');

//configure testing mode, if set: true, record will be collected, printed but not sent to db and no email notification will be sent.
var test_mode = true;

module.exports = {
    
    execute : function(request, response) {

        //extract data for use later
        var db_url = process.env.MONGODB_URI; //get db uri
        
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
        
        console.log(submission_data);
        
        //format data for db insertion
        var date = submission_data.date.split('/');
        var nicknames_formatted = new Array();
        var occupations_formatted = new Array();
        var achievements_formatted = new Array();
        var data_sources_formatted = new Array();
        var assoc_actors_formatted = new Array();
        var links_formatted = {};

        //create array of target objectIds
        for(var i = 0; i < submission_data.nicknames.length; i++){
            if(submission_data.nicknames[i].text){
                nicknames_formatted.push(submission_data.nicknames[i].text);
            }
            else{
                nicknames_formatted.push(submission_data.nicknames[i]);
            }
        }

        //create array of target objectIds
        for(var i = 0; i < submission_data.occupations.length; i++){
            if(submission_data.occupations[i].text){
                occupations_formatted.push(submission_data.occupations[i].text);
            }
            else{
                occupations_formatted.push(submission_data.occupations[i]);
            }
        }

        //create array of target objectIds
        for(var i = 0; i < submission_data.achievements.length; i++){
            if(submission_data.achievements[i].text){
                achievements_formatted.push(submission_data.achievements[i].text);
            }
            else{
                achievements_formatted.push(submission_data.achievements[i]);
            }
        }

        //create array of target objectIds
        for(var i = 0; i < submission_data.data_sources.length; i++){
            if(submission_data.data_sources[i].text){
                data_sources_formatted.push(submission_data.data_sources[i].text);
            }
            else{
                data_sources_formatted.push(submission_data.data_sources[i]);
            }
        }

        //create array of target objectIds
        for(var i = 0; i < submission_data.assoc_actors.length; i++){
            if(submission_data.assoc_actors[i].length > 1){
                assoc_actors_formatted.push(BSON.ObjectID.createFromHexString(submission_data.assoc_actors[i]));
            }
        }
        
        //create array of target objectIds ## unfinished need to deal with images and videos that are not null  and other button links too
        for(var i = 0; i < submission_data.button_links.length; i++){
            if(submission_data.button_links[i].special_title != undefined && submission_data.button_links[i].special_title.length > 0){
                links_formatted[submission_data.button_links[i].special_title] = submission_data.button_links[i].url;
            }else{
                links_formatted[submission_data.button_links[i].title] = submission_data.button_links[i].url;
            }
        }

        var img_title = "";
        
        var cloudinary_options = { 
            unique_filename: true, 
            folder: storage_ref.get_actor_images_folder()
        };
        

        //format object for insertion into pending db
        var insert_object = {        
            "stage_name" : submission_data.stage_name,
            "birth_name" : submission_data.birth_name,
            "nicknames" : nicknames_formatted,
            "d_o_b" : new Date(date[2],date[1]-1,date[0]),
            "occupations" : occupations_formatted,
            "origin" : submission_data.origin,
            "achievements" : submission_data.origin,
            "bio" : submission_data.bio,
            "data_sources" : data_sources_formatted,
            "associated_actors" : assoc_actors_formatted,
            "links" : links_formatted, 
            "date_added" : new Date(),
            img_title: img_title
        }

        console.log(insert_object);

        if(test_mode){
            console.log("test mode is on.");
            console.log(insert_object);
        }
        else{
            
            var db_options = {
                send_email_notification: true,
                email_notification_tagline: "Actor",
                add_to_scraped_confirmed_table: false
            };
                                    
            if(file){
                storage_interface.upload_image_to_cloudinary(false, "actors", file.filename, file.buffer, function(img_dl_title){
                    insert_object.img_title = img_dl_title;
                    db_interface.insert_record_into_db(insert_object, db_ref.get_current_actor_table(), db_options, function(){
                        
                    });
                });
            }
            else{
                if(submission_data.img_title.length > 0){
                    storage_interface.upload_image_to_cloudinary(true, "actors", submission_data.img_title, null, function(img_dl_title){
                        insert_object.img_title = img_dl_title;
                        db_interface.insert_record_into_db(insert_object, db_ref.get_current_actor_table(), db_options, function(){
                            
                        });
                    });            
                }
            }
        }
    }
}