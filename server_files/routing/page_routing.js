//external dependencies
var router = require("express").Router();
var async = require("async");

//internal dependencies
var db_ref = require("../config/db_config.js"); //get database reference object
var token_authentication = require("../tools/token_authentication.js"); //get token authentication object
var globals = require("../config/globals.js")

//endpoint controllers
var event_controllers = require("../controllers/events_controller.js");


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


let template_data = {
    grid_data: [
        {
            title: "Trump calls Obama an Idiot",
            image_url: "https://cdn.cnn.com/cnnnext/dam/assets/180217093516-03-donald-trump-0216-exlarge-169.jpg",
            category: "Politics",
            _id: "5a3eac03a9106c0004935803",
            event_date: "30/30/30",
            description: "Click the button to display the extracted part of the string. Click the button to display the extracted part of the string. Click the button to display the extracted part of the string.",
            comments: [
                {
                    user_id: "5a3eac03a9106c0004935803",
                    text: "comment 1"
                },
                {
                    user_id: "5a3eac03a9106c0004935803",
                    text: "comment 1"
                },
                {
                    user_id: "5a3eac03a9106c0004935803",
                    text: "comment 1"
                }
            ]
        },
        {
            title: "IPhone 7 vs. Galaxy S8",
            image_url: "http://ksassets.timeincuk.net/wp/uploads/sites/54/2014/12/iphone-7-vs-galaxy-s8-1.jpg",
            category: "Tech",
            _id: "5a3eac03a9106c0004935803",
            event_date: "30/30/30",
            description: "Click the button to display the extracted part of the string. Click the button to display the extracted part of the string. Click the button to display the extracted part of the string.",
            comments: [
                {
                    user_id: "5a3eac03a9106c0004935803",
                    text: "comment 1"
                },
                {
                    user_id: "5a3eac03a9106c0004935803",
                    text: "comment 1"
                }
            ]
        },
        {
            title: "Wiley at it again with Dizzee",
            image_url: "https://assets.capitalxtra.com/2017/24/wiley-and-dizzee-rascal-1497355087-list-handheld-0.jpg",
            category: "Music",
            _id: "5a3eac03a9106c0004935803",
            event_date: "30/30/30",
            description: "Click the button to display the extracted part of the string. Click the button to display the extracted part of the string. Click the button to display the extracted part of the string.",
            comments: [
                {
                    user_id: "5a3eac03a9106c0004935803",
                    text: "comment 1"
                }
            ]
        },
        {
            title: "Eminem dissing Trump",
            image_url: "https://assets.capitalxtra.com/2017/24/wiley-and-dizzee-rascal-1497355087-list-handheld-0.jpg",
            category: "Music",
            _id: "5a3eac03a9106c0004935803",
            event_date: "30/30/30",
            description: "Click the button to display the extracted part of the string. Click the button to display the extracted part of the string. Click the button to display the extracted part of the string.",
            comments: [
                {
                    user_id: "5a3eac03a9106c0004935803",
                    text: "comment 1"
                }
            ]
        },
        {
            title: "Apple or Microsoft",
            image_url: "https://i0.wp.com/www.mac-history.net/wp-content/uploads/2011/01/microsoft-vs-apple.jpg?fit=599%2C311",
            category: "Tech",
            _id: "5a3eac03a9106c0004935803",
            event_date: "30/30/30",
            description: "Click the button to display the extracted part of the string. Click the button to display the extracted part of the string. Click the button to display the extracted part of the string.",
            comments: [
                {
                    user_id: "5a3eac03a9106c0004935803",
                    text: "comment 1"
                }
            ]
        },
        {
            title: "Man U vs Stoke City",
            image_url: "https://metrouk2.files.wordpress.com/2016/09/ac_manuntdvsstoke_comp.jpg?w=748&h=427&crop=1",
            category: "Sports",
            _id: "5a3eac03a9106c0004935803",
            event_date: "30/30/30",
            description: "Click the button to display the extracted part of the string. Click the button to display the extracted part of the string. Click the button to display the extracted part of the string.",
            comments: [
                {
                    user_id: "5a3eac03a9106c0004935803",
                    text: "comment 1"
                }
            ]
        },
    ]
};

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

router.get("/", function(request, response) {     
        
    async.waterfall([
        function(callback){
            event_controllers.findEvents({ limit: 3, featured: true }, function(data){
                console.log(data);
                callback(null, { featured_data: data });
            });
        },
        function(data_object, callback){
            event_controllers.findEvents({ limit: 6, featured: false }, function(data){
                data_object.grid_data = data;
                callback(null, data_object);
            });
        },
        function(data_object, callback){
            event_controllers.findEvents({ limit: 12, featured: false, increasing_order: "date_added" }, function(data){
                data_object.slider_data = data;
                callback(null, data_object);
            });
        }
    ], function (error, data_object) {
        if(error){ console.log(error); }
        response.render("pages/home.jade", { file_server_url_prefix: globals.file_server_url_prefix, featured_data: data_object.featured_data, grid_data: data_object.grid_data, slider_data: data_object.slider_data });
    });
}); //home page

router.get("/about", function(request, response) { response.render("pages/about.jade"); }); // about_us page
router.get("/actors", function(request, response) { 
    
    //access data from db
    
    response.render("pages/actors.jade", template_data_actors); 
}); // about_us page
router.get("/actor/:tagId", function(request, response) { 

    //access data from db
    
    response.render("pages/dynamic_pages/actor.ejs"); 
}); //actor page
router.get("/add_beef", function(request, response) { response.render("pages/add_beef.jade"); }); // submit beefdata page page
router.get("/beef", function(request, response) { 
    
    
    response.render("pages/beefs.jade", template_data); 
}); //beef page
router.get("/beef/:event_id/:beef_chain_id", function(request, response) { 

    //extract data
    var event_id = request.params.event_id;    
    var beef_chain_id = request.params.beef_chain_id;    
       
    async.waterfall([
        function(callback){
            //access data from db
            event_controllers.findEvent(event_id, function(data){
                callback(null, { event_data: data });
            });
        },
        function(data_object, callback){
            event_controllers.findEvents({ match_beef_chain_id: beef_chain_id }, function(data){
                data_object.beef_chain = data;
                callback(null, data_object);
            });
        }
    ], function (error, data_object) {
        if(error){ console.log(error); }
        response.render("pages/beef.jade", { file_server_url_prefix: globals.file_server_url_prefix, event_data: data_object });
    });
    
}); //beef page
router.get("/contact", function(request, response) { 
    
    response.render("pages/contact.jade", { list_data: template_data.grid_data }); 

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