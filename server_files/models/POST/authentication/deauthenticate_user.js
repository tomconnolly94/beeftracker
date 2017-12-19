//get database reference object
var db_ref = require("../../../db_config.js");
var cookie_parser = require("../../../cookie_parsing.js");
//var BSON = require('bson');
var bodyParser = require("body-parser");
var jwt = require("jsonwebtoken");

//configure testing mode, if set: true, record will be collected, printed but not sent to db and no email notification will be sent.
var test_mode = false;

module.exports = {
    
    execute : function(request, response) {

        //extract data for use later
        var db_url = process.env.MONGODB_URI; //get db uri
        var auth_details = request.body; //get form data
        
        var cookies = cookie_parser.parse_cookies(request);
        
        //store data temporarily until submission is confirmed
        db_ref.get_db_object().connect(db_url, function(err, db) {
            if(err){ console.log(err); }
            else{
                
                var remove_query = { token: cookies.auth_cookie };
                                
                //create session record with username, token and ip address
                db.collection(db_ref.get_session_table()).remove(remove_query, function(err, document){
                    if(err){ console.log(err); }
                    else{

                        response.cookie( "auth_cookie", "0", { expires: new Date(0), httpOnly: true });
                        response.cookie( "logged_in", "false", { expires: new Date(0)});
                        response.send({ auth_success: false});
                    }
                });
            }
        });
    }
}