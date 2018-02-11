//get database reference object
var db_ref = require("../../db_config.js");
var BSON = require('bson');
var nodemailer = require('nodemailer'); 

//configure testing mode, if set: true, record will be collected, printed but not sent to db and no email notification will be sent.
var test_mode = false;

module.exports = {
    
    execute : function(request, response) {

        //extract data for use later
        var url = process.env.MONGODB_URI; //get db uri
        var submission_data = request.body; //get form data

        console.log(submission_data);

        //format data for db insertion
        var names = submission_data.name.split(" ");
        var fore_name = names[0];
        var middle_names = "";
        var last_name = "";

        //assign last name if it exists
        if(names.length > 1){
            last_name = names[names.length-1];
        }

        //build a string of middle names if they exist
        if(names.length > 2){
            for(var i = 1; i < names.length-1; i++){
                if(i != 1){
                    middle_names += " ";
                }
                middle_names += names[i];
            }
        }

        //format object for insertion into pending db
        var insert_object = {        
            "f_name" : fore_name,
            "m_names" : middle_names,
            "l_name" : last_name,
            "email" : submission_data.email_address,
            "route_here" : submission_data.routes_here
        }

        console.log(insert_object);

        //store data temporarily until submission is confirmed
        db_ref.get_db_object().connect(url, function(err, db) {
            if(err){ console.log(err); }
            else{
                //standard query to match an event and resolve aggressor and targets references
                db.collection(db_ref.get_current_subscriber_details_table()).insert(insert_object);
            }
        });

        response.end(); //send ok or error response to client
    }
}