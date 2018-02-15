//external dependencies
var jwt = require("jsonwebtoken");

//internal dependencies
var db_ref = require("../config/db_config.js");
var hashing = require("../tools/hashing.js");

//cookie config
var cookies_http_only = true;
var cookies_secure = process.env.DEPLOYMENT_ENV == "heroku_production" ? true : false; //use secure cookies when on heroku server, dont use when 
        
module.exports = {
    
    authenticateUser: function(request, response){
        //extract data for use later
        var db_url = process.env.MONGODB_URI; //get db uri
        var auth_details = request.body; //get form data

        //store data temporarily until submission is confirmed
        db_ref.get_db_object().connect(db_url, function(err, db) {
            if(err){ console.log(err); }
            else{

                //query to determine whether a 
                db.collection(db_ref.get_user_details_table()).aggregate([{ $match: { username: auth_details.username } }]).toArray(function(err, auth_arr){
                    if(err){ console.log(err); }
                    else if(auth_arr.length < 1){                            
                        response.send({auth_failed: true, message: "User not found."});
                    }
                    else{

                        var user_details = auth_arr[0];
                        var possible_peppers = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
                        var response_sent = false;

                        //loop through possible peppers to find the appropriate one
                        for(var i = 0; i < possible_peppers.length; i++ ){

                            //compare the hashed password from the db with a fresh hash of the password + possible pepper and provided salt
                            if(user_details.hashed_password == hashing.hash_password(auth_details.password, user_details.salt, possible_peppers[i]).hashed_password){

                                //create exp date
                                var expiry_timestamp = Math.floor(Date.now() + (1000 * 60 * 60));
                                var ip_loc = null;

                                //if client provides an ip address, extract it
                                if(request.headers['x-forwarded-for']){
                                    ip_loc = request.headers['x-forwarded-for'];
                                }

                                //generate an auth token
                                var auth_token = jwt.sign({ exp: expiry_timestamp, username: user_details.username, _id: user_details._id, admin: user_details.admin, ip_loc: ip_loc }, process.env.JWT_SECRET);

                                //set auth token for verification and logged_in token so client javascript knows how to behave
                                response.cookie("auth", auth_token, { expires: new Date(expiry_timestamp), httpOnly: cookies_http_only, secure: cookies_secure });
                                response.cookie("logged_in", "true", { expires: new Date(expiry_timestamp), httpOnly: false });

                                //send response with cookies
                                response.send({ auth_failed: false });

                                response_sent = true;
                                break;// ensure loop does not continue
                            }
                        }
                        if(!response_sent){ //if the password hash is not found send a failed auth response
                            response.send({auth_failed: true, message: "Incorrect Password."});
                        }
                    }
                });
            }
        });
    },
    
    deauthenticateUser: function(request, response){
        //set all cookies to expire immediately
        response.cookie( "auth", "0", { expires: new Date(0), httpOnly: cookies_http_only, secure: cookies_secure });
        response.cookie( "logged_in", "false", { expires: new Date(0), httpOnly: false });
        response.send({ deauth_failed: false});
    }
}