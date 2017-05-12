/////////////////////////////////////////////////////////////////////////////////
//
//  File: index.js
//  Project: beeftracker
//  Contributors: Tom Connolly
//  Description: index.js is a file designed to use express to interact with the 
//                  node server. It defines routes, db search requests and sets 
//                  directory routes
//
/////////////////////////////////////////////////////////////////////////////////

// ### Create all the modules that are needed to run this server ###
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var path = require('path');
var MongoClient = require('mongodb').MongoClient;
var async = require("async");
var ObjectID = require('mongodb').ObjectID;
var BSON = require('bson');
var sitemap_generator = require('sitemap');
var nodemailer = require('nodemailer');
var multer = require('multer');
var upload_event_img = multer({ dest: "public/assets/images/pending/events" });
var upload_actor_img = multer({ dest: "public/assets/images/pending/actors" });

// ## Sitemap generation ###
sitemap = sitemap_generator.createSitemap ({
    hostname: 'http://www.beeftracker.co.uk',
    cacheTime: 600000,        // 600 sec - cache purge period 
    urls: [
        { url: '/home/', changefreq: 'weekly', priority: 0.9 },
        { url: '/artist/{{%20trustSrc(url)%20}}', changefreq: 'weekly',  priority: 0.7 },
        { url: '/beef/{{%20trustSrc(url)%20}}', changefreq: 'weekly',  priority: 0.9 },
        { url: '/about_us/', changefreq: 'weekly',  priority: 0.5 },
        { url: '/contact_us/', changefreq: 'weekly',  priority: 0.5 },
        { url: '/error/', changefreq: 'weekly',  priority: 0.7 },
    ]
});

// ### Configure node variables ###
app.set('port', (process.env.PORT || 5000));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());

// ### Directory routes ### 
app.use('/artist_images', express.static(__dirname + '/public/assets/images/artists/')); //route to reference images
app.use('/event_images', express.static(__dirname + '/public/assets/images/events/')); //route to reference images
app.use('/background_images', express.static(__dirname + '/public/assets/images/backgrounds/')); //route to reference images
app.use('/logo', express.static(__dirname + '/public/assets/images/logo/')); //route to reference images
app.use('/modules', express.static(__dirname + '/node_modules/')); //route to reference libraries like angular
app.use('/require_scripts', express.static(__dirname + '/public/require_scripts/')); //route to reference libraries like angular
app.use('/controllers', express.static(__dirname + '/public/controllers/')); //route to reference controller scripts
app.use('/directives', express.static(__dirname + '/public/directives/')); //route to reference controller scripts
app.use('/js', express.static(__dirname + '/public/javascript/')); //route to reference controller scripts
app.use('/stylesheets', express.static(__dirname + '/public/stylesheets/')); //route to reference css scripts
app.use('/bower_components', express.static(__dirname + '/bower_components/')); //route to reference css scripts
app.use('/partials', express.static(__dirname + '/views/partials/')); //route to reference css scripts

// ### Permanent page routes ###
app.get('/', function(request, response) { response.render('pages/dynamic_pages/home.ejs'); }); //home page
app.get('/beef/:tagId', function(request, response) { response.render('pages/dynamic_pages/beef.ejs'); }); //beef page
app.get('/artist/:tagId', function(request, response) { response.render('pages/dynamic_pages/artist.ejs'); }); //artist page
app.get('/add_beef/', function(request, response) { response.render('pages/form_pages/submit_event.ejs'); }); // submit beefdata page page
app.get('/raw_add_actor/', function(request, response) { response.render('pages/form_pages/raw_submit_actor.ejs'); }); // add_actor form abstract
app.get('/add_actor/', function(request, response) { response.render('pages/form_pages/submit_actor.ejs'); }); // submit actordata page
app.get('/contact_us/', function(request, response) { response.render('pages/static_pages/contact_us.ejs'); }); // contact us page
app.get('/about/', function(request, response) { response.render('pages/static_pages/about_us.ejs'); }); // about_us page
app.get('/submission_confirmation/', function(request, response) { response.render('pages/static_pages/submit_conf.ejs'); }); // about_us page
app.get('/terms_of_use/', function(request, response) { response.render('pages/static_pages/terms_of_use.ejs'); }); // about_us page
app.get('/sitemap', function(req, res) {
    sitemap.toXML( function (err, xml) {
        if (err) {
            return res.status(500).end();
        }
        res.header('Content-Type', 'application/xml');
        res.send( xml );
  });
}); // access to sitemap generated above

// ### Verification files ###
app.get('/google3fc5d5a06ad26a53.html', function(request, response) { response.sendFile(__dirname + '/views/verification_files/google3fc5d5a06ad26a53.html'); }); //google verification
app.get('/BingSiteAuth.xml', function(request, response) { response.sendFile(__dirname + '/views/verification_files/BingSiteAuth.xml'); }); //bing notification
app.get('/google3fc5d5a06ad26a53.html', function(request, response) { response.sendFile(__dirname + '/views/verification_files/google3fc5d5a06ad26a53.html'); });
app.get('/BingSiteAuth.xml', function(request, response) { response.sendFile(__dirname + '/views/verification_files/BingSiteAuth.xml'); });
app.get('/robots.txt', function(request, response) { response.sendFile(__dirname + '/views/verification_files/robots.txt'); }); //robots config file

// ### Search functions ###
app.get('/search_events_by_id/:event_id', function(request, response) {

    var url = process.env.MONGODB_URI;
    var identifier = request.params.event_id;

    MongoClient.connect(url, function(err, db) {
        if(err){ console.log(err); }
        else{
            console.log(identifier);
            var object = BSON.ObjectID.createFromHexString(identifier);
            
            //standard query to match an event and resolve aggressor and targets references
            db.collection("event_data_v0_2").aggregate([{ $match: { _id : object } }, //query 
                                                        { $unwind : "$targets" }, //allows the $lookup with each field in $targets
                                                        { $lookup : { 
                                                            from: "actor_data_v0_2", 
                                                            localField: "aggressor", 
                                                            foreignField: "_id", 
                                                            as: "aggressor_object" 
                                                        }}, //resolve the 'aggressor' field
                                                        { $lookup : { 
                                                            from: "actor_data_v0_2", 
                                                            localField: "targets", 
                                                            foreignField: "_id", 
                                                            as: "target_objects" 
                                                        }},
                                                        { $group: {
                                                            _id : "$_id",
                                                            title : { "$max" : "$title"},
                                                            aggressor_object : { "$max" : "$aggressor_object"},
                                                            aggressor : { "$max" : "$aggressor"},
                                                            description : { "$max" : "$description"},
                                                            date_added : { "$max" : "$date_added"},
                                                            event_date : { "$max" : "$event_date"},
                                                            highlights : { "$max" : "$highlights"},
                                                            data_sources : { "$max" : "$data_sources"},
                                                            links : { "$max" : "$links"},
                                                            targets : { "$addToSet": "$target_objects" }
                                                        }} //resolve each of the targets fields
                                                       ]).toArray(function(queryErr, docs) {
                console.log(docs);
                response.send({eventObject : docs[0]});
            });
        }
    });
}); //search for an event using its _id
app.get('/search_all/:search_term', function(request, response) {
    
    var url = process.env.MONGODB_URI;
    var identifier = request.params.search_term;

    MongoClient.connect(url, function(err, db) {
        if(err){ console.log(err); }
        else{
            var all_objects = new Array();
            
            async.waterfall([
                function(callback){
                    //var object = BSON.ObjectID.createFromHexString(identifier);
            
                    //standard query to match an event and resolve aggressor and targets references
                    db.collection("event_data_v0_2").aggregate([{ $match: { title : { $regex : identifier, $options : "i"} } },
                                                                { $lookup : { 
                                                                    from: "actor_data_v0_2",
                                                                    localField: "aggressor",
                                                                    foreignField: "_id",
                                                                    as: "aggressor_object" } }
                                                               ]).toArray(function(queryErr, events) {
                        if(queryErr){ console.log(queryErr); }
                        else{
                            all_objects = events;
                            callback(null);
                        }
                    });

                },
                function(callback){ 
                    //standard query to match an event and resolve aggressor and targets references
                    db.collection("actor_data_v0_2").aggregate([{ $match: { stage_name : { $regex : identifier, $options : "i"} } },
                                                                { $lookup : { 
                                                                    from: "actor_data_v0_2",
                                                                    localField: "_id",
                                                                    foreignField: "_id",
                                                                    as: "aggressor_object" } }
                                                               ]).toArray(function(queryErr, events) {
                        if(err){ console.log(queryErr); }
                        else{
                            for(var i = 0; i < events.length;i++){
                                all_objects.push(events[i]);                                
                            }
                            response.send( { objects : all_objects } );
                        }
                    });
                }
            ], function (error, all_events) {
                if (error) { console.log(error); }
                else{
                    
                }
            });
            
        }
    });
}); //search for any events matching a to_string consisting of concatenated artist_id and event title
app.get('/search_actors_by_id/:artist_id', function(request, response) {
    
    var url = process.env.MONGODB_URI;
    var identifier = request.params.artist_id;

    MongoClient.connect(url, function(err, db) {
        if(err){ console.log(err); }
        else{
            var object = BSON.ObjectID.createFromHexString(identifier);
            console.log(identifier);
                        
            db.collection("actor_data_v0_2").aggregate([{ $match: { _id : object } }/*, 
                                                        { $unwind : "$associated_actors"},
                                                        { $lookup : { 
                                                            from: "actor_data_v0_2",
                                                                     localField: "associated_actors",
                                                                     foreignField: "_id",
                                                                     as: "associated_actor_objects" }}*/
                                                       ]).toArray(function(queryErr, docs) {
                if(queryErr){ console.log(queryErr); }
                else{
                    response.send( { artist : docs[0] } );
                }
            });
        }
    });
}); //search for an artist using its _id
app.get('/search_artists_by_stage_name/:artist_name', function(request, response) {
    
    var url = process.env.MONGODB_URI;
    var identifier = request.params.artist_name;

    MongoClient.connect(url, function(err, db) {
        if(err){ console.log(err); }
        else{
            var field_name = 'stage_name';
            
            //code to create a qry string that matches NEAR to query string
            var end = "{ \"$regex\": \"" + identifier + "\", \"$options\": \"i\" }";
            var qry = "{ \"" + field_name + "\" : " + end + " }";
            db.collection("actor_data_v0_2").aggregate([{ $match: { _id : object } },
                                                        { $unwind : "$associated_actors"},
                                                        { $lookup : { 
                                                            from: "actor_data_v0_2",
                                                            localField: "associated_actors",
                                                            foreignField: "_id",
                                                            as: "associated_actors" }} 
                                                       ]).toArray(function(queryErr, docs) {
            if(queryErr){ console.log(queryErr); }
            else{
                response.send( { eventObject : docs } );
            }
            });            
        }
    });
}); //search for an artist using their stage name
app.get('/search_related_actors_by_id/:artist_id', function(request, response) {
    
    var url = process.env.MONGODB_URI;
    var identifier = request.params.artist_id;

    MongoClient.connect(url, function(err, db) {
        if(err){ console.log(err); }
        else{
            
            var object = BSON.ObjectID.createFromHexString(identifier);

            async.waterfall([
                function(callback){
                    var object = BSON.ObjectID.createFromHexString(identifier);
            
                    //standard query to match an event and resolve aggressor and targets references
                    db.collection("actor_data_v0_2").find( { _id : object }).toArray(function(queryErr, response) {
                        if(queryErr){ console.log(queryErr); }
                        else{
                            callback(null,response[0].associated_actors);
                        }
                    });

                },
                function(associated_actors, callback){
                    
                    
                    assoc_act_arr = new Array();
                    
                    for(var i = 0; i < Object.keys(associated_actors).length; i++){
                        assoc_act_arr.push(associated_actors[i]);
                    }
                    
                    db.collection("actor_data_v0_2").find({ _id : { $in : assoc_act_arr }}).toArray(function(queryErr, actors) {
                        if(err){ console.log(queryErr); }
                        else{
                            console.log(actors);
                            response.send( { actors : actors } );
                        }
                    });
                }
            ], function (error, all_events) {
                if (error) { console.log(error); }
                else{
                    
                }
            });
        }        
    });
}); //search for any artists that share an event with the _id
app.get('/search_events_by_event_aggressor/:artist_id', function(request, response) {
    
    var url = process.env.MONGODB_URI;
    var identifier = request.params.artist_id;

    MongoClient.connect(url, function(err, db) {
        if(err){ console.log(err); }
        else{
            
            var object = BSON.ObjectID.createFromHexString(identifier);
            
            db.collection("event_data_v0_2").aggregate([{ $match: { aggressor : object } },
                                                        { $unwind : "$targets"}, 
                                                        { $lookup : { from: "actor_data_v0_2", localField: "aggressor", foreignField: "_id", as: "aggressor_object" }}, 
                                                        { $lookup : { from: "actor_data_v0_2", localField: "targets", foreignField: "_id", as: "targets" }}
                                                       ]).toArray(function(queryErr, docs) {
            //db.collection("event_data_v0_2").find(JSON.parse(qry)).sort({"date_added" : -1}).limit(6).toArray(function(queryErr, docs) {
                console.log(docs);
                response.send( { events : docs } );
            });
            
        }
    });
    
}); //search for any events using the stage name of an artist
app.get('/search_recent_events/:num_of_events', function(request, response) {
    
    //get necessary fields for use later
    var url = process.env.MONGODB_URI;
    var limit = parseInt(request.params.num_of_events);
    
    //open database connection
    MongoClient.connect(url, function(err, db) {
        if(err){ console.log(err);}
        else{
            var field_name = 'aggressor';
            
            db.collection("event_data_v0_2").aggregate( [ { $lookup : { from: "actor_data_v0_2", localField: "aggressor", foreignField: "_id", as: "aggressor_object" }}]).sort({"date_added" : -1}).limit(limit).toArray(function(queryErr, docs) {
                response.send( { events : docs } );
            });

            
        }
    });
    
}); //search for x the most recent events to have been added to the database
app.get('/search_all_related_events_in_timeline_by_id/:event_id', function(request, response) {
    
    var url = process.env.MONGODB_URI;
    var identifier = request.params.event_id;
    
    MongoClient.connect(url, function(err, db) {
        if(err){ console.log(err); }
        else{
                        
            async.waterfall([
                function(callback){
                    var object = BSON.ObjectID.createFromHexString(identifier);
            
                    //standard query to match an event and resolve aggressor and targets references
                    db.collection("event_data_v0_2").aggregate([{ $match: { _id : object } },
                                                                { $lookup : { 
                                                                    from: "actor_data_v0_2",
                                                                    localField: "aggressor",
                                                                    foreignField: "_id",
                                                                    as: "aggressor_object" }},
                                                                { $unwind : "$targets"},
                                                                { $lookup : { 
                                                                    from: "actor_data_v0_2",
                                                                    localField: "targets",
                                                                    foreignField: "_id",
                                                                    as: "target_objects" }},
                                                                { $group: {
                                                                    _id : "$_id",
                                                                    title : { "$max" : "$title"},
                                                                    aggressor_object : { "$max" : "$aggressor_object"},
                                                                    aggressor : { "$max" : "$aggressor"},
                                                                    description : { "$max" : "$description"},
                                                                    date_added : { "$max" : "$date_added"},
                                                                    event_date : { "$max" : "$event_date"},
                                                                    highlights : { "$max" : "$highlights"},
                                                                    data_sources : { "$max" : "$data_sources"},
                                                                    links : { "$max" : "$links"},
                                                                    targets : { "$addToSet": "$target_objects" }
                                                                }}
                                                               ]).toArray(function(queryErr, main_event) {
                        if(queryErr){ console.log(queryErr); }
                        else{
                            callback(null,main_event[0]);
                        }
                    });

                },
                function(main_event, callback){ //gather all the targets' responses
                     
                    var artists = new Array();
                    artists.push(main_event.aggressor_object[0]._id);
                    
                    for(var i = 0; i < main_event.targets.length; i++){
                        artists.push(main_event.targets[i][0]._id);
                    }
                    
                    var all_events = new Array();
                    
                    //standard query to match an event and resolve aggressor and targets references
                    db.collection("event_data_v0_2").aggregate([{ $match: { aggressor : { $in : artists }} },
                                                                { $unwind : "$targets"}, 
                                                                { $lookup : { 
                                                                    from: "actor_data_v0_2", 
                                                                    localField: "aggressor", 
                                                                    foreignField: "_id", 
                                                                    as: "aggressor_object" }}, 
                                                                { $lookup : { 
                                                                    from: "actor_data_v0_2", 
                                                                    localField: "targets", 
                                                                    foreignField: "_id", 
                                                                    as: "target_objects" }},
                                                                { $group: {
                                                                    _id : "$_id",
                                                                    title : { "$max" : "$title"},
                                                                    aggressor_object : { "$max" : "$aggressor_object"},
                                                                    aggressor : { "$max" : "$aggressor"},
                                                                    description : { "$max" : "$description"},
                                                                    date_added : { "$max" : "$date_added"},
                                                                    event_date : { "$max" : "$event_date"},
                                                                    highlights : { "$max" : "$highlights"},
                                                                    data_sources : { "$max" : "$data_sources"},
                                                                    links : { "$max" : "$links"},
                                                                    targets : { "$addToSet": "$target_objects" }
                                                                }}
                                                               ]).toArray(function(queryErr, events) {
                        if(err){ console.log(queryErr); }
                        else{
                        
                            var event_store = new Array();
                            
                            async.each(events, function(event, callback) {
                                
                                    if(event.aggressor.toString() == main_event.aggressor.toString()){
                                        all_events.push(event);
                                    }
                                    else{

                                        //loop through targets to check that one of them is orig_artist_name
                                        for(var sub_target_num = 0; sub_target_num < event.targets.length; sub_target_num++){

                                            var target = event.targets[sub_target_num][0];

                                            //should this event be included
                                            if(target._id.toString() === main_event.aggressor_object[0]._id.toString()){
                                                    all_events.push(event);
                                            }
                                        }
                                    }
                            });
                            response.send( { events : all_events } );
                        }
                    });
                }
            ], function (error, all_events) {
                if (error) { console.log(error); }
                else{
                    
                }
            });
        }
    });
}); //make multiple database queries to gather all existing events involving both the aggressor and at least one of the targets
app.get('/search_all_artists/', function(request, response) {

    var url = process.env.MONGODB_URI;
    
    MongoClient.connect(url, function(err, db) {
        if(err){ console.log(err); }
        else{
            //standard query to match an event and resolve aggressor and targets references
            db.collection("actor_data_v0_2").find().toArray(function(queryErr, docs) {
                response.send({actors : docs});
            });
        }
    });
}); //search for an event using its _id

// ### Form Handling ###
app.post('/submit_beefdata/', upload_event_img.single('attachment'), (request, response) => {

    //extract data for use later
    var url = process.env.MONGODB_URI; //get db uri
    var file = request.file; //get submitted image
    var submission_data = JSON.parse(request.body.data); //get form data
    
    //format data for db insertion
    var artist_object = BSON.ObjectID.createFromHexString(submission_data.aggressor);
    var date = submission_data.date.split('/');
    var targets_formatted = new Array();
    var highlights_formatted = new Array();
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
        new_highlight[title] = highlight_contents;
        
        highlights_formatted.push(new_highlight);
    
    }
    
    //create array of target objectIds
    for(var i = 0; i < submission_data.data_sources.length; i++){
        data_sources_formatted.push(submission_data.data_sources[i].url);
    }
    
    links_formatted["mf_img_link"] = file.filename;

    //create array of target objectIds ## unfinished need to deal with images and videos that are not null  and other button links too
    for(var i = 0; i < submission_data.button_links.length; i++){
        if(submission_data.button_links[i].special_title.length > 0){
            links_formatted[submission_data.button_links[i].special_title] = submission_data.button_links[i].url;
        }else{
            links_formatted[submission_data.button_links[i].title] = submission_data.button_links[i].url;
        }
    }
    
    var insert_object = {
        "title" : submission_data.title,
        "aggressor" : artist_object,
        "targets" : targets_formatted,
        "description" : submission_data.description,
        "date_added" : new Date(),
        "event_date" : new Date(date[2],date[1]-1,date[0]),
        "highlights" : highlights_formatted,
        "data_sources" : data_sources_formatted,
        "links" : links_formatted       
    }
    
    //store data temporarily untill submission is confirmed
    MongoClient.connect(url, function(err, db) {
        if(err){ console.log(err); }
        else{
            //standard query to match an event and resolve aggressor and targets references
            db.collection("pending_event_data_v0_2").insert(insert_object, function(err, document){
                
                //add _id field so object can be found later
                insert_object._id = document.ops[0]._id;

                //parse json directly to string with indents
                var text = JSON.stringify(insert_object, null, 2);
                
                var transporter = nodemailer.createTransport({
                    service: 'Gmail',
                    auth: {
                        user: 'beeftracker@gmail.com', // Your email id
                        pass: 'Vietnam13!' // Your password
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
                        response.json({yo: error});
                    }else{
                        console.log('Message sent: ' + info.response);
                        response.json({yo: info.response});
                    };
                });
                
            });
        }
    });
    response.send();
}); //submit new beefdata to the database
app.post('/submit_actordata/', upload_actor_img.single('attachment'), (request, response) => {

    //extract data for use later
    var url = process.env.MONGODB_URI; //get db uri
    var file = request.file; //get submitted image
    var submission_data = JSON.parse(request.body.data); //get form data
    
    //format data for db insertion
    console.log(submission_data);
    var date = submission_data.date.split('/');
    var nicknames_formatted = new Array();
    var occupations_formatted = new Array();
    var achievements_formatted = new Array();
    var data_sources_formatted = new Array();
    var assoc_actors_formatted = new Array();
    var links_formatted = {};
    
    //create array of target objectIds
    for(var i = 0; i < submission_data.nicknames.length; i++){
        nicknames_formatted.push(submission_data.nicknames[i].text);
    }
    
    //create array of target objectIds
    for(var i = 0; i < submission_data.occupations.length; i++){
        occupations_formatted.push(submission_data.occupations[i].text);
    }
    
    //create array of target objectIds
    for(var i = 0; i < submission_data.achievements.length; i++){
        achievements_formatted.push(submission_data.achievements[i].text);
    }
    
    //create array of target objectIds
    for(var i = 0; i < submission_data.data_sources.length; i++){
        data_sources_formatted.push(submission_data.data_sources[i].text);
    }
    
    //create array of target objectIds
    for(var i = 0; i < submission_data.assoc_actors.length; i++){
        assoc_actors_formatted.push(BSON.ObjectID.createFromHexString(submission_data.assoc_actors[i]));
    }
    
    links_formatted["mf_img_link"] = file.filename;

    //create array of target objectIds ## unfinished need to deal with images and videos that are not null  and other button links too
    for(var i = 0; i < submission_data.button_links.length; i++){
        if(submission_data.button_links[i].special_title.length > 0){
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
        "data_sources" : data_sources_formatted,
        "associated_actors" : assoc_actors_formatted,
        "links" : links_formatted, 
        "date_added" : new Date()
    }
    
    //store data temporarily until submission is confirmed
    MongoClient.connect(url, function(err, db) {
        if(err){ console.log(err); }
        else{
            //standard query to match an event and resolve aggressor and targets references
            db.collection("pending_actor_data_v0_2").insert(insert_object, function(err, document){
                console.log(document);
                
                insert_object._id = document.ops[0]._id;
                
                var text = JSON.stringify(insert_object, null, 2); //convert form data to json string form for emailing

                //config email transporter object
                var transporter = nodemailer.createTransport({
                    service: 'Gmail',
                    auth: {
                        user: 'beeftracker@gmail.com', // Your email id
                        pass: 'Vietnam13!' // Your password
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
                        response.json({yo: error});
                    }else{
                        console.log('Message sent: ' + info.response);
                        response.json({yo: info.response});
                    };
                });
            });
        }
    });

    response.send(); //send ok or error response to client
    
}); //submit new beefdata to the database

// ### Serve an error page on unrecognised url path ###
app.get('/*', function(req, res, next) { res.render("pages/static_pages/error.ejs"); });

//pages that are not in the current release design but may used later on
//app.get('/', function(request, response) { response.render('pages/splash'); });

// ### Launch application ####
app.listen(app.get('port'), function() { console.log('Node app is running on port', app.get('port')); });