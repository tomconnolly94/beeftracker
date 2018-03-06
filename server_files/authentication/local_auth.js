//external dependencies
var express = require('express')
var router = express.Router()
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;

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

passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, 
    function(email, password, cb) {
        console.log("strategy callback");
        console.log(profile);
    
        cb(null, profile);
    }
));

router.route('/').post(
    function(request, response){
        passport.authenticate('local', { session: "false" }, function(err, user, info){

            console.log("passport callback");
        response.json({ message: "local auth successful."})
        })
    }
);

module.exports = router;