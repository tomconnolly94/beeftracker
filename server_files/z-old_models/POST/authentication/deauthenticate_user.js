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

        //set all cookies to expire immediately
        response.cookie( "auth", "0", { expires: new Date(0), httpOnly: true });
        response.cookie( "logged_in", "false", { expires: new Date(0)});
        response.send({ deauth_success: true});
    }
}