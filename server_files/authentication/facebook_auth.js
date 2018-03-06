//external dependencies
var express = require('express')
var router = express.Router()
var passport = require("passport");
var FacebookStrategy = require("passport-facebook").Strategy;

router.use(passport.initialize());

//beeftracker dependencies
var token_authentication = require("../tools/token_authentication.js"); //get token authentication object


passport.serializeUser(function(user, done){
   console.log("serialize user.");
   done(null, user.id)
});

passport.deserializeUser(function(id, done){
   console.log("deserialize user.");
    done(id);
});

passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_API_KEY,
        clientSecret: process.env.FACEBOOK_API_SECRET,
        callbackURL: "http://localhost:5000/api/auth/facebook/callback",
        profileFields: ["id", "displayName", "photos", "email"]
    },
    function(accessToken, refreshToken, profile, cb) {
        console.log("strategy callback");
        console.log(profile);
    
        cb(null, profile);
    }
));

router.route('/').get(passport.authenticate('facebook', { scope: "email", session: "false" }));

router.route('/callback').get(passport.authenticate('facebook'), function(request, response){ 
    console.log("facebook callback");
    
    response.cookie("hellocookie", "hellocookiecontent", { expires: new Date(2018,03,08), httpOnly: false, secure: false });
    
    response.json({ message: "hello"});
});

module.exports = router;