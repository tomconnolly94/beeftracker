//external dependencies
var express = require('express')
var router = express.Router()
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;

//beeftracker dependencies
var token_authentication = require("../tools/token_authentication.js"); //get token authentication object
var authentication_controller = require('../endpoint_controllers/authentication_controller');

router.use(passport.initialize());

/*passport.serializeUser(function(user, done){
   console.log("serialize user.");
   done(null, user.id)
});

passport.deserializeUser(function(id, done){
   console.log("deserialize user.");
    done(id);
});*/

passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    },
    function(request, username, password, done) {
        
        request.locals = {};
        request.locals.username = username;
        request.locals.password = password;
    
        console.log(username, password);
        
        done(null, { message: "auth success" });
    }
));

router.route('/').post(passport.authenticate('local', { session: "false" }), function(request, response){

    authentication_controller.authenticateUser({ username: request.locals.username, password: request.locals.password }, request.headers, response, function(data){
        
        console.log(data);
        
        if(data.failed){
            response.cookie("bftkr_auth", "0", { expires: new Date(0), httpOnly: true });
            response.cookie("bftkr_logged_in", "false", { expires: new Date(0) });
            response.status(401).send({ failed: true, message: "Unsuccessful local authentication." });
        }
        else{
            response.status(200).send({ failed: false, message: "Unsuccessful local authentication." });
        }
        
    });
});


module.exports = router;