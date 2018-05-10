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

var view_parameters_global = { 
    file_server_url_prefix: globals.file_server_url_prefix,
    server_rendered: true
}

function calculate_event_rating(votes){
    var rating = Math.round( (votes.upvotes / ( votes.upvotes + votes.downvotes ) ) * 5 )
    return rating;
}

function resolve_user_from_locals_token(request, response, next){
    if(request.locals && request.locals.authenticated_user){
        user_controller.findUser(request.locals.authenticated_user.id, request.locals.authenticated_user.is_admin, function(data){
            if(data.failed){
                response.render("pages/static/error.jade");
            }
            else{
                request.locals.authenticated_user = data;
                next();
            }
        });
    }
    else{
        next();
    }
}

router.get("/", token_authentication.recognise_user_token, resolve_user_from_locals_token, function(request, response){
    
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
    
    Promise.all([ featured_data_promise, grid_data_promise, slider_data_promise, category_event_data_promise, categories_promise ]).then(function(values) {
        
        var view_parameters = Object.assign({}, view_parameters_global);
        view_parameters.featured_data = values[0];
        view_parameters.grid_data = values[1];
        view_parameters.slider_data = values[2];
        view_parameters.category_event_data = values[3];
        view_parameters.categories = values[4];
        view_parameters.user_data = request.locals && request.locals.authenticated_user ? request.locals.authenticated_user : null;
        /*
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
        */
        response.render("pages/home.jade", view_parameters);
    }).catch(function(error){
        console.log(error);
    });
}); //home page
router.get("/about", token_authentication.recognise_user_token, resolve_user_from_locals_token, function(request, response) {
    
    var view_parameters = Object.assign({}, view_parameters_global);
    view_parameters.user_data = request.locals && request.locals.authenticated_user ? request.locals.authenticated_user : null;
    view_parameters.server_version = process.env.BFTR_VERSION;
    
    response.render("pages/static/about.jade", view_parameters);
}); // about_us page
router.get("/actors", token_authentication.recognise_user_token, resolve_user_from_locals_token, function(request, response) { 
    
    //access data from db
    var actors_promise = new Promise(function(resolve, reject){
       actor_controller.findActors({ limit: 12 }, function(data){
           resolve(data);
        });
    });

    Promise.all([ actors_promise ]).then(function(values) {
        
        var view_parameters = Object.assign({}, view_parameters_global);
        view_parameters.actor_data = values[0];
        view_parameters.user_data = request.locals && request.locals.authenticated_user ? request.locals.authenticated_user : null;
        
        response.render("pages/actors.jade", view_parameters);
    }).catch(function(error){
        console.log(error);
    });
}); // about_us page
router.get("/actor/:actor_id", token_authentication.recognise_user_token, resolve_user_from_locals_token, function(request, response) { 

    //extract data
    var actor_id = request.params.actor_id;
    
    //access data from db
    var actor_data_promise = new Promise(function(resolve, reject){
       actor_controller.findActor(actor_id, function(data){
           if(data.failed){
                response.render("pages/static/error.jade");
            }
            else{
                resolve(data);
            }
        });
    });

    Promise.all([ actor_data_promise ]).then(function(values) {
        
        var view_parameters = Object.assign({}, view_parameters_global);
        view_parameters.actor_data = values[0];
        view_parameters.user_data = request.locals && request.locals.authenticated_user ? request.locals.authenticated_user : null;
        
        response.render("pages/actor.jade", view_parameters);
    }).catch(function(error){
        console.log(error);
    });
}); //actor page
router.get("/add-beef", token_authentication.recognise_user_token, resolve_user_from_locals_token, function(request, response) {

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
    
    var actor_variable_fields_promise = new Promise(function(resolve, reject){
       actor_controller.getVariableActorFieldsConfig(function(data){
           resolve(data);
        });
    });
    
    if(request.locals && request.locals.authenticated_user){ //is user token found, then do not allow them to access the register page
        
        Promise.all([ actor_data_promise, categories_promise, actor_variable_fields_promise ]).then(function(values){

            var view_parameters = Object.assign({}, view_parameters_global);
            view_parameters.actor_data = values[0];
            view_parameters.gallery_items = [];
            view_parameters.categories = values[1];
            view_parameters.actor_variable_fields = values[2];
            view_parameters.user_data = request.locals && request.locals.authenticated_user ? request.locals.authenticated_user : null;

            response.render("pages/add_beef.jade", view_parameters); 
        });
    }
    else{
        response.redirect("/login?redirected_from=/add-beef") 
    }
    
}); // submit beefdata page page
router.get("/beef", token_authentication.recognise_user_token, resolve_user_from_locals_token, function(request, response) { 
    
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
        
        var view_parameters = Object.assign({}, view_parameters_global);
        view_parameters.grid_data = values[0];
        view_parameters.category_event_data = values[1];
        view_parameters.categories = values[2];
        view_parameters.slider_data = values[3];
        view_parameters.user_data = request.locals && request.locals.authenticated_user ? request.locals.authenticated_user : null;
        /*
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
        */
        response.render("pages/beefs.jade", view_parameters); 
    });
}); //beef page
router.get("/beef/:beef_chain_id/:event_id", token_authentication.recognise_user_token, resolve_user_from_locals_token, function(request, response) { 

    //extract data
    var event_id = request.params.event_id;    
    var beef_chain_id = request.params.beef_chain_id;
    var disable_voting = false;
    var cookies = cookie_parser.parse_cookies(request);
    
    if(request.locals && request.locals.authenticated_user){ //if user is logged on, decide whether to disable voting panel based on user record voted_on_beef_ids field
        
        if(request.locals.authenticated_user.voted_on_beef_ids.indexOf(event_id) != -1){
            disable_voting = true;
        }
    }
    else{ //if user is not logged in, use the browser cookies to decide whether to hide voting panel
        if(cookies.voted_on_beef_ids && cookies.voted_on_beef_ids.split(",").indexOf(event_id) != -1){
            disable_voting = true;
        }
    }
    
    var main_event_data_promise = new Promise(function(resolve, reject){
        event_controller.findEvent(event_id, function(data){
            if(data.failed){
                response.render("pages/static/error.jade");
            }
            else{
                let data_object = { event_data: data };

                event_controller.findEvents({ match_actor: data_object.event_data.aggressors[0]._id, limit: 6, decreasing_order: "date_added" }, function(data){
                    data_object.related_events = data;
                    resolve(data_object);
                });
            }
        });
    });
    
    var comment_data_promise = new Promise(function(resolve, reject){
       comment_controller.findCommentsFromBeefChain(beef_chain_id, function(data){
            if(data.failed){
                response.render("pages/static/error.jade");
            }
            else{
                resolve(data);
            }
        });
    });

    Promise.all([ main_event_data_promise, comment_data_promise ]).then(function(values) {
        
        var view_parameters = Object.assign({}, view_parameters_global);
        view_parameters.current_beef_chain_id = beef_chain_id;
        view_parameters.event_data = values[0].event_data;
        //view_parameters.event_data.rating = calculate_event_rating(view_parameters.event_data.votes);
        view_parameters.comment_data = values[1];
        view_parameters.related_events = values[0].related_events;
        view_parameters.disable_voting = disable_voting;
        view_parameters.user_data = request.locals && request.locals.authenticated_user ? request.locals.authenticated_user : null;
        
        response.render("pages/beef.jade", view_parameters);
        
        user_controller.addViewedBeefEventToUser(view_parameters.user_data._id.toHexString(), event_id, function(data){
            
        });
    }).catch(function(error){
        console.log(error);
        response.render("pages/static/error.jade");
    });
}); //beef page
router.get("/contact", token_authentication.recognise_user_token, resolve_user_from_locals_token, function(request, response) { 
    
    var trending_data_promise = new Promise(function(resolve, reject){
        event_controller.findEvents({ limit: 3, featured: true }, function(data){
            resolve(data);
        });
    });
    
    trending_data_promise.then(function(value){
        
        var view_parameters = Object.assign({}, view_parameters_global);
        view_parameters.trending_data = value;
        view_parameters.user_data = request.locals && request.locals.authenticated_user ? request.locals.authenticated_user : null;
        
        response.render("pages/static/contact.jade", view_parameters); 
    });
}); // contact us page
router.get("/profile", token_authentication.recognise_user_token, resolve_user_from_locals_token, function(request, response) { 

    if(request.locals && request.locals.authenticated_user){

        var view_parameters = Object.assign({}, view_parameters_global);
        view_parameters.user_data = request.locals && request.locals.authenticated_user ? request.locals.authenticated_user : null;
        
        var events_added_by_user_promise = new Promise(function(resolve, reject){
            event_controller.findEvents({ match_user_id: view_parameters.user_data._id.toHexString(), limit: 3 }, function(data){
                resolve(data);
            });
        });
        
        var recently_viewed_events_promise = new Promise(function(resolve, reject){
            
            //sort viewed_beef_ids
            view_parameters.user_data.viewed_beef_ids.sort(function(a, b){ return new Date(b.date) - new Date(a.date); }); //sort the viewed_beef_ids by date
            view_parameters.user_data.viewed_beef_ids = view_parameters.user_data.viewed_beef_ids.slice(0, 3); //retrieve only the most recent three events
            
            event_controller.findEvents({ match_event_ids: view_parameters.user_data.viewed_beef_ids.map(function(item, index){ return item.id})}, function(data){
                var recently_viewed_events_ordered = [];
                                
                for(var i = 0; i < data.length; i++){
                    
                    var index = view_parameters.user_data.viewed_beef_ids.map(function(item, index){ return String(item.id); }).indexOf(String(data[i]._id));//find index of resolved event
                    if(index != -1) recently_viewed_events_ordered[index] = data[i]; //if the index has been found, add it to the return array
                    if(recently_viewed_events_ordered[0] && recently_viewed_events_ordered[1] && recently_viewed_events_ordered[2]) break; //break early if the first three slots in the array are filled
                }
                resolve(recently_viewed_events_ordered);
            });
        });
        
        Promise.all([ events_added_by_user_promise, recently_viewed_events_promise ]).then(function(values){
            view_parameters.events_added_by_user = values[0];
            view_parameters.recently_viewed_events = values[1];
            
            response.render("pages/user_profile.jade", view_parameters);
        });
    }
    else{
        response.redirect("/login?redirected_from=/profile");
    }
}); //actor page
router.get("/register", token_authentication.recognise_user_token, resolve_user_from_locals_token, function(request, response) {
    
    if(request.locals && request.locals.authenticated_user){ //is user token found, then do not allow them to access the register page
        response.redirect("/");
    }
    else{
        response.render("pages/register.jade") 
    }
}); //actor page
router.get("/login", token_authentication.recognise_user_token, resolve_user_from_locals_token, function(request, response) {
    
    var redirected_from = request.query && request.query.redirected_from ? request.query.redirected_from : null; //if user has been denied entry to a page and then redirected to login, access the page they were attempting to access
    var view_parameters = Object.assign({}, view_parameters_global);
    
    if(request.locals && request.locals.authenticated_user){ //is user token found, then do not allow them to access the register page
        response.redirect("/profile", view_parameters);
    }
    else{
        view_parameters.redirected_from = redirected_from;
        response.render("pages/login.jade", view_parameters) 
    }
}); //actor page

//peripheral page routes
router.get("/privacy-policy", token_authentication.recognise_user_token, resolve_user_from_locals_token, function(request, response){ 
    
    var view_parameters = Object.assign({}, view_parameters_global);
    view_parameters.user_data = request.locals && request.locals.authenticated_user ? request.locals.authenticated_user : null;
    
    response.render("pages/static/peripheral_pages/privacy_policy.jade", view_parameters); 
});
router.get("/terms-and-conditions", token_authentication.recognise_user_token, resolve_user_from_locals_token, function(request, response){
    
    var view_parameters = Object.assign({}, view_parameters_global);
    view_parameters.user_data = request.locals && request.locals.authenticated_user ? request.locals.authenticated_user : null;
    
    response.render("pages/static/peripheral_pages/terms_and_conditions.jade", view_parameters); 
});
router.get("/disclaimer", token_authentication.recognise_user_token, resolve_user_from_locals_token, function(request, response){
    
    var view_parameters = Object.assign({}, view_parameters_global);
    view_parameters.user_data = request.locals && request.locals.authenticated_user ? request.locals.authenticated_user : null;
    
    response.render("pages/static/peripheral_pages/disclaimer.jade", view_parameters); 
});

//landing page routes
router.get("/submission-success", token_authentication.recognise_user_token, resolve_user_from_locals_token, function(request, response){
    
    var view_parameters = Object.assign({}, view_parameters_global);
    view_parameters.user_data = request.locals && request.locals.authenticated_user ? request.locals.authenticated_user : null;
    
    response.render("pages/static/successful_submission.jade", view_parameters); 
});
router.get("/offline", token_authentication.recognise_user_token, resolve_user_from_locals_token, function(request, response){
    
    var view_parameters = Object.assign({}, view_parameters_global);
    view_parameters.user_data = request.locals && request.locals.authenticated_user ? request.locals.authenticated_user : null;
    
    response.render("pages/static/offline.jade", view_parameters); 
});

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