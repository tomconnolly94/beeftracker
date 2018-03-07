//external dependencies
var express = require('express')
var router = express.Router()
var passport = require("passport");
var LocalStrategy = require("passport-local-token").Strategy;

router.use(passport.initialize());

//beeftracker dependencies
var token_authentication = require("../tools/token_authentication.js"); //get token authentication object


/*passport.serializeUser(function(user, done){
   console.log("serialize user.");
   done(null, user.id)
});

passport.deserializeUser(function(id, done){
   console.log("deserialize user.");
    done(id);
});*/

passport.use("local-token", new LocalStrategy(
    function(token, cb) {
        console.log("strategy callback");
    
        cb(null, token);
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