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
var random_id = require("random-id");

//internal dependencies
var db_ref = require("../config/db_config");
var db_interface = require("../interfaces/db_interface");
var storage_ref = require("../config/storage_config");
var storage_interface = require("../interfaces/storage_interface");
var email_interface = require("../interfaces/email_interface");
var hashing = require("../tools/hashing.js");

//objects
var User = require("../schemas/user.schema");
var default_img_title = "default";

var test_mode = false;

module.exports = {

    findUser: function (user_id, is_admin, callback) {

        var user_projection = { //non admin user projection
            $project: {
                "_id": 1,
                "username": 1,
                "first_name": 1,
                "last_name": 1,
                "email_address": 1,
                "d_o_b": 1,
                "img_title": 1,
                "date_created": 1,
                "admin": 1,
                "submitted_beef_ids": 1,
                "submitted_actor_ids": 1,
                "country": 1,
                "contribution_score": 1
            }
        };

        if (is_admin) { //return more data about a user if the request is coming from an admin
            user_projection["$project"]["ip_addresses"] = 1;
            user_projection["$project"]["last_seen"] = 1;
            user_projection["$project"]["viewed_beef_ids"] = 1;
            user_projection["$project"]["voted_on_beef_ids"] = 1;
        } 

        var query_config = {
            table: db_ref.get_user_details_table(),
            aggregate_array: [{
                    $match: { _id: BSON.ObjectID.createFromHexString(user_id) }
                },
                user_projection
            ]
        }

        db_interface.get(query_config, function (results) {
            callback(results[0]);
        },
        function (error_object) {
            callback(error_object)
        });
    },

    createUser: function (user_details, files, headers, callback) {

        //generate storable password data
        var password_data = hashing.hash_password(user_details.password);

        var new_user = User({
            username: user_details.username,
            first_name: user_details.first_name,
            last_name: user_details.last_name,
            email_address: user_details.email_address,
            hashed_password: password_data.hashed_password,
            salt: password_data.salt,
            d_o_b: user_details.d_o_b,
            img_title: user_details.img_title ? user_details.img_title : default_img_title,
            ip_addresses: headers && headers['x-forwarded-for'] ? [ headers['x-forwarded-for'] ] : [],
            date_created: new Date(),
            last_seen: new Date(),
            //conditionals are used so that createUser can create new users but also updateUser function can pass in existing fields
            admin: user_details.admin ? user_details.admin : false,
            viewed_beef_ids: user_details.viewed_beef_ids ? user_details.viewed_beef_ids : [],
            voted_on_beef_ids: user_details.voted_on_beef_ids ? user_details.voted_on_beef_ids : [],
            submitted_beef_ids: user_details.submitted_beef_ids ? user_details.submitted_beef_ids : [],
            submitted_actor_ids: user_details.submitted_actor_ids ? user_details.submitted_actor_ids : [],
            country: user_details.country ? user_details.country : null,
            contribution_score: user_details.contribution_score ? user_details.contribution_score : 0,
            registration_method: user_details.registration_method ? user_details.registration_method : "beeftracker",
            registration_is_pending: false
        });
            
        var query_config = {
            table: db_ref.get_user_details_table(),
            aggregate_array: [{
                $match: { $or: [{ username: user_details.username }, { email_address: user_details.email_address } ] }
            }]
        }

        //make sure username and email are both not taken
        db_interface.get(query_config, function (existing_user) {
            if (existing_user.username == user_details.username) {
                callback({
                    failed: true,
                    message: "Username is taken."
                });
            } else {
                callback({
                    failed: true,
                    message: "Email is taken."
                });
            }
        }, function(error_object){
            if(error_object.no_results_found){

                var warning_message;

                if (user_details.admin) { //if admin, check pending registered admin users table, to ensure a user hasnt previously requested admin registration with similar details
                    new_user.registration_is_pending = true;
                    warning_message = "Registration requires approval from an existing admin.";
                }

                var insert_user = function(insert_config, callback){
                
                    db_interface.insert(insert_config, function (result) {
                        callback(result);
                    },
                    function (error_object) {
                        callback(error_object);
                    });
                }

                var return_object = {
                    img_title: default_img_title,
                    warning_message: warning_message
                }

                var insert_config = {
                    record: new_user,
                    table: db_ref.get_user_details_table(),
                    options: {}
                }

                if (new_user.img_title != default_img_title) {

                    var upload_config = {
                        record_type: storage_ref.get_user_images_folder(),
                        item_data: [{
                            media_type: "image",
                            link: new_user.img_title,
                            file: files[0]
                        }],
                        files: files
                    };

                    storage_interface.upload(upload_config, function (image_items) {
                        insert_config.record.img_title = image_items[0].link;
                        insert_user(insert_config, function (result) {
                            return_object._id = result._id ? result._id : null;
                            callback(return_object);
                        });
                    });
                }
                else{
                    insert_user(insert_config, function (result) {
                        return_object._id = result._id ? result._id : null;
                        callback(return_object);
                    });
                }
            }
            else{
                callback(error_object);
            }
        });
    },

    updateUser: function (user_data, files, headers, existing_object_id, callback) {

        //ensures that _id is persistent past the update
        user_data._id = BSON.ObjectID.createFromHexString(existing_object_id);

        if (test_mode) {
            console.log("test mode is on.");
            callback({ failed: true, test_mode: true, message: "Test mode is on, the db was not updated, nothing was added to the file server.", event: user_data });
        }
        else {
            //delete existing event with files
            module.exports.deleteUser(existing_object_id, function(result){
                if(!result.failed){
                    //insert new event with files
                    module.exports.createUser(user_data, files, function(result){
                        callback(result);
                    });
                }
                else{
                    callback(result);
                }
            });
        }
    },

    deleteUser: function (user_id, callback) {

        var delete_config = {
            table: db_ref.get_user_details_table(),
            delete_multiple_records: false,
            match_query: {
                _id: BSON.ObjectID.createFromHexString(user_id)
            }
        };

        db_interface.delete(delete_config, function (user) {

            if (user.img_title != default_img_title) {

                var remove_config = {
                    items: [{
                        media_type: "image",
                        link: user.img_title 
                    }],
                    record_type: storage_ref.get_user_images_folder()
                };

                storage_interface.remove(remove_config, function (img_title) {
                    callback({});
                });
            }
            else{
                callback({});
            }
        },
        function (error_object) {
            callback(error_object);
        });
    },

    requestPasswordReset: function (email_address, callback) {

        var query_config = {
            table: db_ref.get_user_details_table(),
            aggregate_array: [{
                $match: {
                    email_address: email_address
                }
            }]
        };

        db_interface.get(query_config, function (users) {

            if (users.length < 1) {
                callback({
                    failed: true,
                    module: "users_controllers",
                    function: "requestPasswordReset",
                    message: "Email address not found."
                });
            } else {
                //generate unique token
                var id_token = random_id(40, "aA0");
                var existing_user_details = users[0];

                var insert_object = {
                    user_email: email_address,
                    id_token: id_token
                };

                var update_config = {
                    update_clause: {
                        $set: insert_object
                    },
                    table: db_ref.get_password_reset_request_table(),
                    options: {},
                    existing_object_id: existing_user_details._id,
                };

                //insert reset request token into the database to be accessed and checked later
                db_interface.update(update_config, function (record) {

                    var reset_url = "https://beeftracker.co.uk/reset-my-password/" + id_token;

                    var send_email_config = {
                        email_title: "Beeftracker password reset",
                        email_html: "<b>Reset link</b> <a href=" + reset_url + ">Reset</a>",
                        recipient_address: email_address
                    }

                    email_interface.send(send_email_config, function () {
                            callback(record);
                        },
                        function (error_object) {
                            callback(error_object);
                        });
                });
            }
        });
    },

    executePasswordReset: function (id_token, new_password, callback) {

        var delete_config = {
            table: db_ref.get_password_reset_request_table(),
            match_query: {
                id_token: id_token
            },
            delete_multiple_records: false
        };

        db_interface.delete(delete_config, function (record) {

            if (!record) {
                callback({
                    failed: true,
                    module: "users_controller",
                    function: "executePasswordReset",
                    message: "Password reset request not found."
                });
            } else {
                password_data = hashing.hash_password(new_password);

                var update_config = {
                    table: db_ref.get_password_reset_request_table(),
                    match_query: {
                        user_email: record.email_address
                    },
                    update_clause: {
                        $set: {
                            hashed_password: password_data.hashed_password,
                            salt: password_data.salt
                        }
                    },
                    options: {}
                };

                db_interface.update(update_config, function (record) {
                    console.log("Password reset request document inserted.")
                    callback(record);
                })
            }
        });
    },

    addViewedBeefEventToUser(user_id, event_id, callback) {

        var update_config = {
            update_clause: {
                $push: {
                    viewed_beef_ids: {
                        id: BSON.ObjectID.createFromHexString(event_id),
                        date: new Date()
                    }
                }
            },
            table: db_ref.get_user_details_table(),
            options: {},
            match_query: {
                _id: user_id
            }
        }

        db_interface.update(update_config, function (record) {
                callback(record);
            },
            function (error_object) {
                callback(error_object);
            });
    },

    updateUserImage: function (user_id, new_gallery_item, new_file, callback) {

        var query_config = {
            table: db_ref.get_user_details_table(),
            aggregate_array: [{
                $match: {
                    _id: BSON.ObjectID.createFromHexString(user_id)
                }
            }]
        };

        db_interface.get(query_config, function (results) {

                var existing_user_img = results[0].img_title;

                var upload_config = {
                    record_type: storage_ref.get_user_images_folder(),
                    item_data: [new_gallery_item.link],
                    files: [new_file.buffer]
                };

                storage_interface.upload(upload_config, function (item_data) {
                    //storage_interface.upload_image(false, storage_ref.get_user_images_folder(), new_gallery_item.link, new_file.buffer, false, function(img_title){

                    var update_config = {
                        table: db_ref.get_user_details_table(),
                        match_query: {
                            _id: user_id
                        },
                        update_clause: {
                            $set: {
                                img_title: item_data[0].img_title
                            }
                        },
                        options: {}
                    };

                    db_interface.update(update_config, function (results) {
                            callback({});
                        },
                        function (error_object) {
                            callback(error_object);
                        });
                });

                if (existing_user_img != default_img_title) {
                    //delete old image
                    storage_interface.delete_image(storage_ref.get_user_images_folder(), existing_user_img, function () {
                        console.log("old user image deleted");
                    })
                }
            },
            function (error_object) {
                callback(error_object);
            });
    }
}