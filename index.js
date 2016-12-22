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
//var SSE = require('sse-nodejs');

// ### Configure node variables ###
app.set('port', (process.env.PORT || 5000));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());

// ### Directory routes ### 
app.use('/artist_images', express.static(__dirname + '/public/assets/images/artists/')); //route to reference images
app.use('/libraries', express.static(__dirname + '/libs/')); //route to reference libraries like angular
app.use('/modules', express.static(__dirname + '/node_modules/')); //route to reference libraries like angular
app.use('/controllers', express.static(__dirname + '/public/controllers/')); //route to reference controller scripts
app.use('/stylesheets', express.static(__dirname + '/public/stylesheets/')); //route to reference css scripts
app.use('/bower_components', express.static(__dirname + '/bower_components/')); //route to reference css scripts

// ### Permanent page routes ###
app.get('/', function(request, response) { response.render('pages/home.ejs'); });
app.get('/beef/:tagId', function(request, response) { response.render('pages/beef.ejs'); });
app.get('/artist/:tagId', function(request, response) { response.render('pages/artist.ejs'); });

// ### Temporary development pages ###
app.get('/beef_timeline', function(request, response) { response.render('pages/beef_timeline.ejs'); });
app.get('/beef_information', function(request, response) { response.render('pages/beef_information.ejs'); });

// ### Search functions ###
app.get('/search/:tagId', function(request, response) {

    var url = process.env.MONGODB_URI;
    var identifier = request.params.tagId;

    MongoClient.connect(url, function(err, db) {
        if(err){ console.log(err); }
        else{
            var field_name = 'event_id';
            
            /*
            //code to create a qry string that matches NEAR to query string
            var end = "{ \"$regex\": \"" + identifier + "\", \"$options\": \"i\" }";
            var qry = "{ \"" + field_name + "\" : " + end + " }";*/
            
            var qry = "{ \"" + field_name + "\" : \"" + identifier + "\" }";
            
            db.collection("event_data").find(JSON.parse(qry)).toArray(function(queryErr, docs) {
                response.send({eventObject : docs[0]});
                db.close()
            });

            db.close();
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
            
            db.collection("event_data").find(JSON.parse(qry)).toArray(function(queryErr, docs) {
                response.send( { events : docs } );
                db.close()
            });

            db.close();
        }
    });
    
});
app.get('/search_artist/:artist_id', function(request, response) {
    
    var url = process.env.MONGODB_URI;
    var identifier = request.params.artist_id;

    MongoClient.connect(url, function(err, db) {
        if(err){ console.log(err); }
        else{
            var field_name = 'artist_id';
            
            //code to create a qry string that matches NEAR to query string
            var end = "{ \"$regex\": \"" + identifier + "\", \"$options\": \"i\" }";
            var qry = "{ \"" + field_name + "\" : " + end + " }";
            
            db.collection("artist_data").find(JSON.parse(qry)).toArray(function(queryErr, docs) {
                response.send( { events : docs[0] } );
                db.close()
            });
            db.close();
        }
    });
});
app.get('/search_events_from_artist/:artist_name', function(request, response) {
    
    var url = process.env.MONGODB_URI;

    MongoClient.connect(url, function(err, db) {
        if(err){ console.log(err); }
        else{
            var field_name = 'aggressor';
            
            //code to create a qry string that matches NEAR to query string
            var end = "{ \"$regex\": \"" + identifier + "\", \"$options\": \"i\" }";
            var qry = "{ \"" + field_name + "\" : " + end + " }";
            
            db.collection("event_data").find(JSON.parse(qry)).sort({"date_added" : -1}).limit(3).toArray(function(queryErr, docs) {
                response.send( { events : docs } );
                db.close()
            });
            db.close();
        }
    });
    
});
app.get('/search_events_from_event_id/:event_id', function(request, response) {
    
    var url = process.env.MONGODB_URI;
    var identifier = request.params.event_id;

    MongoClient.connect(url, function(err, db) {
        if(err){ console.log(err); }
        else{
            var field_name = 'event_id';
            
            //code to create a qry string that matches NEAR to query string
            var end = "{ \"$regex\": \"" + identifier + "\", \"$options\": \"i\" }";
            var qry = "{ \"" + field_name + "\" : " + end + " }";
            
            db.collection("event_data").find(JSON.parse(qry)).sort({"date_added" : -1}).limit(3).toArray(function(queryErr, docs) {
                response.send( { events : docs } );
                db.close()
            });
            db.close();
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
            
            db.collection("event_data").find({}).sort({"date_added" : -1}).limit(limit).toArray(function(queryErr, docs) {
                response.send( { events : docs } );
                db.close()
            });
        }
    });
    
});
app.get('/search_all_events_in_timeline_from_event_id/:event_id', function(request, response) {
    
    var url = process.env.MONGODB_URI;
    var event_id = parseInt(request.params.event_id);
    
    MongoClient.connect(url, function(err, db) {
        if(err){ console.log(err); }
        else{
            async.waterfall([
                function(callback){
                    //mongo record field 
                    var field_name = 'event_id';
            
                    //code to create a qry string that matches NEAR to query string
                    var end = "{ \"$regex\": \"" + event_id + "\", \"$options\": \"i\" }";
                    var qry = "{ \"" + field_name + "\" : " + end + " }";

                    db.collection("event_data").find(JSON.parse(qry)).toArray(function(queryErr, main_event) {
                        
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

                    db.collection("event_data").find(JSON.parse(qry)).toArray(function(queryErr, events) {
                        
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

                    for(var target_num = 0; target_num < Object.keys(targets).length; target_num++){
                        qry += "{ \"" + field_name + "\" : \"" + targets[target_num] + "\" }";
                        if(target_num != Object.keys(targets).length-1){
                            qry += ", ";
                        }
                    }
                    
                    qry += " ] } ";

                    db.collection("event_data").find(JSON.parse(qry)).toArray(function(queryErr, events) {
                                                
                        console.log(events);
                        
                        async.each(events, function(event, callback) {

                                //loop through targets to check that one of them is orig_artist_name
                                for(var sub_target_num = 0; sub_target_num < Object.keys(event.targets).length; sub_target_num++){

                                    var target = event.targets[sub_target_num];
                                    
                                    if(target == orig_artist_name){
                                        all_events.push(event);
                                    }
                                }
                            console.log("length in loop" + all_events.length);
                            //callback(all_events);
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

//pages that are not in the current release design but may be in the next
//app.get('/', function(request, response) { response.render('pages/splash'); });

// ## Launch application ###
app.listen(app.get('port'), function() { console.log('Node app is running on port', app.get('port')); });