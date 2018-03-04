//external dependencies
var passport = require("passport");

// Passport session setup.
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});
// Use the FacebookStrategy within Passport.
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_API_KEY,
    clientSecret: process.env.FACEBOOK_API_SECRET,
    callbackURL: "/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      //Check whether the User exists or not using profile.id
      //Further DB code.
      return done(null, profile);
    });
  }
));