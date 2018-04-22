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

let template_data_actors = {
    grid_data: [
        {
            name: "Trump",
            image_url: "https://cdn.cnn.com/cnnnext/dam/assets/180217093516-03-donald-trump-0216-exlarge-169.jpg",
            category: "Politics",
            _id: "5a3eac03a9106c0004935803",
            d_o_b: "20/20/20"
        },
        {
            name: "Obama",
            image_url: "http://ksassets.timeincuk.net/wp/uploads/sites/54/2014/12/iphone-7-vs-galaxy-s8-1.jpg",
            category: "Tech",
            _id: "5a3eac03a9106c0004935803",
            d_o_b: "20/20/20"
        },
        {
            name: "Wiley",
            image_url: "https://assets.capitalxtra.com/2017/24/wiley-and-dizzee-rascal-1497355087-list-handheld-0.jpg",
            category: "Music",
            _id: "5a3eac03a9106c0004935803",
            d_o_b: "20/20/20"
        },
        {
            name: "Eminem",
            image_url: "https://assets.capitalxtra.com/2017/24/wiley-and-dizzee-rascal-1497355087-list-handheld-0.jpg",
            category: "Music",
            _id: "5a3eac03a9106c0004935803",
            d_o_b: "20/20/20"
        },
        {
            name: "Dizzee",
            image_url: "https://i0.wp.com/www.mac-history.net/wp-content/uploads/2011/01/microsoft-vs-apple.jpg?fit=599%2C311",
            category: "Tech",
            _id: "5a3eac03a9106c0004935803",
            d_o_b: "20/20/20"
        },
        {
            name: "Man U",
            image_url: "https://metrouk2.files.wordpress.com/2016/09/ac_manuntdvsstoke_comp.jpg?w=748&h=427&crop=1",
            category: "Sports",
            _id: "5a3eac03a9106c0004935803",
            d_o_b: "20/20/20"
        },
    ]
};

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
        response.render("pages/home.jade", { file_server_url_prefix: globals.file_server_url_prefix, featured_data: values[0], grid_data: values[1], /*slider_data: values[2] */ category_event_data: values[2], categories: values[3] });
    }).catch(function(error){
        console.log(error);
    });
    
    
}); //home page
router.get("/about", function(request, response) {
    response.render("pages/about.jade");
}); // about_us page
router.get("/actors", function(request, response) { 
    
    //access data from db
    
    response.render("pages/actors.jade", template_data_actors); 
}); // about_us page
router.get("/actor/:tagId", function(request, response) { 

    //access data from db
    
    response.render("pages/actor.jade"); 
}); //actor page
router.get("/add-beef", function(request, response) {

    var actor_data_promise = new Promise(function(resolve, reject){
        actor_controller.findActors({ increasing_order: "name" }, function(data){
            resolve(data);
        });
    });
    
    actor_data_promise.then(function(data){
        response.render("pages/add_beef.jade", { file_server_url_prefix: globals.file_server_url_prefix, actor_data: data, gallery_items: [] }); 
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
        response.render("pages/beefs.jade", { file_server_url_prefix: globals.file_server_url_prefix, grid_data: data[0], category_event_data: data[1], categories: data[2], slider_data: data[3] }); 
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
        response.render("pages/beef.jade", { file_server_url_prefix: globals.file_server_url_prefix, event_data: values[0].event_data, comment_data: values[1], related_events: values[0].related_events });
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
        response.render("pages/contact.jade", { file_server_url_prefix: globals.file_server_url_prefix, trending_data: data }); 
    });
}); // contact us page

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