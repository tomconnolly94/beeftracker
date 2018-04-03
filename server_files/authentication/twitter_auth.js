//external dependencies
var express = require('express');
var session = require('express-session');
var router = express.Router()
var passport = require("passport");
var TwitterStrategy = require("passport-twitter").Strategy;

router.use(passport.initialize());
router.use(session({ secret: 'SECRET' })); // session secret
router.use(passport.session()); // persistent login sessions

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

passport.use(new TwitterStrategy({
        consumerKey: process.env.TWITTER_API_KEY,
        consumerSecret: process.env.TWITTER_API_SECRET,
        callbackURL: "http://localhost:5000/api/auth/twitter/callback",
        profileFields: ["id", "name", "displayName", "photos"],
        passReqToCallback: true
    },
  function(request, accessToken, refreshToken, profile, done) {
    
        console.log(profile);
        var user_emails = profile.emails;
    
        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{
                                    
                db.collection(db_ref.get_user_details_table()).aggregate([
                    { $match: { username: profile.username } }                        
                ]).toArray(function(err, users){
                    if(err){ console.log(err);}
                    else{

                        if(users.length == 0){

                            var user_details = { 
                                username: profile.username,
                                first_name: profile.displayName.split(" ")[0],
                                last_name: profile.displayName.split(" ")[profile.displayName.split(" ").length],
                                email_address: null,
                                img_title: profile.photos[0].value,
                                admin: false,
                                registration_method: "twitter"
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
                            console.log("user found.");
                            console.log(users);
                            
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

router.route('/').get(passport.authenticate('twitter', { session: "false" }));

router.route('/callback').get(passport.authenticate('twitter'), function(request, response){
    
    console.log(request.locals);
    
    authentication_controller.create_auth_cookies(request.locals.user_details, response, request.headers, function(){
        
        response.cookie("bftkr_auth", "0", { expires: new Date(0), httpOnly: true });
        response.cookie("bftkr_logged_in", "false", { expires: new Date(0) });
        response.status(200).send({ failed: false, message: "Successful Twitter authentication." });
    });
});

module.exports = router;