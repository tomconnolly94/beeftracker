//get database reference object
var db_ref = require("./db_config.js");
//var BSON = require('bson');
var bodyParser = require("body-parser");
var jwt = require("jsonwebtoken");
var os = require("os");
var cookie_parser = require('./cookie_parsing.js');

//configure testing mode, if set: true, record will be collected, printed but not sent to db and no email notification will be sent.
var test_mode = false;

module.exports = {
    
    authenticate_token : function(request, response, next) {
        
        //extract data for use later
        var db_url = process.env.MONGODB_URI; //get db uri
        var session_details = request.body; //get form data

        var cookies = cookie_parser.parse_cookies(request);
        
        //delete all auth cookies and redirect to login page
        var reset_auth = function(response){
            response.cookie("auth", "0", { expires: new Date(0), httpOnly: true });
            response.cookie("logged_in", "false", { expires: new Date(0) });
            response.render('pages/authentication/admin_login.ejs');
        }
        
        //confirm authentication, refresh cookie, and let page route continue executing
        var confirm_auth = function(response, token){
            //refresh token expiry date
            var expiry_timestamp = Math.floor(Date.now() + (1000 * 60 * 60)); //create new exp date
            var new_token = jwt.sign({ exp: expiry_timestamp, username: token.username, ip_loc: token.ip_loc }, process.env.JWT_SECRET);
            
            //ensure no authentication pages can be cached in the browser
            response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
            response.setHeader("Pragma", "no-cache"); // HTTP 1.0.
            next();
        }

        //verify token to ensure its still valid
        jwt.verify(cookies.auth, process.env.JWT_SECRET, function(error, auth_token){
            if(error){ 
                console.log(error);
                reset_auth(response);
            }
            else{
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
                    confirm_auth(response, auth_token);
                }
            }
        });
    }
}