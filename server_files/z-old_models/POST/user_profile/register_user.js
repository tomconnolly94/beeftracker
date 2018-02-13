"use strict";
//get database reference object
var db_ref = require("../../../db_config.js");
var hashing = require("../../../hashing.js");
var bodyParser = require("body-parser");

//check for duplicate username or email address before allowing user to register
var check_details_against_user_table = function(db, user_details, insert_object, response, callback){
    
    db.collection(db_ref.get_user_details_table()).aggregate([{ $match: { $or: [ { username: user_details.username}, { email_address: user_details.email_address } ] } }]).toArray(function(err, auth_arr){

        if(err){ console.log(err); }
        else{

            if(auth_arr.length > 0){
                if(auth_arr[0].username == user_details.username){
                    response.send({success: false, message: "Username is taken."});
                }
                else{
                    response.send({success: false, message: "Email is taken."});
                }
            }
            else{
                callback();
            }
        }
    });
}

module.exports = {
    
    execute : function(request, response) {

        //extract data for use later
        var user_details = request.body; //get form data
        
        //cookie config
        var cookies_http_only = true;
        var cookies_secure = process.env.DEPLOYMENT_ENV == "heroku_production" ? true : false; //use secure cookies when on heroku server, dont use when 
        
        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{
                
                var password_data = hashing.hash_password(user_details.password);
                var ip_address = null;
                //if client provides an ip address, create new jsonwebtoken with it and store as cookie
                if(request.headers['x-forwarded-for']){
                    ip_address = request.headers['x-forwarded-for'];
                }                     
                
                //prepare date of birth
                var birth_date = user_details.d_o_b.split("/");
                
                var insert_object = { 
                    username: user_details.username,
                    first_name: user_details.first_name,
                    last_name: user_details.last_name,
                    email_address: user_details.email_address,
                    hashed_password: password_data.hashed_password, 
                    salt: password_data.salt,
                    d_o_b: new Date(birth_date[2], birth_date[1]-1, birth_date[0]),
                    img_title: user_details.img_title,
                    ip_addresses: ip_address ? [ ip_address ] : [ ],
                    date_created: new Date(),
                    last_seen: new Date(),
                    admin: false
                };
                
                if(user_details.admin){ //if admin, check pending registered admin users table, to ensure a user hasnt previously requested admin registration with similar details
                
                    db.collection(db_ref.get_pending_registered_admin_users_table()).aggregate([{ $match: { $or: [ { username: user_details.username}, { email_address: user_details.email_address } ] } }]).toArray(function(err, auth_arr){

                        if(err){ console.log(err); }
                        else{
                            if(auth_arr.length > 0){
                                if(auth_arr[0].username == user_details.username){
                                    response.send({success: false, message: "Username is taken."});
                                }
                                else{
                                    response.send({success: false, message: "Email is taken."});
                                }
                            }
                            else{
                                //add admin fields to insert_object
                                insert_object.admin = true;
                                
                                check_details_against_user_table(db, user_details, insert_object, response, function(){
                                    
                                    //insert new user record
                                    db.collection(db_ref.get_pending_registered_admin_users_table()).insert(insert_object, function(err, document){
                                        if(err){ console.log(err); }
                                        else{
                                            response.send({success: true, message: "Registration complete, requires approval from an existing admin."});
                                        }
                                    });
                                });
                            }
                        }
                    });
                }
                else{
                    check_details_against_user_table(db, user_details, insert_object, response, function(){
                        
                        //add extra fields if not an admin user
                        insert_object.viewed_beef_ids = [];
                        insert_object.submitted_beef_ids = [];
                        insert_object.submitted_actor_ids = [];
                        insert_object.country = user_details.country;
                        insert_object.contribution_score = 0;
                        
                        //insert new user record
                        db.collection(db_ref.get_user_details_table()).insert(insert_object, function(err, document){
                            if(err){ console.log(err); }
                            else{
                                response.send({success: true, message: "Registration complete."});
                            }
                        });
                    });
                }
            }
        });
    }
}