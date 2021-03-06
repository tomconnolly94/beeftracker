//external dependencies
var express = require('express')
var router = express.Router()
var passport = require("passport");
var FacebookStrategy = require("passport-facebook").Strategy;

router.use(passport.initialize());

//internal dependencies
var token_authentication = require("../tools/token_authentication.js"); //get token authentication object
var db_ref = require("../config/db_config.js");
var users_controller = require('../controllers/users_controller');
var authentication_controller = require('../controllers/authentication_controller');

passport.serializeUser(function(strategy_data, done){
   console.log("serialize user.");
   done(null, 0)
});

passport.deserializeUser(function(id, done){
   console.log("deserialize user.");
    done(id);
});

passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_API_KEY,
        clientSecret: process.env.FACEBOOK_API_SECRET,
        callbackURL: "http://localhost:5000/api/auth/facebook/callback",
        profileFields: ["id", "name", "displayName", "photos", "email"],
        passReqToCallback: true
    },
  function(request, accessToken, refreshToken, profile, done) {
    
        var user_emails = profile.emails;
    
        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{
                                    
                db.collection(db_ref.get_user_details_table()).aggregate([
                    { $match: { email_address: profile.emails[0].value } }                        
                ]).toArray(function(err, users){
                    if(err){ console.log(err);}
                    else{

                        if(users.length == 0){

                            var user_details = { 
                                username: profile.emails[0].value,
                                first_name: profile.name.givenName,
                                last_name: profile.name.familyName,
                                email_address: profile.emails[0].value,
                                img_title: profile.photos[0].value,
                                admin: false,
                                registration_method: "facebook"
                            }
                            
                            //assign user_details to request
                            request.locals = {};
                            request.locals.user_details = user_details;
                            
                            users_controller.createUser(user_details, null, null, function(data){
                                
                                if(data.failed){
                                    //user was not created
                                    console.log("error in user creation, user was not created.");
                                    done(null, { success: false, message: "auth failure" });
                                
                                }
                                else{
                                    
                                    user_details._id = data.user_id;
                                    done(null, { success: true, message: "auth success", user_details: user_details });
                                }
                            });
                        }
                        else{                            
                            //assign user_details to request
                            request.locals = {};
                            request.locals.user_details = users[0];
                            
                            done(null, { success: true, message: "auth success", user_details: users[0] });
                        }
                    }
                });
            }
        });
    }
));

router.route('/').get(passport.authenticate('facebook', { scope: "email", session: "false" }));

router.route('/callback').get(passport.authenticate('facebook'), function(request, response){

    authentication_controller.create_auth_cookies(request.locals.user_details, response, request.headers, function(){
        
        response.cookie("bftkr_auth", "0", { expires: new Date(0), httpOnly: true });
        response.cookie("bftkr_logged_in", "false", { expires: new Date(0) });
        response.status(200).send({ failed: false, message: "Successful Facebook authentication." });
    });
});

module.exports = router;