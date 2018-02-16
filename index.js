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
app.set('views', __dirname + '/views/templates');
//app.set('view engine', 'ejs');
app.set('view engine', 'pug');
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
app.use('/logo', express.static(__dirname + '/public/assets/images/logo/')); //route to reference images
app.use('/stylesheets', express.static(__dirname + '/public/stylesheets/')); //route to reference css scripts
app.use('/js', express.static(__dirname + '/public/javascript/')); //route to reference controller scripts
app.use('/modules', express.static(__dirname + '/node_modules/')); //route to reference client libraries
app.use('/bower_components', express.static(__dirname + '/bower_components/')); //route to reference css scripts
app.use('/controllers', express.static(__dirname + '/public/components/')); //route to reference controller scripts

// ### Page routes configuration file ###
app.use('/', require('./server_files/routing/page_routing'));

// ### Endpoint routes configuration ###
app.use('/api', require('./server_files/routing/endpoint_routing'));

// ### Rendered component routes configuration ###
app.use('/templates', require('./server_files/routing/template_routing')); //routes send rendered HTML

// ### Component rendering function routes configuration ###
app.use('/template_functions', require('./server_files/routing/template_function_routing')); //routes send javascript functions which render HTML on the client side

// ### Search engine information/verification files ###
app.get('/google3fc5d5a06ad26a53.html', function(request, response) { response.sendFile(__dirname + '/views/verification_files/google3fc5d5a06ad26a53.html'); }); //google verification
app.get('/BingSiteAuth.xml', function(request, response) { response.sendFile(__dirname + '/views/verification_files/BingSiteAuth.xml'); });
app.get('/robots.txt', function(request, response) { response.sendFile(__dirname + '/views/verification_files/robots.txt'); }); //robots config file

// ### Serve an error page on unrecognised uri###
app.get('/*', function(req, res, next) { res.render("pages/static_pages/error.ejs"); });

// ### Launch application ####
app.listen(app.get('port'), function() { console.log('Node app is running on port', app.get('port')); });