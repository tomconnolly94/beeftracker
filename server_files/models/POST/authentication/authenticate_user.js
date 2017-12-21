//get database reference object
var db_ref = require("../../../db_config.js");
var encryption = require("../../../encryption.js");
//var BSON = require('bson');
var bodyParser = require("body-parser");
var jwt = require("jsonwebtoken");
var os = require("os");

module.exports = {
    
    execute : function(request, response) {

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

                //standard query
                db.collection(db_ref.get_authentication_table()).aggregate([{ $match: { username: auth_details.username } }]).toArray(function(err, auth_arr){
                    if(err){ console.log(err); }
                    else if(auth_arr.length < 1){
                        
                        console.log("Username not found.")
                                
                        response.send({auth_success: false});
                    }
                    else{
                        var user_details = auth_arr[0];
                        
                        var possible_peppers = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
                        var response_sent = false;
                        
                        for(var i = 0; i < possible_peppers.length; i++ ){
                            
                            if(user_details.hashed_password == encryption.encrypt_password(auth_details.password, user_details.salt, possible_peppers[i]).hashed_password){
                                
                                response_sent = true;
                                
                                //standard query to check if any existing session exist for this user
                                db.collection(db_ref.get_session_table()).aggregate([{ $match: { username: user_details.username } }]).toArray(function(err, existing_session_details_arr){

                                    if(err){ console.log(err); }
                                    else if(existing_session_details_arr.length >= 1){

                                        existing_session_details = existing_session_details_arr[0];

                                        var remove_query = { token: existing_session_details.token };

                                        //create session record with username, token and ip address
                                        db.collection(db_ref.get_session_table()).remove(remove_query, function(err, document){
                                            if(err){ console.log(err); }
                                            else{
                                                create_and_send_new_token(user_details, auth_details, db, cookies_http_only, cookies_secure);
                                            }
                                        });
                                    }
                                    else{
                                        create_and_send_new_token(user_details, auth_details, db, cookies_http_only, cookies_secure);
                                    }
                                });
                                break;// ensure loop does not continue
                            }
                        }
                        if(!response_sent){
                            response.send({auth_success: false});
                        }
                    }
                });
            }
        });
        
        
        var create_and_send_new_token = function(user_details, auth_details, db, cookies_http_only, cookies_secure){
            
            console.log("Creating new session.");
            
            //generate an auth token
            user_details.token = jwt.sign(user_details, process.env.JWT_SECRET);

            var insert_object = { username: user_details.username, token: user_details.token, expires: new Date(Date.now() + (1000 * 60 * 60 * 1)) };

            if(auth_details.client_ip_address){
                insert_object.ip_address = auth_details.client_ip_address;
            }

            //create session record with username, token and ip address
            db.collection(db_ref.get_session_table()).insert(insert_object, function(err, document){
                if(err){ console.log(err); }
                else{
                    console.log(document.ops[0]);

                    response.cookie("auth_cookie", insert_object.token, { expires: insert_object.expires, httpOnly: cookies_http_only, secure: cookies_secure });
                    response.cookie("logged_in", "true", { expires: insert_object.expires, httpOnly: false });
                    response.send({ auth_success: true, auth_details: document.ops[0] });
                }
            });
        }
    }
}