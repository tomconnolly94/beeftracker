//external dependencies
var BSON = require("bson");
var nodemailer = require('nodemailer');

//internal dependencies
var db_ref = require("../config/db_config.js");
var storage_ref = require("../config/storage_config.js");
var storage_interface = require('../interfaces/storage_interface.js');
var hashing = require("../tools/hashing.js");
var random_id = require("random-id");
        
module.exports = {
    
    findUser: function(user_id, is_admin, callback){
        
        var user_id_object = BSON.ObjectID.createFromHexString(user_id);
        var user_projection;
                
        if(is_admin){ //return more data about a user if the request is coming from an admin
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
    
    createUser: function(user_details, files, headers, callback){
        
        //check for duplicate username or email address before allowing user to register
        var check_details_against_user_table = function(db, user_details, insert_object, success_callback){

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
                        success_callback();
                    }
                }
            });
        }
        
        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{
                
                var ip_address = null;
                var password_data = { 
                    hashed_password: null,
                    salt: null
                }
                
                //if client provides an ip address, create new jsonwebtoken with it and store as cookie
                if(headers && headers['x-forwarded-for']){
                    ip_address = headers['x-forwarded-for'];
                }                     
                
                //generate password if its provided
                if(user_details.password){
                    password_data = hashing.hash_password(user_details.password);
                }
                
                var birth_date;
                
                //prepare date of birth
                if(user_details.d_o_b){
                    var split_birth_date = user_details.d_o_b.split("/");
                    birth_date = new Date(split_birth_date[2], split_birth_date[1]-1, split_birth_date[0])
                }
                
                var insert_object = { 
                    username: user_details.username,
                    first_name: user_details.first_name,
                    last_name: user_details.last_name,
                    email_address: user_details.email_address,
                    hashed_password: password_data.hashed_password, 
                    salt: password_data.salt,
                    d_o_b: birth_date,
                    img_title: user_details.img_title ? user_details.img_title : "default",
                    ip_addresses: ip_address ? [ ip_address ] : [ ],
                    date_created: new Date(),
                    last_seen: new Date(),
                    admin: user_details.admin ? user_details.admin : false,
                    registration_method: user_details.registration_method ? user_details.registration_method : "beeftracker"
                };
                
                var image_requires_download = true;
                var file_buffer;

                if(files && files[0]){
                    image_requires_download = false;
                    file_buffer = files[0];
                }
                
                var create_user = function(insert_object, table, img_title, additional_message){
                    
                    insert_object.img_title_fullsize = img_title ? img_title : "default_user_img";
                    var success_message = "Registration complete." + additional_message ? additional_message : "";

                    //insert new user record
                    db.collection(table).insert(insert_object, function(err, document){
                        if(err){ console.log(err); }
                        else{
                            console.log(document);
                            callback({ user_id: document.ops[0]._id, message: success_message});
                        }
                    });
                }
                
                //make sure username and email are both not taken
                check_details_against_user_table(db, user_details, insert_object, function(){
                    
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
                                        create_user(insert_object, db_ref.get_pending_registered_admin_users_table(), img_title, "Requires approval from an existing admin.");
                                    });
                                }
                            }
                        });
                    }
                    else{
                                                
                        //add extra fields if not an admin user
                        insert_object.viewed_beef_ids = [];
                        insert_object.submitted_beef_ids = [];
                        insert_object.submitted_actor_ids = [];
                        insert_object.country = user_details.country;
                        insert_object.contribution_score = 0;
                        
                        if(insert_object.img_title != "default"){
                            storage_interface.upload_image(image_requires_download, storage_ref.get_user_images_folder(), insert_object.img_title, file_buffer, false, function(img_title){
                                create_user(insert_object, db_ref.get_user_details_table(), img_title);
                            });
                        }
                        else{
                            create_user(insert_object, db_ref.get_user_details_table());
                        }
                    }
                });
            }
        });
    },
    
    updateUser: function(user_details, files, headers, existing_object_id, callback){
        
        //extract data for use later
        var existing_user_id_object = BSON.ObjectID.createFromHexString(existing_object_id);

        var ip_address = null;
        //if client provides an ip address, create new jsonwebtoken with it and store as cookie
        if(headers && headers['x-forwarded-for']){
            ip_address = headers['x-forwarded-for'];
        }                     


        var birth_date;

        //prepare date of birth
        if(user_details.d_o_b){
            var split_birth_date = user_details.d_o_b.split("/");
            birth_date = new Date(split_birth_date[2], split_birth_date[1]-1, split_birth_date[0])
        }

        var insert_object = { 
            username: user_details.username,
            first_name: user_details.first_name,
            last_name: user_details.last_name,
            email_address: user_details.email_address,
            d_o_b: birth_date,
            img_title: user_details.img_title,
            last_seen: new Date()
        };

        //generate password data if password provided
        if(user_details.password){
            password_data = hashing.hash_password(user_details.password);
            
            insert_object.hashed_password = password_data.hashed_password;
            insert_object.salt = password_data.salt;
        }
        
        var image_requires_download = true;
        var file_buffer;

        if(files && files[0]){
            image_requires_download = false;
            file_buffer = files[0].buffer;
        }
        
        
        console.log(file_buffer);
        console.log(files);

        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{
                
                db.collection(db_ref.get_user_details_table()).find({ _id: existing_user_id_object }).toArray(function(err, auth_arr){
                    if(err){ console.log(err); }
                    else{
                        if(auth_arr.length == 1){ //ensure only one user matches the provided _id 
                            
                            if(ip_address != null){
                                //add ip address
                                insert_object.ip_addresses = auth_arr[0].ip_addresses;
                                insert_object.ip_addresses.push(ip_address)
                            }
                            
                            console.log(auth_arr[0]);
                            console.log("#'#############################");
                            console.log(insert_object);
                            
                            if(auth_arr[0].img_title == insert_object.img_title){
                                //insert new user record
                                db.collection(db_ref.get_user_details_table()).update({ _id: existing_user_id_object }, { $set: insert_object }, function(err, document){
                                    if(err){ console.log(err); }
                                    else{
                                        callback({ user_id: existing_object_id, message: "User updated." });
                                    }
                                });
                            }
                            else{
                                
                                //delete previous images
                                storage_interface.delete_image(storage_ref.get_user_images_folder(), auth_arr[0].img_title_fullsize, function(){
                                    storage_interface.delete_image(storage_ref.get_user_images_folder(), auth_arr[0].img_title_thumbnail, function(){
                                                                
                                        storage_interface.upload_image(image_requires_download, storage_ref.get_user_images_folder(), insert_object.img_title, file_buffer, false, function(img_title){

                                            insert_object.img_title_fullsize = img_title;

                                            storage_interface.upload_image(image_requires_download, storage_ref.get_user_images_folder(), insert_object.img_title, file_buffer, true, function(thumbnail_img_title){

                                                insert_object.img_title_thumbnail = thumbnail_img_title;
                                                //insert new user record
                                                db.collection(db_ref.get_user_details_table()).update({ _id: existing_user_id_object }, { $set: insert_object }, function(err, document){
                                                    if(err){ console.log(err); }
                                                    else{
                                                        callback({ user_id: existing_object_id, message: "User updated." });
                                                    }
                                                });
                                            });
                                        });
                                    });
                                });
                            }
                        }
                    }
                });
            }
        });
    },
    
    deleteUser: function(request, response, callback){
        
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
    
    requestPasswordReset: function(email_address, callback){
        
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
                            
                            //generate unique token
                            var id_token = random_id(40);
                            
                            var insert_object = {
                                user_email: email_address,
                                id_token: id_token
                            };
                            
                            //insert reset request token into the database to be accessed and checked later
                            db.collection(db_ref.get_password_reset_request_table()).update({ user_email: email_address }, insert_object, {upsert: true}, function(err, document){
                                console.log("Password reset request document inserted.")
                            });
                            
                            //send email with link in it to a page where a user can reset their password
                            var transporter = nodemailer.createTransport({
                                service: 'Gmail',
                                auth: {
                                    user: process.env.SERVER_EMAIL_ADDRESS,
                                    pass: process.env.SERVER_EMAIL_PASSWORD
                                }
                            });
                            
                            var reset_url = "https://beeftracker.co.uk/reset-my-password/" + id_token;

                            //config mail options
                            var mailOptions = {
                                from: 'noreply@beeftracker.com', // sender address
                                to: email_address, // list of receivers
                                subject: "Beeftracker password reset", // Subject line
                                //text: text //, // plaintext body
                                html: '<b>Reset link</b> <a href=' + reset_url + '>Reset</a>' // You can choose to send an HTML body instead
                            };

                            //send email notifying beeftracker account new submisson
                            transporter.sendMail(mailOptions, function(error, info){
                                if(error){ console.log(error); }
                                else{
                                    console.log('Message sent: ' + info.response);
                                    //callback({ id: insert_object._id });
                                    //callback(null);
                                };
                            });
                            callback({ message: "Email address found, endpoint not yet implemented."});
                        }
                    }
                });
            }
        });
    },
    
    executePasswordReset: function(id_token, new_password, callback){
        
        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{
                db.collection(db_ref.get_password_reset_request_table()).findOneAndDelete({ id_token: id_token}).toArray(function(err, password_reset_documents){
                    if(err){ console.log(err); }
                    else{
                        if(password_reset_documents.length < 1){
                            callback({ failed: true, message: "Password reset request not found."});
                        }
                        else{
                            var password_reset_request = password_reset_documents[0];
                            
                            password_data = hashing.hash_password(new_password);
                            
                            var insert_object = {
                                hashed_password: password_data.hashed_password,
                                salt: password_data.salt
                            };
                            
                            //insert reset request token into the database to be accessed and checked later
                            db.collection(db_ref.get_password_reset_request_table()).update({ user_email: email_address }, { $set: insert_object } , function(err, document){
                                console.log("Password reset request document inserted.")
                            });
                            
                            callback({ message: "Email address found, endpoint not yet implemented."});
                        }
                    }
                });
            }
        });
    }
}