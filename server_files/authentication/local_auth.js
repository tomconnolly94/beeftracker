//external dependencies
var express = require('express')
var router = express.Router()
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var jwt = require("jsonwebtoken");

//internal dependencies
var token_authentication = require("../tools/token_authentication.js"); //get token authentication object
var authentication_controller = require('../controllers/authentication_controller');
var db_ref = require("../config/db_config.js");
var hashing = require("../tools/hashing.js");

//cookie config
var cookies_http_only = true;
var cookies_secure = process.env.NODE_ENV == "heroku_production" ? true : false; //use secure cookies when on heroku server, dont use when 
        
router.use(passport.initialize());

/*passport.serializeUser(function(user, done){
   console.log("serialize user.");
   done(null, user.id)
});

passport.deserializeUser(function(id, done){
   console.log("deserialize user.");
    done(id);
});*/

    
function create_auth_cookies(user_details, response, headers, callback){

    //create exp date
    var expiry_timestamp = Math.floor(Date.now() + (1000 * 60 * 60));
    var ip_loc = null;

    //if client provides an ip address, extract it
    if(headers['x-forwarded-for']){
        ip_loc = headers['x-forwarded-for'];
    }

    //generate an auth token
    var auth_token = jwt.sign({ exp: expiry_timestamp, username: user_details.username, _id: user_details._id, admin: user_details.admin, ip_loc: ip_loc }, process.env.JWT_SECRET);

    //set auth token for verification and logged_in token so client javascript knows how to behave
    response.cookie("bftkr_auth", auth_token, { expires: new Date(expiry_timestamp), httpOnly: cookies_http_only, secure: cookies_secure });
    response.cookie("bftkr_logged_in", "true", { expires: new Date(expiry_timestamp), httpOnly: false });
    callback();
}
    

passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true,
        passReqToCallback: true
    },
    function(request, username, password, callback) {
        
        request.locals = {};
        var auth_details = {
            username: username,
            password: password
        }
    
        //extract data for use later
        var db_url = process.env.MONGODB_URI; //get db uri

        //store data temporarily until submission is confirmed
        db_ref.get_db_object().connect(db_url, function(err, db) {
            if(err){ console.log(err); }
            else{
                //query to match username to database to ensure user exists
                db.collection(db_ref.get_user_details_table()).aggregate([{ $match: { username: auth_details.username } }]).toArray(function(err, auth_arr){
                    if(err){ console.log(err); }
                    else if(auth_arr.length < 1){ //user not found
                        callback(null, false);
                    }
                    else{ //user found
                        var user_details = auth_arr[0];
                        var possible_peppers = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
                        var response_sent = false;

                        //loop through possible peppers to find the appropriate one
                        for(var i = 0; i < possible_peppers.length; i++ ){

                            //compare the hashed password from the db with a fresh hash of the password + possible pepper and provided salt
                            if(user_details.hashed_password == hashing.hash_password(auth_details.password, user_details.salt, possible_peppers[i]).hashed_password){

                                callback(null, user_details);
                                response_sent = true;
                                break;// ensure loop does not continue
                            }
                        }
                        if(!response_sent){ //if the password hash is not found send a failed auth response
                            callback(null, false);
                        }
                    }
                });
            }
        });
    }
));

router.route('/authenticate').post(passport.authenticate('local', { session: "false" }), function(request, response){
    create_auth_cookies(request.user, response, request.headers, function(){
        response.status(200).send({})
    });
});

router.route('/deauthenticate').post(function(request, response){
    //set all cookies to expire immediately
    response.cookie( "bftkr_auth", "0", { expires: new Date(0), httpOnly: cookies_http_only, secure: cookies_secure });
    response.cookie( "bftkr_logged_in", "false", { expires: new Date(0), httpOnly: false });
    response.status(200).send({})
});

module.exports = router;