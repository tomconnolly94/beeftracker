//external dependencies
var router = require('express').Router();

//internal dependencies
var db_ref = require("../config/db_config.js"); //get database reference object
var token_authentication = require("../tools/token_authentication.js"); //get token authentication object

if(process.env.NODE_ENV == "heroku_production"){ //only apply https redirect if deployed on a heroku server
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
router.get('/', function(request, response) {     
    
    
    
    response.render('pages/home.jade');
}); //home page
/*
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
router.get('/scraping_dump/', token_authentication.authenticate_admin_user_token, function(request, response) { response.render('pages/admin_pages/scraping_control/scraping_dump_viewer.ejs'); }); // about_us page
router.get('/recently_added/', token_authentication.authenticate_admin_user_token, function(request, response) { response.render('pages/admin_pages/site_config/recently_confirmed.ejs'); }); // about_us page
router.get('/raw_actor_scraping_html/', token_authentication.authenticate_admin_user_token, function(request, response) { response.render('partials/scraping_dump/raw_actor_scraping.ejs'); }); // raw actor scraping page route
router.get('/broken_fields_stats/', token_authentication.authenticate_admin_user_token, function(request, response) { response.render('pages/admin_pages/scraping_control/broken_fields_stats.ejs'); }); // raw actor scraping page route
router.get('/admin_login/', function(request, response) { response.render('pages/authentication/admin_login.ejs'); }); // raw actor scraping page route*/
router.get('/reset-my-password/:id_token', function(request, response) { 
    
    var id_token = request.params.id_token;
    
    db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
        if(err){ console.log(err); }
        else{
            db.collection(db_ref.get_password_reset_request_table()).find({ id_token: id_token}).toArray(function(err, auth_arr){
                if(err){ console.log(err); }
                else{
                    
                    if(auth_arr.length == 1){
                        console.log("valid");
                        //response.render('pages/'); //serve page that allows user to set a new password
                    }
                    else{
                        console.log("invalid");
                        //response.render('pages/'); //serve 'token is invalid' page
                    }
                }
            });
        }
    });

}); // raw actor scraping page route


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