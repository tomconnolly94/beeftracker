/////////////////////////////////////////////////////////////////////////////////
//
//  File: index.js
//  Project: beeftracker
//  Contributors: Tom Connolly, Dan Kerby, James Langford
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
        { url: '/artist//', changefreq: 'weekly',  priority: 0.7 },
        { url: '/beef/', changefreq: 'weekly',  priority: 0.9 },
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
app.get('/', function(request, response) { response.render('pages/home.ejs'); }); //home page
app.get('/beef/:tagId', function(request, response) { response.render('pages/beef.ejs'); }); //beef page
app.get('/artist/:tagId', function(request, response) { response.render('pages/artist.ejs'); }); //artist page
app.get('/contact_us/', function(request, response) { response.render('pages/contact_us.ejs'); }); // contact us page
app.get('/about/', function(request, response) { response.render('pages/about_us.ejs'); }); // about_us page
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
app.get('/google3fc5d5a06ad26a53.html', function(request, response) { response.sendFile(__dirname + '/views/pages/google3fc5d5a06ad26a53.html'); });
app.get('/BingSiteAuth.xml', function(request, response) { response.sendFile(__dirname + '/views/pages/BingSiteAuth.xml'); });

// ### Search functions ###
app.get('/search/:event_id', function(request, response) {

    var url = process.env.MONGODB_URI;
    var identifier = request.params.event_id;

    MongoClient.connect(url, function(err, db) {
        if(err){ console.log(err); }
        else{
            console.log(identifier);
            var object = BSON.ObjectID.createFromHexString(identifier);
            
            //db.collection("event_data_v0_1").find(JSON.parse(qry)).toArray(function(queryErr, docs) {
            db.collection("event_data_v0_1").find( { _id : object } ).toArray(function(queryErr, docs) {
                response.send({eventObject : docs[0]});
                
            });

            
        }
    });
});
app.get('/search_all/:search_term', function(request, response) {
    
    var url = process.env.MONGODB_URI;
    var identifier = request.params.search_term;

    MongoClient.connect(url, function(err, db) {
        if(err){ console.log(err); }
        else{
            var field_name = 'to_string';
            
            //code to create a qry string that matches NEAR to query string
            var end = "{ \"$regex\": \"" + identifier + "\", \"$options\": \"i\" }";
            var qry = "{ \"" + field_name + "\" : " + end + " }";
            
            db.collection("event_data_v0_1").find(JSON.parse(qry)).toArray(function(queryErr, docs) {
                response.send( { events : docs } );
                
            });

            
        }
    });
    
});
app.get('/search_artist/:artist_id', function(request, response) {
    
    var url = process.env.MONGODB_URI;
    var identifier = request.params.artist_id;

    MongoClient.connect(url, function(err, db) {
        if(err){ console.log(err); }
        else{
            var object = BSON.ObjectID.createFromHexString(identifier);
                        
            db.collection("artist_data_v0_1").find( { _id : object } ).toArray(function(queryErr, docs) {
                console.log(docs);
                response.send( { artist : docs[0] } );
            });
        }
    });
});
app.get('/search_artist_from_name/:artist_name', function(request, response) {
    
    var url = process.env.MONGODB_URI;
    var identifier = request.params.artist_name;

    MongoClient.connect(url, function(err, db) {
        if(err){ console.log(err); }
        else{
            var field_name = 'stage_name';
            
            //code to create a qry string that matches NEAR to query string
            var end = "{ \"$regex\": \"" + identifier + "\", \"$options\": \"i\" }";
            var qry = "{ \"" + field_name + "\" : " + end + " }";
            
            db.collection("artist_data_v0_1").find(JSON.parse(qry)).toArray(function(queryErr, docs) {
                response.send( { eventObject : docs[0] } );
                
            });
            
        }
    });
});
app.get('/search_related_artists_from_artist_id/:artist_id', function(request, response) {
    
    var url = process.env.MONGODB_URI;
    var identifier = request.params.artist_id;

    MongoClient.connect(url, function(err, db) {
        if(err){ console.log(err); }
        else{
            
            async.waterfall([
                function(callback){
                    
                    
                    console.log(identifier);
                    var object = BSON.ObjectID.createFromHexString(identifier);
                    
                    //db.collection("event_data_v0_1").find(JSON.parse(qry)).toArray(function(queryErr, docs) {
                    db.collection("artist_data_v0_1").find( { _id : object } ).toArray(function(error, artist) {

                        
                        if (error) { console.log(error); }
                        else{
                            
                            if(artist[0] != undefined){
                                var artist_object = artist[0];

                                console.log(artist_object);
                                console.log(artist_object.stage_name);

                                var identifier = artist_object.stage_name;
                                var field_name = 'aggressor';

                                //code to create a qry string that matches NEAR to query string
                                var end = "{ \"$regex\": \"" + identifier + "\", \"$options\": \"i\" }";
                                var qry = "{ \"" + field_name + "\" : \"" + identifier + "\" }";

                                callback(null, qry);
                            }
                        }
                    });
                },
                function(qry, callback){ //gather all the targets' responses
                                                            
                    db.collection("event_data_v0_1").find(JSON.parse(qry)).toArray(function(error, event_objects) {

                        console.log(event_objects.length);
                        console.log(event_objects[0].targets.length);
                        console.log(Object.keys(event_objects[0].targets));
                        
                        if (error) { console.log(error); }
                        else{                        
                            var target_artists = new Array();
                            
                            for(var i = 0; i < event_objects.length; i++){
                                for(var j = 0; j < Object.keys(event_objects[i].targets).length; j++){
                                    var target_already_found = false;
                                    for(var k = 0; k < target_artists.length; k++){
                                        if(event_objects[i].targets[j] == target_artists[k]){
                                            target_already_found = true;
                                        }
                                    }
                                    if(!target_already_found){
                                        target_artists.push(event_objects[i].targets[j]);
                                    }
                                }                    
                            }
                            response.send( { targets : target_artists } );
                        }
                    });
                }
            ], 
            function (error) {
                if (error) { console.log(error); }
            });
        }        
    });
});
app.get('/search_events_from_artist/:artist_name', function(request, response) {
    
    var url = process.env.MONGODB_URI;
    var identifier = request.params.artist_name;

    MongoClient.connect(url, function(err, db) {
        if(err){ console.log(err); }
        else{
            var field_name = 'aggressor';
            
            //code to create a qry string that matches NEAR to query string
            var end = "{ \"$regex\": \"" + identifier + "\", \"$options\": \"i\" }";
            var qry = "{ \"" + field_name + "\" : " + end + " }";
            
            db.collection("event_data_v0_1").find(JSON.parse(qry)).sort({"date_added" : -1}).limit(6).toArray(function(queryErr, docs) {
                response.send( { events : docs } );
                
            });
            
        }
    });
    
});
app.get('/search_events_from_event_id/:event_id', function(request, response) {
    
    var url = process.env.MONGODB_URI;
    var identifier = request.params.event_id;

    MongoClient.connect(url, function(err, db) {
        if(err){ console.log(err); }
        else{
            var field_name = '_id';
            
            //code to create a qry string that matches NEAR to query string
            var end = "{ \"$regex\": \"" + identifier + "\", \"$options\": \"i\" }";
            var qry = "{ \"" + field_name + "\" : " + end + " }";
            
            db.collection("event_data_v0_1").find(JSON.parse(qry)).sort({"date_added" : -1}).limit(3).toArray(function(queryErr, docs) {
                response.send( { events : docs } );
            });
            
        }
    });
    
});
app.get('/search_recent_events/:num_of_events', function(request, response) {
    
    var url = process.env.MONGODB_URI;
    var limit = parseInt(request.params.num_of_events);
    
    MongoClient.connect(url, function(err, db) {
        if(err){ console.log(err); }
        else{
            var field_name = 'aggressor';
            
            db.collection("event_data_v0_1").find({}).sort({"date_added" : -1}).limit(limit).toArray(function(queryErr, docs) {
                response.send( { events : docs } );
                
            });
        }
    });
    
});
app.get('/search_all_events_in_timeline_from_event_id/:event_id', function(request, response) {
    
    var url = process.env.MONGODB_URI;
    var event_id = request.params.event_id;
    
    MongoClient.connect(url, function(err, db) {
        if(err){ console.log(err); }
        else{
            async.waterfall([
                function(callback){
                    
                    console.log(event_id);
                    
                    var object = BSON.ObjectID.createFromHexString(event_id);
                    
                    
                    console.log(object);
                    
                    //db query: get the main event in question
                    db.collection("event_data_v0_1").find( { _id : object } ).toArray(function(queryErr, main_event) {
                        
                        var orig_artist_name = main_event[0].aggressor;
                        
                        var targets = main_event[0].targets;
                        
                        callback(null, targets, orig_artist_name, main_event);
                    });
                },
                function(targets, orig_artist_name, main_event, callback){ //gather main artists songs
                    
                    var all_events = new Array();
                    
                    //mongo record field 
                    var field_name = 'aggressor';
            
                    //code to create a qry string that matches NEAR to query string
                    var end = "{ \"$regex\": \"" + orig_artist_name + "\", \"$options\": \"i\" }";
                    var qry = "{ \"" + field_name + "\" : " + end + " }";

                    //db query: get all events by the original event's aggressor making sure only to store events that share a a target with the original event
                    db.collection("event_data_v0_1").find(JSON.parse(qry)).toArray(function(queryErr, events) {
                        
                        async.each(events, function(event, callback) {

                            //loop through targets to check that one of them is orig_artist_name
                            outerloop:
                            for(var sub_target_num = 0; sub_target_num < Object.keys(event.targets).length; sub_target_num++){

                                var target_1 = event.targets[sub_target_num];

                                for(var orig_target_num = 0; orig_target_num < Object.keys(targets).length; orig_target_num++){

                                    var target_2 = targets[orig_target_num];
                                    //make sure targets match
                                    if(target_1 == target_2){
                                        all_events.push(event);
                                        break outerloop;
                                    }
                                }
                            }
                        });
                        callback(null, targets, orig_artist_name, main_event, all_events);
                    });
                },
                function(targets, orig_artist_name, main_event, all_events, callback){ //gather all the targets' responses
                     
                    //mongo record field 
                    var field_name = 'aggressor';

                    //code to create a qry string that matches data
                    var qry = "{ \"$or\": [";

                    //build large query to match any events that have their aggressor as one of the targets extracted from the main event, then filter to make sure the main event agressor is one of the targets
                    for(var target_num = 0; target_num < Object.keys(targets).length; target_num++){
                        
                        var target = '{ \"$regex\": \"' + targets[target_num] + '\", \"$options\": \"i\" }';
                        
                        qry += "{ \"" + field_name + "\" : " + target + " }";
                        if(target_num != Object.keys(targets).length-1){
                            qry += ", ";
                        }
                    }
                    
                    qry += " ] } ";
                    
                    console.log(qry);

                    db.collection("event_data_v0_1").find(JSON.parse(qry)).toArray(function(queryErr, events) {
                        
                        console.log(events);
                        
                        async.each(events, function(event, callback) {

                            //loop through targets to check that one of them is orig_artist_name
                            for(var sub_target_num = 0; sub_target_num < Object.keys(event.targets).length; sub_target_num++){

                                var target = event.targets[sub_target_num];

                                if(target == orig_artist_name){
                                    all_events.push(event);
                                }
                            }
                        });  
                        response.send( { events : all_events } );
                    });
                }
            ], function (error, all_events) {
                if (error) { console.log(error); }
                else{
                    
                }
            });
        }
    });
});
app.get('/search_related_artists_from_artist/:artist_id', function(request, response) {

    var url = process.env.MONGODB_URI;
    var identifier = request.params.event_id;

    MongoClient.connect(url, function(err, db) {
        if(err){ console.log(err); }
        else{
            console.log(identifier);
            var object = BSON.ObjectID.createFromHexString(identifier);
            
            //db.collection("event_data_v0_1").find(JSON.parse(qry)).toArray(function(queryErr, docs) {
            db.collection("artist_data_v0_1").find( { _id : object } ).toArray(function(queryErr, docs) {
                
                var object = new Array();
                
                for(var i = 0; i < docs.length; i++){
                    
                    object.push(docs.targets);
                    
                }
                
                console.log(object);
                
                response.send({targetsObject : docs[0]});
                
            });

            
        }
    });
});

// ### Page to serve and error page on unrecognised url path ###
app.get('/*', function(req, res, next) {
    console.log("unrecognised url");
    res.render("pages/error.ejs");
    
});

//pages that are not in the current release design but may used later on
//app.get('/', function(request, response) { response.render('pages/splash'); });

// ## Launch application ###
app.listen(app.get('port'), function() { console.log('Node app is running on port', app.get('port')); });