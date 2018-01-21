//get database reference object
var db_ref = require("./db_config.js");
//var BSON = require('bson');
var bodyParser = require("body-parser");
var jwt = require("jsonwebtoken");
var os = require("os");
var cookie_parser = require('./cookie_parsing.js');

//configure testing mode, if set: true, record will be collected, printed but not sent to db and no email notification will be sent.
var test_mode = false;


//delete all auth cookies and redirect to login page
var reset_auth = function(response){
    response.cookie("auth", "0", { expires: new Date(0), httpOnly: true });
    response.cookie("logged_in", "false", { expires: new Date(0) });
    //response.render('pages/authentication/admin_login.ejs');
    response.send({message: "auth cookie not provided"});
}

//confirm authentication, refresh cookie, and let page route continue executing
var confirm_auth = function(response, token){
    if(auto_refresh_auth_token){
        //cookie config
        var cookies_http_only = true;
        var cookies_secure = process.env.DEPLOYMENT_ENV == "heroku_production" ? true : false; //use secure cookies when on heroku server, dont use when running local server

        //refresh token expiry date
        var expiry_timestamp = Math.floor(Date.now() + (1000 * 60 * 60)); //create new exp date
        var new_auth_token = jwt.sign({ exp: expiry_timestamp, username: token.username, ip_loc: token.ip_loc }, process.env.JWT_SECRET);

        //set auth token for verification and logged_in token so client javascript knows how to behave
        response.cookie("auth", new_auth_token, { expires: new Date(expiry_timestamp), httpOnly: cookies_http_only, secure: cookies_secure });
        response.cookie("logged_in", "true", { expires: new Date(expiry_timestamp), httpOnly: false });
    }
    //ensure no authentication pages can be cached in the browser
    response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
    response.setHeader("Pragma", "no-cache"); // HTTP 1.0.

    console.log("token: ");
    console.log(token);

    request.authenticated_user_id = token._id;

    next();
}

var authentication_procedure = function(request, response, next){
    
    //extract data for use later
    var db_url = process.env.MONGODB_URI; //get db uri
    var session_details = request.body; //get form data
    var auto_refresh_auth_token = false;

    var cookies = cookie_parser.parse_cookies(request);
    console.log(cookies);        

    if(cookies.auth){
        //verify token to ensure its still valid
        jwt.verify(cookies.auth, process.env.JWT_SECRET, function(error, auth_token){
            if(error){ 
                console.log(error);
                reset_auth(response);
            }
            else{
                if(!request.route_requires_admin || (request.route_requires_admin && auth_token.admin)){ //route is restricted to non admin user, dont check token auth field or route is restricted to admin user, check that route is restricted to admin level, and check that token has admin auth
                    //if ip location field is provided, also verify the requests ip address
                    if(auth_token.ip_loc){
                        //check if this request's ip address matches the ip address that the user logged in with
                        if(request.headers['x-forwarded-for'] == auth_token.ip_loc ){                    
                            confirm_auth(response, auth_token);
                        }
                        else{
                            reset_auth(response);
                        }
                    }
                    else{
                        console.log("yo")
                        confirm_auth(response, auth_token);
                    }
                }
                else{
                    console.log("Token does not have correct authorisation");
                    reset_auth(response);
                }
            }
        });
    }
    else{
        console.log("No cookie provided.")
        reset_auth(response);
    }
}

module.exports = {
    
    authenticate_user_token : function(request, response, next) {
        authentication_procedure(request, response, next);
    },
    authenticate_admin_user_token : function(request, response, next) {
        
        request.route_requires_admin = true; //set field requiring the token has auth field set to true
        authentication_procedure(request, response, next);
    }
}