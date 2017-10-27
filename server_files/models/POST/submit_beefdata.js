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
var test_mode = false;

module.exports = {
    
    execute : function(request, response) {

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
                
        var img_title;
        
        var cloudinary_options = { 
            unique_filename: true, 
            folder: storage_ref.get_event_images_folder()
        };
        
        if(file){ 
            img_title = file.filename;
            
            if(storage_ref.get_upload_method() == "cloudinary"){
                //format image path for cloudinary
                var dUri = new Datauri();
                dUri.format(path.extname(request.file.originalname).toString(),request.file.buffer);

                storage_ref.get_upload_object().uploader.upload(dUri.content, function (err, i) {
                    if (err) { console.log(err); }

                }, cloudinary_options);
            }
        }
        else{
            if(submission_data.img_title.length > 0){
            
                var download_to_cloudinary = function(img_url, callback){
                    dl_request.head(img_url, function(err, res, body){
                                                
                        storage_ref.get_upload_object().uploader.upload(img_url, function (result) {
                            if(result.error){ console.log(result.error); }
                            if(result.public_id){
                                img_title = result.public_id.split("/")[1];
                            }
                            callback();
                        }, cloudinary_options);
                    });
                };
                
                var download_to_local = function(img_url, file_location, callback){
                    dl_request.head(img_url, function(err, res, body){
                        dl_request(img_url).pipe(fs.createWriteStream(file_location)).on('close', callback);
                    });
                };

                var img_url = submission_data.img_title.split("?")[0];
                if(!img_url.includes("http")){
                    img_url = "http:" + submission_data.img_title;
                }
                
                if(storage_ref.get_upload_method() == "local"){
                    
                    var url_split = img_url.split("/");
                    var filename = url_split[url_split.length - 1];
                    filename = filename.replace(/%/gi, "");
                    var file_location = "public/assets/images/events/" + filename;

                    img_title = filename;

                    download_to_local(img_url, file_location, function(){
                        console.log("image downloaded to server's local file system");
                    });
                }
                if(storage_ref.get_upload_method() == "cloudinary"){
                
                    console.log()
                    
                    download_to_cloudinary(img_url, function(){
                        console.log("image downloaded to cloudinary");
                    });
                
                }
            }
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
            "img_title" : img_title,
            "special_feature" : {
                type : submission_data.special_feature.type,
                content : formatted_special_feature_content
            }
        }

        if(test_mode){
            console.log("test mode is on.");
            console.log(insert_object);
        }
        else{
            //store data temporarily until submission is confirmed
            db_ref.get_db_object().connect(url, function(err, db) {
                if(err){ console.log(err); }
                else{
                    //standard query to insert into live events table
                    db.collection(db_ref.get_current_event_table()).insert(insert_object, function(err, document){

                        if(document != null && document.ops != null){
                            
                            //add _id field so object can be found later
                            insert_object._id = document.ops[0]._id;
                            
                            var events_confirm_obj = {
                                event_id: insert_object._id,
                                title: insert_object.title
                            }

                            db.collection(db_ref.get_scraped_events_confirmed_table()).insert(events_confirm_obj, function(err, document){

                                //parse json directly to string with indents
                                var text = JSON.stringify(insert_object, null, 2);

                                var transporter = nodemailer.createTransport({
                                    service: 'Gmail',
                                    auth: {
                                        user: 'beeftracker@gmail.com', // Your email id
                                        pass: 'UoNYtG4gDsabqtpMtx7tryQWKi8Nlm49HXKn3YqqDslZKb6AbAcTy57k/ZGfTSY0' // Your password
                                    }
                                });

                                //config mail options
                                var mailOptions = {
                                    from: 'bf_sys@gmail.com', // sender address
                                    to: 'beeftracker@gmail.com', // list of receivers
                                    subject: 'New Beefdata Submission', // Subject line
                                    text: text //, // plaintext body
                                    // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
                                };

                                //send email notifying beeftracker account new submisson
                                transporter.sendMail(mailOptions, function(error, info){
                                    if(error){
                                        console.log(error);
                                    }else{
                                        console.log('Message sent: ' + info.response);
                                        response.json({yo: info.response});
                                    };
                                });

                                response.send();
                            });
                        }

                    });
                }
            });
        }
    }
}
