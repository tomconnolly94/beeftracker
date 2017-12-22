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
        console.log(request.headers['x-forwarded-for']);
        
        var reset_auth = function(response){
            response.cookie( "auth", "0", { expires: new Date(0), httpOnly: true });
            response.cookie( "logged_in", "false", { expires: new Date(0)});
            response.cookie( "ip_loc", "false", { expires: new Date(0)});
            response.render('pages/authentication/admin_login.ejs');
        }

        //verify token to ensure its still valid
        jwt.verify(cookies.auth, process.env.JWT_SECRET, function(error, auth_token){
            if(error){ 
                console.log(error);
                reset_auth(response);
            }
            else{
                //if ip location cookie is provided, also verify this
                if(auth_token.ip_loc_cookie_set){
                    jwt.verify(cookies.ip_loc, process.env.JWT_SECRET, function(error, ip_loc_token){
                        if(error){ 
                            console.log(error);
                            reset_auth(response);
                        }
                        else{
                            console.log(request.headers['x-forwarded-for']);
                            console.log(ip_loc_token.login_ip_loc);
                            
                            //check if this requests ip address matches the ip address that the user logged in with
                            if(request.headers['x-forwarded-for'] == ip_loc_token.login_ip_loc ){
                                console.log(ip_loc_token);
                                response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
                                response.setHeader("Pragma", "no-cache"); // HTTP 1.0.
                                //response.setDateHeader("Expires", 0); // Proxies
                                next();
                            }
                            else{
                                reset_auth(response);
                            }
                        }            
                    });
                }
                else{
                    response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
                    response.setHeader("Pragma", "no-cache"); // HTTP 1.0.
                    //response.setDateHeader("Expires", 0); // Proxies
                    next();
                }
            }            
        });
        
    }
}