//get database reference object
var db_ref = require("../../../db_config.js");
var hashing = require("../../../hashing.js");
//var BSON = require('bson');
var bodyParser = require("body-parser");
var jwt = require("jsonwebtoken");
var os = require("os");


var authentication_procedure = function(request, response){
    //extract data for use later
    var db_url = process.env.MONGODB_URI; //get db uri
    var auth_details = request.body; //get form data

    //cookie config
    var cookies_http_only = true;
    var cookies_secure = process.env.DEPLOYMENT_ENV == "heroku_production" ? true : false; //use secure cookies when on heroku server, dont use when 

    //store data temporarily until submission is confirmed
    db_ref.get_db_object().connect(db_url, function(err, db) {
        if(err){ console.log(err); }
        else{

            //query to determine whether a 
            db.collection(db_ref.get_user_details_table()).aggregate([{ $match: { username: auth_details.username } }]).toArray(function(err, auth_arr){
                if(err){ console.log(err); }
                else if(auth_arr.length < 1){                            
                    response.send({auth_success: false, message: "User not found."});
                }
                else{
                    
                    var user_details = auth_arr[0];
                    var possible_peppers = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
                    var response_sent = false;
                    
                    console.log(request.route_requires_admin);
                    console.log(user_details.admin);
                    
                    if(!request.route_requires_admin || (request.route_requires_admin && user_details.admin)){ //LHS: route is restricted to any user, dont check token auth field. or RHS: route is restricted to admin user, check that route is restricted to admin level, and check that token has admin auth
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
                                var auth_token = jwt.sign({ exp: expiry_timestamp, username: user_details.username, _id: user_details._id, admin_user: user_details.admin, ip_loc: ip_loc }, process.env.JWT_SECRET);

                                //set auth token for verification and logged_in token so client javascript knows how to behave
                                response.cookie("auth", auth_token, { expires: new Date(expiry_timestamp), httpOnly: cookies_http_only, secure: cookies_secure });
                                response.cookie("logged_in", "true", { expires: new Date(expiry_timestamp), httpOnly: false });

                                //send response with cookies
                                response.send({ auth_success: true });

                                response_sent = true;
                                break;// ensure loop does not continue
                            }
                        }
                        if(!response_sent){ //if the password hash is not found send a failed auth response
                            response.send({auth_success: false, message: "Incorrect Password."});
                        }
                    }
                    else{
                        console.log("User does not have correct authorisation.");
                        response.send({auth_success: false, message: "User does not have correct authorisation for this login."});
                    }
                }
            });
        }
    });
}

module.exports = {
    
    auth_user : function(request, response) {
        authentication_procedure(request, response);
    },
    auth_admin_user : function(request, response) {
        request.route_requires_admin = true;
        authentication_procedure(request, response);
    }
}