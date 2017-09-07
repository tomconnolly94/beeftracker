// routes/index.js
var router = require('express').Router();

router.get('/', function(request, response) { response.render('pages/dynamic_pages/home.ejs'); }); //home page
router.get('/splash_zone_html/', function(request, response) { response.render('partials/home/splash_zone.ejs'); }); // splash zone directive html
router.get('/top_events_html/', function(request, response) { response.render('partials/home/top_events_zone.ejs'); }); // top events directive html
router.get('/header_html/', function(request, response) { response.render('partials/header.ejs'); }); // header directive html
router.get('/beef/:tagId', function(request, response) { response.render('pages/dynamic_pages/beef.ejs'); }); //beef page
router.get('/actor/:tagId', function(request, response) { response.render('pages/dynamic_pages/actor.ejs'); }); //actor page
router.get('/add_beef/', function(request, response) { response.render('pages/form_pages/submit_event.ejs'); }); // submit beefdata page page
router.get('/raw_submit_actor/', function(request, response) { response.render('partials/submit_data/raw_submit_actor.ejs'); }); // add_actor form abstract
router.get('/add_actor/', function(request, response) { response.render('pages/form_pages/submit_actor.ejs'); }); // submit actordata page
router.get('/list/:tagId', function(request, response) { response.render('pages/dynamic_pages/list.ejs'); }); // submit actordata page
router.get('/subscribe/', function(request, response) { response.render('pages/form_pages/subscribe_to_news.ejs'); }); // submit actordata page
router.get('/contact_us/', function(request, response) { response.render('pages/static_pages/contact_us.ejs'); }); // contact us page
router.get('/about/', function(request, response) { response.render('pages/static_pages/about_us.ejs'); }); // about_us page
router.get('/submission_confirmation/', function(request, response) { response.render('pages/static_pages/submit_conf.ejs'); }); // about_us page
router.get('/terms_of_use/', function(request, response) { response.render('pages/static_pages/terms_of_use.ejs'); }); // about_us page
router.get('/scraping_dump/', function(request, response) { response.render('pages/admin_pages/scraping_dump_viewer.ejs'); }); // about_us page
router.get('/sitemap', function(req, res) {
    sitemap.toXML( function (err, xml) {
        if (err) {
            return res.status(500).end();
        }
        res.header('Content-Type', 'application/xml');
        res.send( xml );
  });
}); // access to sitemap generated above
/*
require('./dynamic_routes/search_events_by_id.js');
require('./dynamic_routes/search_all.js');
require('./dynamic_routes/search_actors_by_id.js');
require('./dynamic_routes/search_actors_by_stage_name.js');
require('./dynamic_routes/search_related_actors_by_id.js');
require('./dynamic_routes/search_events_by_event_aggressor.js');
require('./dynamic_routes/search_all_related_events_in_timeline_by_id.js');
require('./dynamic_routes/search_all_actors.js');
require('./dynamic_routes/search_all_events.js');
require('./dynamic_routes/get_event_categories.js');
require('./dynamic_routes/search_popular_events.js');*/

module.exports = router;