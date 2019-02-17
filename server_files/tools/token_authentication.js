//external dependencies
var jwt = require("jsonwebtoken");
var cookie_parser = require('../tools/cookie_parsing.js');

//internal dependencies
var logging = require("./logging");

var auth_disabled = false;

//confirm authentication, refresh cookie, and let page route continue executing
var confirm_auth = function(request, response, token, auto_refresh_auth_token, next){
    if(auto_refresh_auth_token){
        //cookie config
        var cookies_http_only = true;
        var cookies_secure = process.env.NODE_ENV == "heroku_production" ? true : false; //use secure cookies when on heroku server, dont use when running local server

        //refresh token expiry date
        var expiry_timestamp = Math.floor(Date.now() + 1000);// (1000 * 60 * 60)); //create new exp date
        var new_auth_token = jwt.sign({ exp: expiry_timestamp, username: token.username, ip_loc: token.ip_loc }, process.env.JWT_SECRET);

        //set auth token for verification and logged_in token so client javascript knows how to behave
        response.cookie("auth", new_auth_token, { expires: new Date(expiry_timestamp), httpOnly: cookies_http_only, secure: cookies_secure });
        response.cookie("logged_in", "true", { expires: new Date(expiry_timestamp), httpOnly: false });
    }
    //ensure no authentication pages can be cached in the browser
    response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
    response.setHeader("Pragma", "no-cache"); // HTTP 1.0.
    
    if(!request.locals){ request.locals = {}; }
    request.locals.authenticated_user = {
        id: token._id,
        is_admin: token.admin
    }

    next();
}

var authentication_procedure = function(request, response, deny_access_on_fail, next){
    
    //extract data for use later
    var auto_refresh_auth_token = false;
    var cookies = cookie_parser.parse_cookies(request);

    logging.submit_log(logging.LOG_TYPE.EXTRA_INFO, cookies);
        
    if(cookies.bftkr_auth){
        //verify token to ensure its still valid
        jwt.verify(cookies.bftkr_auth, process.env.JWT_SECRET, function(error, auth_token){
            if(error){ 
                console.log(error);
                module.exports.reset_auth(response, deny_access_on_fail, { stage: "token_authentication", message: "Token Authentication failed please login" }, next);
            }
            else{
                if((!request.route_requires_admin && auth_token.admin == false) || //route is not admin, ensure provided user_id matches the _id in the auth token
                    auth_token.admin){ //auth_token is admin, allow
                    
                    request.user_is_admin = auth_token.admin;
                    
                    if(auth_token.ip_loc){ //if ip location field is provided, also verify the requests ip address
                        //check if this request's ip address matches the ip address that the user logged in with, ignore if tokens ip_loc is null
                        if(!auth_token.ip_loc || request.headers['x-forwarded-for'] == auth_token.ip_loc ){                    
                            confirm_auth(request, response, auth_token, auto_refresh_auth_token, next);
                        }
                        else{
                            module.exports.reset_auth(response, deny_access_on_fail, { stage: "token_authentication", message: "Token Authentication failed please login" }, next);
                        }
                    }
                    else{
                        confirm_auth(request, response, auth_token, auto_refresh_auth_token, next);
                    }
                }
                else{
                    console.log("Token does not have correct authorisation");
                    module.exports.reset_auth(response, deny_access_on_fail, { stage: "token_authentication", message: "Token Authentication failed please login" }, next);
                }
            }
        });
    }
    else{
        console.log("Token Authentication: No cookie provided")
        module.exports.reset_auth(response, deny_access_on_fail, { stage: "token_authentication", message: "Token Authentication failed please login" }, next);
    }
}

module.exports = {
    
    reset_auth: function(response, deny_access_on_fail, error_details, next){
        response.cookie("auth", "0", { expires: new Date(0), httpOnly: true });
        response.cookie("logged_in", "false", { expires: new Date(0) });
        response.cookie("bftkr_auth_refresh", "0", { expires: new Date(0), httpOnly: true });
        response.cookie("bftkr_auth_refresh_token_present", "false", { expires: new Date(0) });
        //response.render('pages/authentication/admin_login.ejs');

        if(deny_access_on_fail){
            response.status(401).send({ stage: error_details.stage, failed: true, message: error_details.message});
        }
        else{
            next();
        }
    },

    authenticate_endpoint_with_user_token : function(request, response, next) {
        if(auth_disabled){
            next();
        }
        else{
            authentication_procedure(request, response, true, next);
        }
    },

    authenticate_endpoint_with_admin_user_token : function(request, response, next) {
        if(auth_disabled){
            next();
        }
        else{
            request.route_requires_admin = true; //set field requiring the token has auth field set to true
            authentication_procedure(request, response, true, next);
        }
    },

    recognise_user_token : function(request, response, next) {
        if(auth_disabled){
            next();
        }
        else{
            authentication_procedure(request, response, false, next);
        }
    },

    recognise_admin_token : function(request, response, next) {
        if(auth_disabled){
            next();
        }
        else{
            request.route_requires_admin = true; //set field requiring the token has auth field set to true
            authentication_procedure(request, response, false, next);
        }
    }
}