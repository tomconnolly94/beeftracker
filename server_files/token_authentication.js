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

        //verify token to ensure its still valid
        jwt.verify(cookies.auth_cookie, process.env.JWT_SECRET, function(error, token){
            if(error){ 
                console.log(error);
                response.render('pages/authentication/admin_login.ejs');
            }
            else{
                response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
                response.setHeader("Pragma", "no-cache"); // HTTP 1.0.
                //response.setDateHeader("Expires", 0); // Proxies
                next();  
            }            
        });
    }
}