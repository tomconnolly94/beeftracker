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
app.use('/controllers', express.static(__dirname + '/public/controllers/')); //route to reference controller scripts
app.use('/js', express.static(__dirname + '/public/javascript/')); //route to reference controller scripts
app.use('/stylesheets', express.static(__dirname + '/public/stylesheets/')); //route to reference css scripts
app.use('/bower_components', express.static(__dirname + '/bower_components/')); //route to reference css scripts
app.use('/partials', express.static(__dirname + '/views/partials/')); //route to reference css scripts

// ### Permanent page routes ###
app.get('/', function(request, response) { response.render('pages/dynamic_pages/home.ejs'); }); //home page
app.get('/beef/:tagId', function(request, response) { response.render('pages/dynamic_pages/beef.ejs'); }); //beef page
app.get('/artist/:tagId', function(request, response) { response.render('pages/dynamic_pages/artist.ejs'); }); //artist page
app.get('/add_beef/', function(request, response) { response.render('pages/form_pages/submit_event.ejs'); }); // contact us page
app.get('/contact_us/', function(request, response) { response.render('pages/static_pages/contact_us.ejs'); }); // contact us page
app.get('/about/', function(request, response) { response.render('pages/static_pages/about_us.ejs'); }); // about_us page
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
                console.log(docs);
                response.send({actors : docs});
            });
        }
    });
}); //search for an event using its _id
// ### Serve an error page on unrecognised url path ###
app.get('/*', function(req, res, next) { res.render("pages/static_pages/error.ejs"); });

//pages that are not in the current release design but may used later on
//app.get('/', function(request, response) { response.render('pages/splash'); });

// ### Launch application ####
app.listen(app.get('port'), function() { console.log('Node app is running on port', app.get('port')); });