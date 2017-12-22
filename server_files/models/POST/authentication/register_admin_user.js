"use strict";
//get database reference object
var db_ref = require("../../../db_config.js");
var hashing = require("../../../hashing.js");
//var BSON = require('bson');
var bodyParser = require("body-parser");
//var jwt = require("jsonwebtoken");
//var os = require("os");

//configure testing mode, if set: true, record will be collected, printed but not sent to db and no email notification will be sent.
var test_mode = false;

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
                db.collection(db_ref.get_pending_registered_admin_users_table()).aggregate([{ $match: { username: auth_details.username } }]).toArray(function(err, auth_arr){
                    
                    
                    if(err){ console.log(err); }
                    else{
                        console.log(auth_arr);
                        console.log({ username: auth_details.username });
                        if(auth_arr.length > 0){
                            response.send({success: false, message: "User already pending registration."});
                        }
                        else{


                            var password_data = hashing.hash_password(auth_details.password);

                            var insert_object = { username: auth_details.username, hashed_password: password_data.hashed_password, salt: password_data.salt};

                            //create session record with username, token and ip address
                            db.collection(db_ref.get_pending_registered_admin_users_table()).insert(insert_object, function(err, document){
                                if(err){ console.log(err); }
                                else{
                                    console.log(document.ops[0]);
                                    response.send({success: true, message: "Registration complete, requires approval from an existing admin."});
                                }
                            });

                        }
                    }
                });
            }
        });
    }
}