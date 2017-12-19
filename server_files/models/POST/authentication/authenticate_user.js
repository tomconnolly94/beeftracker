//get database reference object
var db_ref = require("../../../db_config.js");
//var BSON = require('bson');
var bodyParser = require("body-parser");
var jwt = require("jsonwebtoken");

//configure testing mode, if set: true, record will be collected, printed but not sent to db and no email notification will be sent.
var test_mode = false;

module.exports = {
    
    execute : function(request, response) {

        //extract data for use later
        var db_url = process.env.MONGODB_URI; //get db uri
        var auth_details = request.body; //get form data
        
        //store data temporarily until submission is confirmed
        db_ref.get_db_object().connect(db_url, function(err, db) {
            if(err){ console.log(err); }
            else{
                //standard query
                db.collection(db_ref.get_authentication_table()).aggregate([{ $match: { username: auth_details.username, password: auth_details.password } }]).toArray(function(err, auth_arr){
                    if(err){ console.log(err); }
                    else if(auth_arr.length < 1){
                        response.send({message: "Authentication details not found."});
                    }
                    else{
                        var user_details = auth_arr[0];
                        
                        console.log(user_details);
                        
                        //generate an auth token
                        user_details.token = jwt.sign(user_details, process.env.JWT_SECRET);
                        
                        var insert_object = { username: user_details.username, token: user_details.token, date_created: new Date() };
                        
                        if(auth_details.client_ip_address){
                            insert_object.ip_address = auth_details.client_ip_address;
                        }
                        
                        console.log(insert_object);
                        //standard query
                        db.collection(db_ref.get_session_table()).aggregate([{ $match: { username: user_details.username } }]).toArray(function(err, existing_session_details_arr){
                            
                            if(err){ console.log(err); }
                            else if(existing_session_details_arr.length >= 1){
                                console.log("existing session found.")
                                response.send(existing_session_details_arr);
                            }
                            else{
                                console.log("new session created.")
                                //create session record with username, token and ip address
                                db.collection(db_ref.get_session_table()).insert(insert_object, function(err, document){
                                    if(err){ console.log(err); }
                                    else{
                                        console.log(document.ops[0]);
                                        
                                        response.cookie("session_cookie", insert_object.token, { expires: new Date(Date.now() + (1000 * 60 * 1)), httpOnly: true });
                                        response.send(document.ops[0]);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }
}