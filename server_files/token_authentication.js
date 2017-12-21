//get database reference object
var db_ref = require("./db_config.js");
//var BSON = require('bson');
var bodyParser = require("body-parser");
var jwt = require("jsonwebtoken");
var os = require("os");
var cookie_parser = require('./cookie_parsing.js');

//configure testing mode, if set: true, record will be collected, printed but not sent to db and no email notification will be sent.
var test_mode = false;

module.exports = {
    
    authenticate_token : function(request, response, next) {
        
        //extract data for use later
        var db_url = process.env.MONGODB_URI; //get db uri
        var session_details = request.body; //get form data

        console.log(session_details);
        console.log(request.headers);

        var cookies = cookie_parser.parse_cookies(request);

        console.log(cookies);

        //store data temporarily until submission is confirmed
        db_ref.get_db_object().connect(db_url, function(err, db) {
            if(err){ console.log(err); }
            else{

                var query_object = { token: cookies.auth_cookie };

                if(session_details.ip_address){
                    query_object.ip_address = session_details.ip_address;
                }

                console.log(query_object);

                //standard query to insert into live events table
                db.collection(db_ref.get_session_table()).aggregate([{ $match: query_object }]).toArray(function(err, session_arr){
                    if(err){ console.log(err); }
                    else {

                        console.log(session_arr);

                        if(session_arr.length < 1){                        
                            console.log(session_arr)
                            response.render('pages/authentication/auth.ejs');
                        }
                        else if(session_arr[0].expires < new Date()){
                            console.log("expired cookie.");
                        }
                        else{
                            next();   
                        }
                    }
                });
            }
        });
    }
}