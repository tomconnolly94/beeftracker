//THIS CONTROLLER HAS BEEN DEPRECATED, AND REPLACED BY A PASSPORT.JS LOCAL STRATEGY

//external dependencies
var jwt = require("jsonwebtoken");

//internal dependencies
var db_ref = require("../config/db_config.js");
var db_interface = require("../interfaces/db_interface.js");
var hashing = require("../tools/hashing.js");

//cookie config
var cookies_http_only = true;
var cookies_secure = process.env.NODE_ENV == "heroku_production" ? true : false; //use secure cookies when on heroku server, dont use when 
        
module.exports = {
    
    create_auth_cookies: function(user_details, response, headers, callback){
        
        //create exp date
        var expiry_timestamp = Math.floor(Date.now() + (1000 * 60 * 60));
        var ip_loc = null;

        //if client provides an ip address, extract it
        if(headers['x-forwarded-for']){
            ip_loc = headers['x-forwarded-for'];
        }

        //generate an auth token
        var auth_token = jwt.sign({ exp: expiry_timestamp, username: user_details.username, _id: user_details._id, admin: user_details.admin, ip_loc: ip_loc }, process.env.JWT_SECRET);

        //set auth token for verification and logged_in token so client javascript knows how to behave
        response.cookie("bftkr_auth", auth_token, { expires: new Date(expiry_timestamp), httpOnly: cookies_http_only, secure: cookies_secure });
        response.cookie("bftkr_logged_in", "true", { expires: new Date(expiry_timestamp), httpOnly: false });
        callback();
    },
    
    authenticateUser: function(auth_details, headers, response, callback){
        //extract data for use later
        var db_url = process.env.MONGODB_URI; //get db uri

        var query_config = {
            table: db_ref.get_user_details_table(),
            aggregate_array: [
                { 
                    $match: { 
                        username: auth_details.username 
                    } 
                }
            ]
        }

        db_interface.get(query_config, function(results){

            var formatting_error_object = { 
                failed: true, 
                module: "authentication_controller", 
                function: "authenticateUser", 
                message: "Validation faled, please format input data properly.", 
                details: [{ 
                    location: "Your Username/Password", 
                    problem: "Please check your log in details, we don't seem to recognise them."
                }] 
            };
            
            if(results.length < 1){                            
                callback(formatting_error_object);
            }
            else{

                var user_details = results[0];
                var possible_peppers = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
                var response_sent = false;

                //loop through possible peppers to find the appropriate one
                for(var i = 0; i < possible_peppers.length; i++ ){

                    //compare the hashed password from the db with a fresh hash of the password + possible pepper and provided salt
                    if(user_details.hashed_password == hashing.hash_password(auth_details.password, user_details.salt, possible_peppers[i]).hashed_password){

                        module.exports.create_auth_cookies(user_details, response, headers, function(){
                            callback({});
                        });

                        response_sent = true;
                        break;// ensure loop does not continue
                    }
                }
                if(!response_sent){ //if the password hash is not found send a failed auth response
                    callback(formatting_error_object);
                }
            }
        }, function(error_object){
            callback(error_object);
        });
    },
    
    deauthenticateUser: function(response, callback){
        console.log("deauth triggered")
        //set all cookies to expire immediately
        response.cookie( "bftkr_auth", "0", { expires: new Date(0), httpOnly: cookies_http_only, secure: cookies_secure });
        response.cookie( "bftkr_logged_in", "false", { expires: new Date(0), httpOnly: false });
        callback({});
    }
}