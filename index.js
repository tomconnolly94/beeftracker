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
var compression = require('compression');
var validation_controller = require("./server_files/validation/validation_controller");
var validator = require('express-validator');

//configure validator
app.use(validator({
    customValidators: validation_controller.get_all_custom_validation_functions()
}));

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
app.use(compression());

app.use('/logo', express.static(__dirname + '/public/assets/images/logo/v3')); //route to reference logo images
app.use('/images', express.static(__dirname + '/public/assets/images/other_graphics')); //route to reference logo images
app.use('/stylesheets', express.static(__dirname + '/public/css/')); //route to reference css scripts
app.use('/webfonts', express.static(__dirname + '/public/fonts/')); //route to reference css scripts
app.use('/js', express.static(__dirname + '/public/javascript/')); //route to reference javascript files
app.use('/modules', express.static(__dirname + '/node_modules/')); //route to reference npm library files
app.use('/bower_components', express.static(__dirname + '/bower_components/')); //route to reference bower library files
app.use('/component_controllers', express.static(__dirname + '/views/templates/components/')); //route to reference client side controller scripts

//route for service worker script must be here to allow it to cache files globally across the site
app.get("/service_worker", function(request, response){
    response.sendFile(__dirname + "/public/javascript/service_worker/service_worker.js")
});

// ### Page routes configuration file ###
app.use('/', require('./server_files/routing/page_routing'));
 
// ### Endpoint routes configuration ###
app.use('/api', require('./server_files/routing/endpoint_routing'));

// ### Rendered component routes configuration ###
app.use('/templates', require('./server_files/routing/template_routing')); //routes send rendered HTML

// ### Component rendering function routes configuration ###
app.use('/template_functions', require('./server_files/routing/template_function_routing')); //routes send javascript functions which render HTML on the client side

//################################################################################## TESTING AREA START


//################################################################################## TESTING AREA END

// ### Search engine information/verification files ###
app.get('/google3fc5d5a06ad26a53.html', function(request, response) { response.sendFile(__dirname + '/views/verification_files/google3fc5d5a06ad26a53.html'); }); //google verification
app.get('/BingSiteAuth.xml', function(request, response) { response.sendFile(__dirname + '/views/verification_files/BingSiteAuth.xml'); });
app.get('/robots.txt', function(request, response) { response.sendFile(__dirname + '/views/verification_files/robots.txt'); }); //robots config file
app.get('/manifest.webmanifest', function(request, response) { 
    response.send({
        "name": "Beeftracker",
        "short_name": "Beeftracker",
        "lang": "en-GB",
        "start_url": "https://www.beeftracker.co.uk/",
        "display": "standalone",
        "background_color": "#000000",
        "theme_color": "#000000",
        "description": "Beeftracker is a brand new web application designed to bring you the very latest in beef-related news! Visit the site: beeftracker.co.uk.",
        "icons": [{
            "src": "logo/beeftracker_new_logo_cropped_small.ico",
            "sizes": "256x256"
        }]
    });
}); //web app manifest

// ### Serve an error page on unrecognised uri###
//app.get('/*', function(req, res, next) { res.render("pages/static_pages/error.ejs"); });

// ### Launch application ####
app.listen(app.get('port'), function(){ console.log('Node app is running on port', app.get('port'), 'in', process.env.NODE_ENV, 'mode'); });