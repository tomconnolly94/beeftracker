//get database reference object
var db_ref = require("../../db_config.js");
var BSON = require('bson');
var nodemailer = require('nodemailer');
var fs = require('fs');
var dl_request = require('request');

//configure testing mode, if set: true, record will be collected, printed but not sent to db and no email notification will be sent.
var test_mode = false;

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
        //console.log(submission_data);
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

        if(file){ 
            links_formatted["mf_img_link"] = file.filename;
        }
        else{
            var download = function(img_url, file_location, callback){
                dl_request.head(img_url, function(err, res, body){
                    console.log('content-type:', res.headers['content-type']);
                    console.log('content-length:', res.headers['content-length']);

                    dl_request(img_url).pipe(fs.createWriteStream(file_location)).on('close', callback);
                });
            };
            
            var img_url = submission_data.img_title.split("?")[0];
            if(!img_url.includes("http")){
                img_url = "http:" + submission_data.img_title;
            }
            var url_split = img_url.split("/");
            var filename = url_split[url_split.length - 1];
            
            filename = filename.replace(/%/gi, "");
            
            var file_location = "public/assets/images/actors/" + filename;
            
            links_formatted["mf_img_link"] = filename;
            download(img_url, file_location, function(){
                console.log('image downloaded');
            });
        }

        //create array of target objectIds ## unfinished need to deal with images and videos that are not null  and other button links too
        for(var i = 0; i < submission_data.button_links.length; i++){
            if(submission_data.button_links[i].special_title != undefined && submission_data.button_links[i].special_title.length > 0){
                links_formatted[submission_data.button_links[i].special_title] = submission_data.button_links[i].url;
            }else{
                links_formatted[submission_data.button_links[i].title] = submission_data.button_links[i].url;
            }
        }

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
            "date_added" : new Date()
        }

        console.log(insert_object);

        //store data temporarily until submission is confirmed
        db_ref.get_db_object().connect(db_url, function(err, db) {
            if(err){ console.log(err); }
            else{
                //standard query to match an event and resolve aggressor and targets references
                db.collection(db_ref.get_current_actor_table()).insert(insert_object, function(err, document){
                    console.log(document);

                    if(document != null && document.ops != null){

                        //insert_object._id = document.ops[0]._id;

                        var text = JSON.stringify(insert_object, null, 2); //convert form data to json string form for emailing

                        //config email transporter object
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
                            subject: 'New Actordata Submission', // Subject line
                            text: text //, // plaintext body
                            // html: '<b>Hello world ✔</b>' // example, could send html mail in future versions
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

                        response.send({id: document.ops[0]._id}); //send ok or error response to client
                    }
                });
            }
        });
    }
}