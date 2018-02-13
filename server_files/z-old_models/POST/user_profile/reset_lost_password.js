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
        var email_address = request.body.email_address; //get form data
        

        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{

                db.collection(db_ref.get_user_details_table()).find({ email_address: email_address}).toArray(function(err, auth_arr){
                    if(err){ console.log(err); }
                    else{
                        if(auth_arr.length < 1){
                            response.send({success: false, message: "Email address not found."});
                        }
                        else{
                            var existing_user_details = auth_arr[0];
                            
                            //send email with link in it to a page where a user can reset their password
                            
                        }
                    }
                });
            }
        });
    }
}