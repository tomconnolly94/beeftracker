//get database reference object
var db_ref = require("../../../db_config.js");
//var BSON = require('bson');
var morgan = require("morgan");
var bodyParser = require("body-parser");
var jwt = require("jsonwebtoken");

//configure testing mode, if set: true, record will be collected, printed but not sent to db and no email notification will be sent.
var test_mode = false;

module.exports = {
    
    execute : function(request, response) {

        //extract data for use later
        var db_url = process.env.MONGODB_URI; //get db uri
        var auth_details = request.body; //get form data

        console.log(auth_details);
        
        //store data temporarily until submission is confirmed
        db_ref.get_db_object().connect(db_url, function(err, db) {
            if(err){ console.log(err); }
            else{
                //standard query to insert into live events table
                db.collection(db_ref.get_authentication_table()).aggregate([{ $match: { username: auth_details.username } }]).toArray(function(err, auth_arr){
                    if(err){ console.log(err); }
                    else{
                        console.log(auth_arr[0]);
                        response.send(auth_arr[0]);
                    }
                });
            }
        });
    }
}