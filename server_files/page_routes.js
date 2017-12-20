// routes/index.js
var router = require('express').Router();
var cookie_parser = require('./cookie_parsing.js');

//model dependencies
var db_ref = require("./db_config.js"); //get database reference object

var check_authentication = function(request, response, next){
    
    //extract data for use later
    var db_url = process.env.MONGODB_URI; //get db uri
    var session_details = request.body; //get form data

    console.log(session_details);
    console.log(request.headers);
    
    var cookies = cookie_parser.parse_cookies(request);
    
    console.log(cookies);
    
    //store data temporarily until submission is confirmed
    db_ref.get_db_object().connect(db_url, function(err, db) {
        if(err){ console.log(err); }
        else{
            
            var query_object = { token: cookies.auth_cookie };
            
            if(session_details.ip_address){
                query_object.ip_address = session_details.ip_address;
            }
            
            console.log(query_object);
            
            //standard query to insert into live events table
            db.collection(db_ref.get_session_table()).aggregate([{ $match: query_object }]).toArray(function(err, auth_arr){
                if(err){ console.log(err); }
                else if(auth_arr.length < 1){
                    console.log(auth_arr)
                    response.render('pages/authentication/auth.ejs');
                }
                else{
                    next();   
                }
            });
        }
    });
}

if(process.env.DEPLOYMENT_ENV == "heroku_production"){ //only apply https redirect if deployed on a heroku server
    /* Detect any http requests, if found, redirect to https, otherwise continue to other routes */
    router.get("*", function(req,res,next){
        if(req.headers["x-forwarded-proto"] != "https"){
            res.redirect("https://www.beeftracker.co.uk"+req.url)
        }
        else{
            next();
        }
    });
}
router.get('/', function(request, response) { response.render('pages/dynamic_pages/home.ejs'); }); //home page
router.get('/splash_zone_html/', function(request, response) { response.render('partials/home/splash_zone.ejs'); }); // splash zone directive html
router.get('/top_events_html/', function(request, response) { response.render('partials/home/top_events_zone.ejs'); }); // top events directive html
router.get('/header_html/', function(request, response) { response.render('partials/header.ejs'); }); // header directive html
router.get('/footer_html/', function(request, response) { response.render('partials/footer.ejs'); }); // header directive html
router.get('/beef/:tagId', function(request, response) { response.render('pages/dynamic_pages/beef.ejs'); }); //beef page
router.get('/actor/:tagId', function(request, response) { response.render('pages/dynamic_pages/actor.ejs'); }); //actor page
router.get('/add_beef/', function(request, response) { response.render('pages/form_pages/submit_event.ejs'); }); // submit beefdata page page
router.get('/raw_add_actor/', function(request, response) { response.render('partials/submit_data/raw_add_actor.ejs'); }); // add_actor form abstract
router.get('/add_actor/', function(request, response) { response.render('pages/form_pages/submit_actor.ejs'); }); // submit actordata page
router.get('/list/:tagId', function(request, response) { response.render('pages/dynamic_pages/list.ejs'); }); // submit actordata page
router.get('/subscribe/', function(request, response) { response.render('pages/form_pages/subscribe_to_news.ejs'); }); // submit actordata page
router.get('/contact_us/', function(request, response) { response.render('pages/static_pages/contact_us.ejs'); }); // contact us page
router.get('/about/', function(request, response) { response.render('pages/static_pages/about_us.ejs'); }); // about_us page
router.get('/submission_confirmation/', function(request, response) { response.render('pages/static_pages/submit_conf.ejs'); }); // about_us page
router.get('/terms_of_use/', function(request, response) { response.render('pages/static_pages/terms_of_use.ejs'); }); // about_us page
router.get('/scraping_dump/', check_authentication, function(request, response) { response.render('pages/admin_pages/scraping_control/scraping_dump_viewer.ejs'); }); // about_us page
router.get('/recently_added/', check_authentication, function(request, response) { response.render('pages/admin_pages/site_config/recently_confirmed.ejs'); }); // about_us page
router.get('/raw_actor_scraping_html/', check_authentication, function(request, response) { response.render('partials/scraping_dump/raw_actor_scraping.ejs'); }); // raw actor scraping page route
router.get('/broken_fields_stats/', check_authentication, function(request, response) { response.render('pages/admin_pages/scraping_control/broken_fields_stats.ejs'); }); // raw actor scraping page route
router.get('/authenticate/', function(request, response) { response.render('pages/authentication/auth.ejs'); }); // raw actor scraping page route

router.get('/sitemap', function(req, res) {
    sitemap.toXML( function (err, xml) {
        if (err) {
            return res.status(500).end();
        }
        res.header('Content-Type', 'application/xml');
        res.send( xml );
  });
});

module.exports = router;