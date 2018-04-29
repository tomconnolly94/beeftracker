//external dependencies
var router = require("express").Router();
var async = require("async");

//internal dependencies
var db_ref = require("../config/db_config.js"); //get database reference object
var token_authentication = require("../tools/token_authentication.js"); //get token authentication object
var globals = require("../config/globals.js")

//endpoint controllers
var actor_controller = require("../controllers/actors_controller.js");
var event_controller = require("../controllers/events_controller.js");
var comment_controller = require("../controllers/comments_controller.js");
var category_controller = require("../controllers/event_categories_controller.js");
var user_controller = require("../controllers/users_controller.js");

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

router.get("/", function(request, response){
    
    var featured_data_promise = new Promise(function(resolve, reject){
        event_controller.findEvents({ limit: 3, featured: true, decreasing_order: "date_added" }, function(data){
            resolve(data);
        });
    });
    
    var grid_data_promise = new Promise(function(resolve, reject){
       event_controller.findEvents({ limit: 6, featured: false }, function(data){
           resolve(data);
        });
    });
    
    var slider_data_promise = new Promise(function(resolve, reject){
         event_controller.findEvents({ limit: 12, featured: false, increasing_order: "date_added" }, function(data){
            resolve(data);
        });
    });
    
    var category_event_data_promise = new Promise(function(resolve, reject){
       event_controller.findEvents({ match_category: "0", limit: 6 }, function(data){
           resolve(data);
        });
    });
    
    var categories_promise = new Promise(function(resolve, reject){
       category_controller.getEventCategories(function(data){
           resolve(data);
        });
    });

    Promise.all([ featured_data_promise, grid_data_promise,/* slider_data_promise,*/ category_event_data_promise, categories_promise ]).then(function(values) {
        response.render("pages/home.jade", { file_server_url_prefix: globals.file_server_url_prefix, server_rendered: true, featured_data: values[0], grid_data: values[1], /*slider_data: values[2] */ category_event_data: values[2], categories: values[3] });
    }).catch(function(error){
        console.log(error);
    });
    
    
}); //home page
router.get("/about", function(request, response) {
    response.render("pages/about.jade");
}); // about_us page
router.get("/actors", function(request, response) { 
    
    //access data from db
    var actors_promise = new Promise(function(resolve, reject){
       actor_controller.findActors({ limit: 12 }, function(data){
           resolve(data);
        });
    });

    Promise.all([ actors_promise ]).then(function(values) {
        response.render("pages/actors.jade", { file_server_url_prefix: globals.file_server_url_prefix, server_rendered: true, actor_data: values[0] });
    }).catch(function(error){
        console.log(error);
    });
}); // about_us page
router.get("/actor/:actor_id", function(request, response) { 

    //extract data
    var actor_id = request.params.actor_id;
    
    //access data from db
    var actor_data_promise = new Promise(function(resolve, reject){
       actor_controller.findActor(actor_id, function(data){
           console.log(data);
           console.log(data.related_actors);
           resolve(data);
        });
    });

    Promise.all([ actor_data_promise ]).then(function(values) {
        response.render("pages/actor.jade", { file_server_url_prefix: globals.file_server_url_prefix, server_rendered: true, actor_data: values[0] });
    }).catch(function(error){
        console.log(error);
    });
}); //actor page
router.get("/add-beef", function(request, response) {

    var actor_data_promise = new Promise(function(resolve, reject){
        actor_controller.findActors({ increasing_order: "name" }, function(data){
            resolve(data);
        });
    });
    
    var categories_promise = new Promise(function(resolve, reject){
       category_controller.getEventCategories(function(data){
           resolve(data);
        });
    });
    
    Promise.all([ actor_data_promise, categories_promise ]).then(function(data){
        response.render("pages/add_beef.jade", { file_server_url_prefix: globals.file_server_url_prefix, server_rendered: true, actor_data: data[0], gallery_items: [], categories: data[1] }); 
    });
}); // submit beefdata page page
router.get("/beef", function(request, response) { 
    
    var events_data_promise = new Promise(function(resolve, reject){
       event_controller.findEvents({ decreasing_order: "date_added", limit: 12 }, function(data){
            resolve(data);
        });
    });
    
    var category_event_data_promise = new Promise(function(resolve, reject){
       event_controller.findEvents({ match_category: "0", limit: 6 }, function(data){
           resolve(data);
        });
    });
    
    var categories_promise = new Promise(function(resolve, reject){
       category_controller.getEventCategories(function(data){
           resolve(data);
        });
    });
    
    var slider_data_promise = new Promise(function(resolve, reject){
         event_controller.findEvents({ limit: 12, featured: false, increasing_order: "date_added" }, function(data){
            resolve(data);
        });
    });
    
    Promise.all([ events_data_promise, category_event_data_promise, categories_promise, slider_data_promise ]).then(function(data){
        response.render("pages/beefs.jade", { file_server_url_prefix: globals.file_server_url_prefix, server_rendered: true, grid_data: data[0], category_event_data: data[1], categories: data[2], slider_data: data[3] }); 
    });
}); //beef page
router.get("/beef/:beef_chain_id/:event_id", function(request, response) { 

    //extract data
    var event_id = request.params.event_id;    
    var beef_chain_id = request.params.beef_chain_id;
        
    var main_event_data_promise = new Promise(function(resolve, reject){
        event_controller.findEvent(event_id, function(data){
            let data_object = { event_data: data };
            
            event_controller.findEvents({ match_actor: data_object.event_data.aggressors[0]._id, limit: 5, decreasing_order: "date_added" }, function(data){
                data_object.related_events = data;
                resolve(data_object);
            });
        });
    });
    
    var comment_data_promise = new Promise(function(resolve, reject){
       comment_controller.findCommentsFromBeefChain(beef_chain_id, function(data){
            resolve(data);
        });
    });

    Promise.all([ main_event_data_promise, comment_data_promise ]).then(function(values) {
        response.render("pages/beef.jade", { file_server_url_prefix: globals.file_server_url_prefix, current_beef_chain_id: beef_chain_id, server_rendered: true, event_data: values[0].event_data, comment_data: values[1], related_events: values[0].related_events });
    }).catch(function(error){
        console.log(error);
    });
}); //beef page
router.get("/contact", function(request, response) { 
    
    var trending_data_promise = new Promise(function(resolve, reject){
        event_controller.findEvents({ limit: 3, featured: true }, function(data){
            resolve(data);
        });
    });
    
    trending_data_promise.then(function(data){
        response.render("pages/contact.jade", { file_server_url_prefix: globals.file_server_url_prefix, server_rendered: true, trending_data: data }); 
    });
}); // contact us page
router.get("/user/:user_id", function(request, response) { 

    //extract data
    var user_id = request.params.user_id;
    
    //access data from db
    var user_data_promise = new Promise(function(resolve, reject){
       user_controller.findUser(user_id, false, function(data){
           console.log(data);
           resolve(data);
        });
    });

    Promise.all([ user_data_promise ]).then(function(values) {
        response.render("pages/user_profile.jade", { file_server_url_prefix: globals.file_server_url_prefix, server_rendered: true, user_data: values[0] });
    }).catch(function(error){
        console.log(error);
    });
}); //actor page
router.get("/privacy-policy", function(request, response){ response.render("pages/peripheral_pages/privacy_policy.jade"); });
router.get("/terms-and-conditions", function(request, response){ response.render("pages/peripheral_pages/terms_and_conditions.jade"); });
router.get("/disclaimer", function(request, response){ response.render("pages/peripheral_pages/disclaimer.jade"); });

/*
router.get("/subscribe/", function(request, response) { response.render("pages/form_pages/subscribe_to_news.ejs"); }); // submit actordata page
router.get("/submission_confirmation/", function(request, response) { response.render("pages/static_pages/submit_conf.ejs"); }); // about_us page
router.get("/terms_of_use/", function(request, response) { response.render("pages/static_pages/terms_of_use.ejs"); }); // about_us page
router.get("/scraping_dump/", token_authentication.authenticate_admin_user_token, function(request, response) { response.render("pages/admin_pages/scraping_control/scraping_dump_viewer.ejs"); }); // about_us page
router.get("/recently_added/", token_authentication.authenticate_admin_user_token, function(request, response) { response.render("pages/admin_pages/site_config/recently_confirmed.ejs"); }); // about_us page
router.get("/raw_actor_scraping_html/", token_authentication.authenticate_admin_user_token, function(request, response) { response.render("partials/scraping_dump/raw_actor_scraping.ejs"); }); // raw actor scraping page route
router.get("/broken_fields_stats/", token_authentication.authenticate_admin_user_token, function(request, response) { response.render("pages/admin_pages/scraping_control/broken_fields_stats.ejs"); }); // raw actor scraping page route
router.get("/admin_login/", function(request, response) { response.render("pages/authentication/admin_login.ejs"); }); // raw actor scraping page route*/
router.get("/reset-my-password/:id_token", function(request, response) { 
    
    var id_token = request.params.id_token;
    
    db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
        if(err){ console.log(err); }
        else{
            db.collection(db_ref.get_password_reset_request_table()).find({ id_token: id_token}).toArray(function(err, auth_arr){
                if(err){ console.log(err); }
                else{
                    
                    if(auth_arr.length == 1){
                        console.log("valid");
                        //response.render("pages/"); //serve page that allows user to set a new password
                    }
                    else{
                        console.log("invalid");
                        //response.render("pages/"); //serve "token is invalid" page
                    }
                }
            });
        }
    });

}); // raw actor scraping page route

router.get("/sitemap", function(req, res) {
    sitemap.toXML( function (err, xml) {
        if (err) {
            return res.status(500).end();
        }
        res.header("Content-Type", "application/xml");
        res.send( xml );
  });
});

module.exports = router;