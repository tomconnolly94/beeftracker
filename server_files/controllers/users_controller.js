////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Module: users_controller
// Author: Tom Connolly
// Description: Module to handle CRUD operations on user objects in the DB, also responsible for 
// password reset requests for users and updating various data fields (like viewed_beef_events)
// Testing script: test/unit_testing/controller_tests/users_controller.test.js
//
////////////////////////////////////////////////////////////////////////////////////////////////////

//external dependencies
var BSON = require("bson");

//internal dependencies
var db_ref = require("../config/db_config");
var db_interface = require("../interfaces/db_interface");
var storage_ref = require("../config/storage_config");
var storage_interface = require("../interfaces/storage_interface");
var email_interface = require("../interfaces/email_interface");
var hashing = require("../tools/hashing.js");
var random_id = require("random-id");

//check for duplicate username or email address before allowing user to register
var check_details_against_user_table = function(user_details, insert_object, callback){

    var query_config = {
        table: db_ref.get_user_details_table(),
        aggregate_array: [
            {
                $match: {
                    $or: [
                        { username: user_details.username }, 
                        { email_address: user_details.email_address } 
                    ]
                }
            }
        ]
    }

    db_interface.get(query_config, function(results){
        if(results.length > 0){
            if(results[0].username == user_details.username){
                callback({failed: true, message: "Username is taken."});
            }
            else{
                callback({failed: true, message: "Email is taken."});
            }
        }
        else{
            callback({});
        }
    });
}

//encapsulate formatting and call to insert data into the users database
var insert_new_user = function(insert_object, table, callback){

    var insert_config = {
        record: insert_object,
        table: table,
        options: {}
    }

    db_interface.insert(insert_config, function(record){
        callback({ user_id: record.id});
    },
    function(error_object){
        callback(error_object);
    });
}

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
                    "contribution_score": 1,
                    "voted_on_beef_ids": 1
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
                    "viewed_beef_ids": 1,
                    "submitted_beef_ids": 1,
                    "submitted_actor_ids": 1,
                    "country": 1,
                    "contribution_score": 1,
                    "voted_on_beef_ids": 1
                }
            }            
        }
        
        var query_config = {
            table: db_ref.get_user_details_table(),
            aggregate_array: [
                {
                    $match: { 
                        _id: user_id_object 
                    } 
                },
                user_projection
            ]
        }
        
        db_interface.get(query_config, function(results){
            if(results.length < 1){
                callback({ failed: true, module: "users_controller", function: "findUser", message: "Could not find user." });
            }
            else{
                callback(results[0]);
            }
        },
        function(error_object){
            callback(error_object)
        });
    },
    
    createUser: function(user_details, files, headers, callback){
        
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

        //make sure username and email are both not taken
        check_details_against_user_table(user_details, insert_object, function(result){
            
            if(result.failed){
                callback(result);
            }
            else{
                if(user_details.admin){ //if admin, check pending registered admin users table, to ensure a user hasnt previously requested admin registration with similar details

                    var query_config = {
                        table: db_ref.get_pending_registered_admin_users_table(),
                        aggregate_array: [
                            { 
                                $match: { 
                                    $or: [ 
                                        { username: user_details.username}, 
                                        { email_address: user_details.email_address } 
                                    ] 
                                } 
                            }
                        ]
                    }

                    db_interface.get(query_config, function(results){
                        if(results.length > 0){
                            if(results[0].username == user_details.username){
                                callback({failed: true, message: "Username is taken. (admin)"});
                                //{ failed: true, stage: "controller_function", message: "Username is taken. (admin)", details: [{ location: "Username", problem: "This username is taken."}] }
                            }
                            else{
                                callback({failed: true, message: "Email is taken. (admin)"});
                            }
                        }
                        else{

                            var upload_config = {
                                record_type: storage_ref.get_user_images_folder(),
                                items: [ insert_object ],
                                files: files
                            };
                            
                            storage_interface.upload(upload_config, function(img_title){
                                insert_new_user(insert_object, db_ref.get_pending_registered_admin_users_table(), function(result){
                                    if(!result.failed){
                                        result.message = "Requires approval from an existing admin.";
                                    }
                                    callback(result);
                                });
                            });
                        }
                    },
                    function(error_object){
                        callback(error_object);
                    });
                }
                else{

                    //add extra fields if not an admin user
                    insert_object.viewed_beef_ids = [];
                    insert_object.voted_on_beef_ids = [];
                    insert_object.submitted_beef_ids = [];
                    insert_object.submitted_actor_ids = [];
                    insert_object.country = user_details.country;
                    insert_object.contribution_score = 0;

                    if(insert_object.img_title != "default"){
                        
                        var upload_config = {
                            record_type: storage_ref.get_user_images_folder(),
                            item_data: [{
                                media_type: "image",
                                link: insert_object.img_title,
                                file: files[0]
                            }],
                            files: files
                        };
                        
                        storage_interface.upload(upload_config, function(img_title){
                            insert_new_user(insert_object, db_ref.get_user_details_table(), function(result){
                                callback(result);
                            });
                        });
                    }
                    else{
                        insert_new_user(insert_object, db_ref.get_user_details_table(), function(){
                            callback(result);
                        });
                    }
                }
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
        
        var query_config = {
            table: db_ref.get_user_details_table(),
            aggregate_array: [
                {
                    $match: { _id: existing_user_id_object }
                }
            ]
        }
        
        db_interface.get(query_config, function(auth_arr){
            if(auth_arr.length == 1){ //ensure only one user matches the provided _id 

                if(ip_address != null){
                    //add ip address
                    insert_object.ip_addresses = auth_arr[0].ip_addresses;
                    insert_object.ip_addresses.push(ip_address)
                }

                if(auth_arr[0].img_title == insert_object.img_title){ //if image text is equal then no updates are necessary TODO: is that correct? wont it compare the uploaded image title to the cloudinary generated id?
                    
                    var update_config = {
                        update_clause: { $set: insert_object },
                        table: db_ref.get_user_details_table(),
                        options: {},
                        existing_object_id: existing_user_id_object,
                    };

                    db_interface.update(update_config, function(){
                        callback({ user_id: existing_object_id, message: "User updated." });
                    },
                    function(error_object){
                        callback(error_object);
                    });
                }
                else{

                    var delete_config = {
                        items: [{ link: auth_arr[0].img_title }],
                        record_type: storage_ref.get_user_images_folder()
                    };

                    //delete previous images
                    storage_interface.remove(delete_config, function(){
                        
                        var upload_config = {
                            record_type: storage_ref.get_user_images_folder(),
                            item_data: [ insert_object ],
                            files: [ file_buffer ]
                        };

                        storage_interface.upload(upload_config, function(img_title){

                            var update_config = {
                                update_clause: { $set: insert_object },
                                table: db_ref.get_user_details_table(),
                                options: {},
                                existing_object_id: existing_user_id_object,
                            };
                            
                            db_interface.update(update_config, function(){
                                callback({ user_id: existing_object_id, message: "User updated." });
                            },
                            function(error_object){
                                callback(error_object);
                            });
                        });
                    });
                }
            }
        });
    },
    
    deleteUser: function(user_id, callback){
        
        //extract data
        var user_id_object = BSON.ObjectID.createFromHexString(user_id);

        var query_config = {
            table: db_ref.get_user_details_table(),
            aggregate_array: [
                {  $match: { _id: user_id_object } }
            ]
        };
        db_interface.get(query_config, function(results){
            
            if(results.length > 0){
                
                var user = results[0];
                
                var remove_config = {
                    items: [ user ],
                    record_type: storage_ref.get_user_images_folder()
                };
                
                storage_interface.remove(remove_config, function(img_title){

                    var delete_config = {
                        table: db_ref.get_user_details_table(),
                        delete_multiple_records: false,
                        match_query: { _id: user_id_object }
                    };
                    
                    db_interface.delete(delete_config, function(result){
                        callback(result);
                    },
                    function(error_object){
                        callback(error_object);
                    });
                });
            }
        },
        function(error_object){
            callback(error_object);
        });
    },
    
    requestPasswordReset: function(email_address, callback){
        
        var query_config = {
            table: db_ref.get_user_details_table(),
            aggregate_array: [
                { $match: { email_address: email_address} }
            ]
        };

        db_interface.get(query_config, function(users){

            if(users.length < 1){
                callback({ failed: true, module: "users_controllers", function: "requestPasswordReset", message: "Email address not found."});
            }
            else{
                //generate unique token
                var id_token = random_id(40, "aA0");
                var existing_user_details = users[0];

                var insert_object = {                    
                    user_email: email_address,
                    id_token: id_token
                };

                var update_config = {
                    update_clause: { $set: insert_object },
                    table: db_ref.get_password_reset_request_table(),
                    options: {},
                    existing_object_id: existing_user_details._id,
                };

                //insert reset request token into the database to be accessed and checked later
                db_interface.update(update_config, function(record){

                    var reset_url = "https://beeftracker.co.uk/reset-my-password/" + id_token;

                    var send_email_config = {
                        email_title: "Beeftracker password reset",
                        email_html: "<b>Reset link</b> <a href=" + reset_url + ">Reset</a>",
                        recipient_address: email_address
                    }
                    
                    email_interface.send(send_email_config, function(){
                        callback(record);                    
                    },
                    function(error_object){
                        callback(error_object);
                    });
                });
            }
        });
    },
    
    executePasswordReset: function(id_token, new_password, callback){
        
        var delete_config = {
            table: db_ref.get_password_reset_request_table(),
            match_query: { id_token: id_token },
            delete_multiple_records: false
        };

        db_interface.delete(delete_config, function(record){

            if(!record){
                callback({ failed: true, module: "users_controller", function: "executePasswordReset", message: "Password reset request not found."});
            }
            else{
                password_data = hashing.hash_password(new_password);

                var update_config = {
                    table: db_ref.get_password_reset_request_table(),
                    match_query: { user_email: record.email_address },
                    update_clause: { 
                        $set: {
                            hashed_password: password_data.hashed_password,
                            salt: password_data.salt
                        } 
                    },
                    options: {}
                };

                db_interface.update(update_config, function(record){
                    console.log("Password reset request document inserted.")
                    callback(record);
                })
            }
        });
    },
    
    addViewedBeefEventToUser(user_id, event_id, callback){
                        
        var event_id_object = BSON.ObjectID.createFromHexString(event_id);

        var update_config = {
            update_clause: { 
                $push: { 
                    viewed_beef_ids: { 
                        id: event_id_object, 
                        date: new Date() 
                    }
                }
            },
            table: db_ref.get_user_details_table(),
            options: {},
            match_query: { _id: user_id }
        }

        db_interface.update(update_config, function(record){
            callback(record);
        },
        function(error_object){
            callback(error_object);
        });
    },
        
    updateUserImage: function(user_id, new_gallery_item, new_file, callback){

        var query_config = {
            table: db_ref.get_user_details_table(),
            aggregate_array: [
                {
                    $match: { _id: user_id_object }
                }
            ]
        };

        db_interface.get(query_config, function(results){

            var existing_user = results[0];
            var existing_user_img = results[0].img_title;

            var upload_config = {
                record_type: storage_ref.get_user_images_folder(),
                item_data: [ new_gallery_item.link ],
                files: [ new_file.buffer ]
            };
            
            storage_interface.upload(upload_config, function(item_data){
            //storage_interface.upload_image(false, storage_ref.get_user_images_folder(), new_gallery_item.link, new_file.buffer, false, function(img_title){

                var update_config = {
                    table: db_ref.get_user_details_table(),
                    match_query: { _id: user_id },
                    update_clause: { $set: { img_title: item_data[0].img_title } },
                    options: {}
                };

                db_interface.update(update_config, function(results){
                    callback({});
                },
                function(error_object){
                    callback(error_object);
                });
            });
            
            if(existing_user_img != "default"){
                //delete old image
                storage_interface.delete_image(storage_ref.get_user_images_folder(), existing_user_img, function(){
                    console.log("old user image deleted");
                })
            }
        },
        function(error_object){
            callback(error_object);
        });
    },
}