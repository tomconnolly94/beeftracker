"use strict";
//get database reference object
var db_ref = require("../../../db_config.js");
var hashing = require("../../../hashing.js");
var bodyParser = require("body-parser");
var BSON = require("bson");

//configure testing mode, if set: true, record will be collected, printed but not sent to db and no email notification will be sent.
var test_mode = false;

module.exports = {
    
    execute : function(request, response) {

        //extract data for use later
        var db_url = process.env.MONGODB_URI; //get db uri
        var new_user_details = request.body; //get form data
                
        //ensure the token that has been previously authenticated, matches the user who's data will be updated.
        if(request.authenticated_user_id == new_user_details._id){

            db_ref.get_db_object().connect(db_url, function(err, db) {
                if(err){ console.log(err); }
                else{

                    var object = BSON.ObjectID.createFromHexString(new_user_details._id);

                    db.collection(db_ref.get_user_details_table()).find({ _id: object}).toArray(function(err, auth_arr){
                        if(err){ console.log(err); }
                        else{
                            if(auth_arr.length < 1){
                                response.send({success: false, message: "Username not found."});
                            }
                            else{
                                var existing_user_details = auth_arr[0];
                                
                                var new_password_data = null;
                                var birth_date = null;

                                if(new_user_details.password){
                                    new_password_data = hashing.hash_password(new_user_details.password);
                                }

                                //prepare date of birth
                                if(new_user_details.d_o_b){
                                    birth_date = new_user_details.d_o_b.split("/");
                                }

                                //for each field, check if a new value is provided, if so, update the value, if not use existing value
                                var insert_object = { 
                                    username: new_user_details.username ? new_user_details.username : existing_user_details.username,
                                    first_name: new_user_details.first_name ? new_user_details.first_name : existing_user_details.first_name,
                                    last_name: new_user_details.last_name ? new_user_details.last_name : existing_user_details.last_name,
                                    email_address: new_user_details.email_address ? new_user_details.email_address : existing_user_details.email_address,
                                    hashed_password: new_user_details.password ? new_password_data.hashed_password : existing_user_details.hashed_password, 
                                    salt: new_user_details.password ? new_password_data.salt : existing_user_details.salt,
                                    d_o_b: new_user_details.d_o_b ? new Date(birth_date[2], birth_date[1]-1, birth_date[0]) : existing_user_details.d_o_b,
                                    img_title: new_user_details.img_title ? new_user_details.img_title : existing_user_details.img_title,
                                    ip_addresses: existing_user_details.ip_addresses,
                                    date_created: existing_user_details.date_created,
                                    last_seen: existing_user_details.last_seen,
                                    admin: existing_user_details.admin
                                };

                                db.collection(db_ref.get_user_details_table()).update({ _id: object }, insert_object, function(err, update_response){
                                    response.send({success: true, message: "User details updated."})
                                });
                            }
                        }
                    });
                }
            });
         }
        else{
            //auth token does not match the user for which the info update request has been made
            response.send({success: false, message: "Token invalid for the user info update request."});
        }
            
    }
}