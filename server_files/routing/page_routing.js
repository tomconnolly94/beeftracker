//external dependencies
var router = require("express").Router();
var async = require("async");

//internal dependencies
var db_ref = require("../config/db_config.js"); //get database reference object
var token_authentication = require("../tools/token_authentication.js"); //get token authentication object
var globals = require("../config/globals.js")
var cookie_parser = require("../tools/cookie_parsing.js");
var token_authentication = require("../tools/token_authentication.js"); //get token authentication object

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

var view_parameters = { 
    file_server_url_prefix: globals.file_server_url_prefix,
    server_rendered: true
}

function calculate_event_rating(votes){
    var rating = Math.round( (votes.upvotes / ( votes.upvotes + votes.downvotes ) ) * 5 )
    return rating;
}

router.get("/", token_authentication.authenticate_page_route_with_user_token, function(request, response){
    
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
    
    var user_promise = new Promise(function(resolve, reject){
        if(request.locals && request.locals.authenticated_user){
            user_controller.findUser(request.locals.authenticated_user.id, request.locals.authenticated_user.is_admin, function(data){
               resolve(data);
            });
        }
        else{
            resolve(null);
        }
    });

    Promise.all([ featured_data_promise, grid_data_promise,/* slider_data_promise,*/ category_event_data_promise, categories_promise, user_promise ]).then(function(values) {
        
        view_parameters.featured_data = values[0];
        view_parameters.grid_data = values[1];
        view_parameters.category_event_data = values[2];
        view_parameters.categories = values[3];
        view_parameters.user_data = values[4];
        
        //calculate grid_data events ratings
        for(var i = 0; i < view_parameters.featured_data.length; i++){
            view_parameters.featured_data[i].rating = calculate_event_rating(view_parameters.featured_data[i].votes);
        }
        //calculate grid_data events ratings
        for(var i = 0; i < view_parameters.grid_data.length; i++){
            view_parameters.grid_data[i].rating = calculate_event_rating(view_parameters.grid_data[i].votes);
        }
        //calculate slider_data events ratings
        for(var i = 0; i < view_parameters.category_event_data.length; i++){
            view_parameters.category_event_data[i].rating = calculate_event_rating(view_parameters.category_event_data[i].votes);
        }
        
        response.render("pages/home.jade", view_parameters);
    }).catch(function(error){
        console.log(error);
    });
}); //home page
router.get("/about", function(request, response) {
    response.render("pages/about.jade", view_parameters);
}); // about_us page
router.get("/actors", function(request, response) { 
    
    //access data from db
    var actors_promise = new Promise(function(resolve, reject){
       actor_controller.findActors({ limit: 12 }, function(data){
           resolve(data);
        });
    });

    Promise.all([ actors_promise ]).then(function(values) {
        
        view_parameters.actor_data = values[0];
        
        response.render("pages/actors.jade", view_parameters);
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
           resolve(data);
        });
    });

    Promise.all([ actor_data_promise ]).then(function(values) {
        
        view_parameters.actor_data = values[0];
        
        response.render("pages/actor.jade", view_parameters);
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
    
    Promise.all([ actor_data_promise, categories_promise ]).then(function(values){
        
        view_parameters.actor_data = values[0];
        view_parameters.gallery_items = [];
        view_parameters.categories = values[1];
        
        response.render("pages/add_beef.jade", view_parameters); 
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
    
    Promise.all([ events_data_promise, category_event_data_promise, categories_promise, slider_data_promise ]).then(function(values){
        
        view_parameters.grid_data = values[0];
        view_parameters.category_event_data = values[1];
        view_parameters.categories = values[2];
        view_parameters.slider_data = values[3];
        
        //calculate grid_data events ratings
        for(var i = 0; i < view_parameters.grid_data.length; i++){
            view_parameters.grid_data[i].rating = calculate_event_rating(view_parameters.grid_data[i].votes);
        }
        //calculate grid_data events ratings
        for(var i = 0; i < view_parameters.category_event_data.length; i++){
            view_parameters.category_event_data[i].rating = calculate_event_rating(view_parameters.category_event_data[i].votes);
        }
        //calculate slider_data events ratings
        for(var i = 0; i < view_parameters.slider_data.length; i++){
            view_parameters.slider_data[i].rating = calculate_event_rating(view_parameters.slider_data[i].votes);
        }
        
        response.render("pages/beefs.jade", view_parameters); 
    });
}); //beef page
router.get("/beef/:beef_chain_id/:event_id", function(request, response) { 

    var cookies = cookie_parser.parse_cookies(request);

    //extract data
    var event_id = request.params.event_id;    
    var beef_chain_id = request.params.beef_chain_id;
    var disable_voting = false;
        
    if(cookies.beef_ids_voted_on && cookies.beef_ids_voted_on.split(",").indexOf(event_id) != -1){
        disable_voting = true;
    }
    
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
        
        view_parameters.current_beef_chain_id = beef_chain_id;
        view_parameters.event_data = values[0].event_data;
        view_parameters.event_data.rating = calculate_event_rating(view_parameters.event_data.votes);
        view_parameters.comment_data = values[1];
        view_parameters.related_events = values[0].related_events;
        view_parameters.disable_voting = disable_voting;
        
        response.render("pages/beef.jade", view_parameters);
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
    
    trending_data_promise.then(function(value){
        
        view_parameters.trending_data = value;
        
        response.render("pages/contact.jade", view_parameters); 
    });
}); // contact us page
router.get("/user/:user_id", token_authentication.authenticate_page_route_with_user_token, function(request, response) { 

    //extract data
    var user_id = request.params.user_id;
    
    //access data from db
    var user_data_promise = new Promise(function(resolve, reject){
       user_controller.findUser(user_id, false, function(data){
           resolve(data);
        });
    });
    
    if(request.locals && request.locals.authenticated_user){
        Promise.all([ user_data_promise ]).then(function(values) {

            view_parameters.user_data = values[0];

            response.render("pages/user_profile.jade", view_parameters);
        }).catch(function(error){
            console.log(error);
        });
    }
    else{
        response.redirect("/");
    }
}); //actor page
router.get("/privacy-policy", function(request, response){ response.render("pages/peripheral_pages/privacy_policy.jade", view_parameters); });
router.get("/terms-and-conditions", function(request, response){ response.render("pages/peripheral_pages/terms_and_conditions.jade", view_parameters); });
router.get("/disclaimer", function(request, response){ response.render("pages/peripheral_pages/disclaimer.jade", view_parameters); });

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