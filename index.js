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

// ### External Dependencies ###
var express = require('express'); //server library
var app = express();
var bodyParser = require('body-parser'); //library to assist with parsing data to readable content
var methodOverride = require('method-override');
var path = require('path');
var sitemap_generator = require('sitemap');
var mime = require('mime-types');
var multer = require('multer'); //library to assist with file storage
var morgan = require("morgan"); //library to provide more detailed logs
var jade = require('pug');

// ### Internal Dependencies ###
var storage_ref = require("./server_files/config/storage_config.js");

// ## Storage method configuration ##
if(storage_ref.get_upload_method() == "cloudinary"){
    var memoryStorage = multer.memoryStorage();
    var memoryUpload = multer({
        storage: memoryStorage,
        limits: {fileSize: 500000, files: 1}
    }).single('attachment');
}
else if(storage_ref.get_upload_method() == "local"){

    var storage_event = multer.diskStorage({
      destination: function (req, file, cb) {
          console.log(file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        cb(null, "public/assets/images/events/")
      },
      filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
      }
    }); //multer config options

    var storage_actor = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, "public/assets/images/actors/")
      },
      filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
      }
    }); //multer config options

    var upload_event_img = multer({storage: storage_event}); //build upload handlers
    var upload_actor_img = multer({storage: storage_actor}); //build upload handlers
}
console.log("Storage Method: " + storage_ref.get_upload_method());

// ## Sitemap generation ###
sitemap = sitemap_generator.createSitemap ({
    hostname: 'http://www.beeftracker.co.uk',
    cacheTime: 600000,        // 600 sec - cache purge period 
    urls: [
        { url: '/home/', changefreq: 'weekly', priority: 0.9 },
        { url: '/actor/{{%20trustSrc(url)%20}}', changefreq: 'weekly',  priority: 0.6 },
        { url: '/beef/{{%20trustSrc(url)%20}}', changefreq: 'weekly',  priority: 0.8 },
        { url: '/add_beef/', changefreq: 'weekly',  priority: 0.7 },
        { url: '/add_actor/', changefreq: 'weekly',  priority: 0.7 },
        { url: '/about_us/', changefreq: 'weekly',  priority: 0.3 },
        { url: '/contact_us/', changefreq: 'weekly',  priority: 0.3 },
        { url: '/error/', changefreq: 'weekly',  priority: 0.4 },
    ]
});

// ### Configure node variables ###
app.set('port', (process.env.PORT || 5000));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
//app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(morgan("dev"));
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});

// ### Directory routes ###
if(storage_ref.get_upload_method() == "local"){
    app.use('/actor_images', express.static(__dirname + '/public/assets/images/actors/')); //route to reference images
    app.use('/event_images', express.static(__dirname + '/public/assets/images/events/')); //route to reference images
}
//app.use('/background_images', express.static(__dirname + '/public/assets/images/backgrounds/')); //route to reference images
app.use('/logo', express.static(__dirname + '/public/assets/images/logo/')); //route to reference images
app.use('/stylesheets', express.static(__dirname + '/public/stylesheets/')); //route to reference css scripts
app.use('/js', express.static(__dirname + '/public/javascript/')); //route to reference controller scripts
app.use('/modules', express.static(__dirname + '/node_modules/')); //route to reference client libraries
app.use('/bower_components', express.static(__dirname + '/bower_components/')); //route to reference css scripts
app.use('/controllers', express.static(__dirname + '/public/components/')); //route to reference controller scripts
//app.use('/controllers', express.static(__dirname + '/public/controllers/')); //route to reference controller scripts
//app.use('/directives', express.static(__dirname + '/public/directives/')); //route to reference controller scripts
//app.use('/partials', express.static(__dirname + '/views/partials/')); //route to reference css scripts

// ### Page routes configuration file ###
app.use('/', require('./server_files/routing/page_routing'));

// ### Endpoint routes configuration ###
app.use('/api', require('./server_files/routing/endpoint_routing'));

// ### Component routes configuration ###
app.use('/template', require('./server_files/routing/template_routing'));


/*

// ### GET endpoints ###
app.get('/get_event_categories/', require('./server_files/models/GET/get_event_categories.js').execute); //handle retrieval of possible event categories
app.get('/get_splash_zone_data/', require('./server_files/models/GET/get_splash_zone_data.js').execute); //handle retrieval of splash zone data 
app.get('/search_actors_by_id/:actor_id', require('./server_files/models/GET/search_actors_by_id.js').execute); //retrieve an actor based on the provided actor_id
app.get('/search_actors_by_stage_name/:actor_name', require('./server_files/models/GET/search_actors_by_stage_name.js').execute); //retrieve an actor based on the provided stage_name
app.get('/search_actors_by_all_names/:actor_name', require('./server_files/models/GET/search_actors_by_all_names.js').execute); //retrieve an actor based on the provided stage_name
app.get('/search_all_actors/', require('./server_files/models/GET/search_all_actors.js').execute); //retrive all actors in the actors table
app.get('/search_all_events/', require('./server_files/models/GET/search_all_events.js').execute); //retrieve all events in the events table
app.get('/search_all_related_events_in_timeline_by_id/:event_id', require('./server_files/models/GET/search_all_related_events_in_timeline_by_id.js').execute); //complex, (almost recursive) algorithm to retrieve all events in an event chain based on a provided event_id
app.get('/search_all/:search_term', require('./server_files/models/GET/search_all.js').execute); //search through event titles and actor stage_names based on a provided search term. (needs work 31/07/17)
app.get('/search_events_by_event_aggressor/:actor_id', require('./server_files/models/GET/search_events_by_event_aggressor.js').execute); //retrieve all events which have aggressors matching the provided actor_id
app.get('/search_events_by_id/:event_id', require('./server_files/models/GET/search_events_by_id.js').execute); //retrieve an event based on the provided event_id
app.get('/search_popular_events/:num_of_events', require('./server_files/models/GET/search_popular_events.js').execute); //retrieve the provided number of events based on which have the most requests
app.get('/search_recent_events/:num_of_events', require('./server_files/models/GET/search_recent_events.js').execute); //retrieve the provided number of events based on which have been added most recently
app.get('/search_related_actors_by_id/:actor_id', require('./server_files/models/GET/search_related_actors_by_id.js').execute); //retrieve actors related to a provided actor
app.get('/get_scraped_events_dump/', token_authentication.authenticate_admin_user_token, require('./server_files/models/GET/admin/get_scraped_events_dump.js').get_events); //retrieve all scraped events, by the python beeftracker scraping module
app.get('/get_scraped_events_dump_num/', token_authentication.authenticate_admin_user_token, require('./server_files/models/GET/admin/get_scraped_events_dump.js').get_num_of_events); //retrieve all scraped events, by the python beeftracker scraping module
app.get('/scrape_actor/:actor_name', token_authentication.authenticate_admin_user_token, require('./server_files/models/GET/admin/scrape_and_return_actor_data.js').execute); //use the provided actor name to generate a data dump about that actor
app.get('/get_broken_fields_stats/', token_authentication.authenticate_admin_user_token, require('./server_files/models/GET/admin/get_broken_fields_data.js').execute); //use the provided actor name to generate a data dump about that actor
app.get('/get_beef_chain_events/:beef_chain_id', require('./server_files/models/GET/get_beef_chain_events.js').execute); //use the provided actor name to generate a data dump about that actor

// ### DELETE endpoints ###
app.delete('/discard_scraped_beef_event/', token_authentication.authenticate_admin_user_token, require('./server_files/models/DELETE/admin/discard_scraped_beef_event.js').execute); //remove data about a scraped beef event by id

// ### POST endpoints ###
if(storage_ref.get_upload_method() == "cloudinary"){
    app.post('/submit_beefdata/', memoryUpload, require('./server_files/models/POST/submit_beefdata.js').execute); //organise, verify and insert user provided beef data to database and save provided image file
    app.post('/submit_actordata/', memoryUpload, require('./server_files/models/POST/submit_actordata.js').execute); //organise, verify and insert user provided actor data to database and save provided image file
}
else if(storage_ref.get_upload_method() == "local"){
    app.post('/submit_beefdata/', upload_event_img.single('attachment'), require('./server_files/models/POST/submit_beefdata.js').execute); //organise, verify and insert user provided beef data to database and save provided image file
    app.post('/submit_actordata/', upload_actor_img.single('attachment'), require('./server_files/models/POST/submit_actordata.js').execute); //organise, verify and insert user provided actor data to database and save provided image file
}

// ### POST endpoints ###
app.post('/set_splash_zone_events/', token_authentication.authenticate_admin_user_token, require('./server_files/models/POST/admin/site_config/set_splash_zone_events.js').execute); //set which events will be displayed in the splash zone on the home page

// ## AUTH endpoints ###
app.post('/auth_user/', require('./server_files/models/POST/authentication/authenticate_user.js').auth_user); //authenticate any user and set-cookie an auth token
app.post('/auth_admin_user/', require('./server_files/models/POST/authentication/authenticate_user.js').auth_admin_user); //authenticate an admin user and set-cookie an auth token
app.post('/deauth_user/', require('./server_files/models/POST/authentication/deauthenticate_user.js').execute); //force all auth cookies to expire immediately
app.post('/register_user/', require('./server_files/models/POST/user_profile/register_user.js').execute); //take new user data and save it
app.post('/update_user_info/', token_authentication.authenticate_admin_user_token, require('./server_files/models/POST/user_profile/update_user_information.js').execute); //update any field of an existing user
app.post('/reset_lost_password/', require('./server_files/models/POST/user_profile/reset_lost_password.js').execute); //update any field of an existing user
*/

// ### Search engine information/verification files ###
app.get('/google3fc5d5a06ad26a53.html', function(request, response) { response.sendFile(__dirname + '/views/verification_files/google3fc5d5a06ad26a53.html'); }); //google verification
app.get('/BingSiteAuth.xml', function(request, response) { response.sendFile(__dirname + '/views/verification_files/BingSiteAuth.xml'); });
app.get('/robots.txt', function(request, response) { response.sendFile(__dirname + '/views/verification_files/robots.txt'); }); //robots config file

// ### Serve an error page on unrecognised uri###
app.get('/*', function(req, res, next) { res.render("pages/static_pages/error.ejs"); });

// ### Launch application ####
app.listen(app.get('port'), function() { console.log('Node app is running on port', app.get('port')); });