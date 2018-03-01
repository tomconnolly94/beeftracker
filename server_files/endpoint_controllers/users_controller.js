//external dependencies
var BSON = require("bson");

//internal dependencies
var db_ref = require("../config/db_config.js");
var storage_ref = require("../config/storage_config.js");
var storage_interface = require('../interfaces/storage_interface.js');
var hashing = require("../tools/hashing.js");
        
module.exports = {
    
    getUser: function(request, response){
        
        var user_id = request.params.user_id;
        var user_id_object = BSON.ObjectID.createFromHexString(user_id);
        var user_projection;
                
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
                            callback({ failed: true, message: "Could not find user." });
                        }
                        else{
                            callback(users[0]);
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
                            callback({failed: true, message: "Username is taken."});
                        }
                        else{
                            callback({failed: true, message: "Email is taken."});
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
                                        callback({failed: true, message: "Username is taken. (admin)"});
                                    }
                                    else{
                                        callback({failed: true, message: "Email is taken. (admin)"});
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
                                                    callback({message: "Registration complete, requires approval from an existing admin."});
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
                                        callback({message: "Registration complete."});
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
        console.log(request.body);
        response.send({test: "endpoinjt not implemented yet."});
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
                                            callback({ message: "User has been deleted." });
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
    
    resetUserPassword: function(request, response){
        
        var email_address = request.body.email_address; //get form data
        
        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{
                db.collection(db_ref.get_user_details_table()).find({ email_address: email_address}).toArray(function(err, auth_arr){
                    if(err){ console.log(err); }
                    else{
                        if(auth_arr.length < 1){
                            callback({ failed: true, message: "Email address not found."});
                        }
                        else{
                            var existing_user_details = auth_arr[0];
                            
                            //send email with link in it to a page where a user can reset their password
                            
                            callback({ message: "Email address found, endpoint not yet implemented."});
                        }
                    }
                });
            }
        });
    }
}