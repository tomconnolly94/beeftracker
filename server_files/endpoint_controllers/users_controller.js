//external dependencies
var jwt = require("jsonwebtoken");
var os = require("os");
var BSON = require("bson");

//internal dependencies
var db_ref = require("../config/db_config.js");
var storage_ref = require("../config/storage_config.js");
var storage_interface = require('../interfaces/storage_interface.js');;
var hashing = require("../tools/hashing.js");

//cookie config
var cookies_http_only = true;
var cookies_secure = process.env.DEPLOYMENT_ENV == "heroku_production" ? true : false; //use secure cookies when on heroku server, dont use when 
        
module.exports = {
    
    getUser: function(request, response){
        
        console.log(request.params)
        var user_id = request.params.user_id;
        var user_id_object = BSON.ObjectID.createFromHexString(user_id);
        var user_projection;
        
        console.log(request.user_is_admin);
        
        if(request.user_is_admin){ //return more data about a user if the request is coming from an admin
            user_projection = { //admin user projection
                $project: {
                    "_id": 1,
                    "username": 1,
                    "first_name": 1,
                    "last_name": 1,
                    "email_address": 1,
                    "d_o_b": 1,
                    "img_title": 1,
                    "ip_addresses": 1,
                    "date_created": 1,
                    "last_seen": 1,
                    "admin": 1,
                    "viewed_beef_ids": 1,
                    "submitted_beef_ids": 1,
                    "submitted_actor_ids": 1,
                    "country": 1,
                    "contribution_score": 1
                }
            }
        }
        else{
            user_projection = { //non admin user projection
                $project: {
                    "_id": 1,
                    "username": 1,
                    "first_name": 1,
                    "last_name": 1,
                    "email_address": 1,
                    "d_o_b": 1,
                    "img_title": 1,
                    "date_created": 1,
                    "img_title": 1,
                    "admin": 1,
                    "country": 1,
                    "contribution_score": 1
                }
            }            
        }
        
        console.log(user_projection)
        
        
        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{
                db.collection(db_ref.get_user_details_table()).aggregate([
                    { $match: { _id: user_id_object } },
                    user_projection
                ]).toArray(function(err, users){
                    
                    if(err){ console.log(err);}
                    else{
                        console.log(users);
                        if(users.length < 1){
                            response.status(404).send({ failed: true, message: "Could not find user."});
                        }
                        else{
                            response.status(200).send(users[0]);
                        }
                    }
                });
            }
        });
    },
    
    createUser: function(request, response){
        
        //extract data for use later
        var user_details = JSON.parse(request.body.data); //get form data
        var files = request.files;
        
        //check for duplicate username or email address before allowing user to register
        var check_details_against_user_table = function(db, user_details, insert_object, response, callback){

            db.collection(db_ref.get_user_details_table()).aggregate([{ $match: { $or: [ { username: user_details.username}, { email_address: user_details.email_address } ] } }]).toArray(function(err, auth_arr){

                if(err){ console.log(err); }
                else{

                    if(auth_arr.length > 0){
                        if(auth_arr[0].username == user_details.username){
                            response.status(400).send({failed: true, message: "Username is taken."});
                        }
                        else{
                            response.status(400).send({failed: true, message: "Email is taken."});
                        }
                    }
                    else{
                        callback();
                    }
                }
            });
        }
        
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
                    admin: user_details.admin
                };
                
                var image_requires_download = true;

                if(files[0]){
                    image_requires_download = false;
                }
                
                //make sure username and email are both not taken
                check_details_against_user_table(db, user_details, insert_object, response, function(){
                    
                    if(user_details.admin){ //if admin, check pending registered admin users table, to ensure a user hasnt previously requested admin registration with similar details

                        db.collection(db_ref.get_pending_registered_admin_users_table()).aggregate([{ $match: { $or: [ { username: user_details.username}, { email_address: user_details.email_address } ] } }]).toArray(function(err, auth_arr){
                            if(err){ console.log(err); }
                            else{
                                if(auth_arr.length > 0){
                                    if(auth_arr[0].username == user_details.username){
                                        response.status(400).send({failed: true, message: "Username is taken."});
                                    }
                                    else{
                                        response.status(400).send({failed: true, message: "Email is taken."});
                                    }
                                }
                                else{
                                    storage_interface.upload_image(image_requires_download, storage_ref.get_user_images_folder(), insert_object.img_title, files[0], false, function(img_title){

                                        insert_object.img_title_fullsize = img_title;

                                        storage_interface.upload_image(image_requires_download, storage_ref.get_user_images_folder(), insert_object.img_title, files[0], true, function(thumbnail_img_title){

                                            insert_object.img_title_thumbnail = thumbnail_img_title;
                                            //insert new user record
                                            db.collection(db_ref.get_pending_registered_admin_users_table()).insert(insert_object, function(err, document){
                                                if(err){ console.log(err); }
                                                else{
                                                    response.send({failed: false, message: "Registration complete, requires approval from an existing admin."});
                                                }
                                            });
                                        });
                                    });
                                }
                            }
                        });
                    }
                    else{
                                
                        storage_interface.upload_image(image_requires_download, storage_ref.get_user_images_folder(), insert_object.img_title, files[0].buffer, false, function(img_title){
                            
                            insert_object.img_title_fullsize = img_title;
                            
                            storage_interface.upload_image(image_requires_download, storage_ref.get_user_images_folder(), insert_object.img_title, files[0].buffer, true, function(thumbnail_img_title){
                                
                                insert_object.img_title_thumbnail = thumbnail_img_title;

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
                                        response.send({failed: false, message: "Registration complete."});
                                    }
                                });
                            });
                        });
                    }
                });
            }
        });
    },
    
    updateUser: function(request, response){
        console.log("test completed 3.");
        console.log(request.body);
        response.send({test: "complete 4"});
    },
    
    deleteUser: function(request, response){
        
        //extract data
        var user_id = request.params.user_id;

        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{
                var user_id_object = BSON.ObjectID.createFromHexString(user_id);
                
                db.collection(db_ref.get_user_details_table()).findOne({ _id: user_id_object }, function(queryErr, user_obj) {
                    if(queryErr){ console.log(queryErr); }
                    else{
                        if(user_obj){
                            storage_interface.delete_image(storage_ref.get_user_images_folder(), user_obj.img_title_fullsize, function(img_title){
                            
                                storage_interface.delete_image(storage_ref.get_user_images_folder(), user_obj.img_title_thumbnail, function(thumbnail_img_title){
                                
                                     db.collection(db_ref.get_user_details_table()).deleteOne({ _id: user_id_object }, function(queryErr, docs) {
                                        if(queryErr){ console.log(queryErr); }
                                        else{
                                            response.status(200).send( {failed: false, message: "User has been deleted."} );
                                        }
                                    });
                                });
                            });
                        }
                    }
                });
            }
        });
    },
    
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
    },
    
    resetUserPassword: function(request, response){
        
        var email_address = request.body.email_address; //get form data
        
        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{
                db.collection(db_ref.get_user_details_table()).find({ email_address: email_address}).toArray(function(err, auth_arr){
                    if(err){ console.log(err); }
                    else{
                        if(auth_arr.length < 1){
                            response.send({failed: true, message: "Email address not found."});
                        }
                        else{
                            var existing_user_details = auth_arr[0];
                            
                            //send email with link in it to a page where a user can reset their password
                            
                            response.send({failed: false, message: "Email address found, endpoint not implemented."});
                        }
                    }
                });
            }
        });
    }
}