 //external dependencies
var express = require('express');
var router = express.Router();
/*var passport = require("passport");
var FacebookStrategy = require("passport-facebook").Strategy;*/

router.use('/local', require("../authentication/local_auth"));
router.use('/facebook', require("../authentication/facebook_auth"));
/*router.use('/twitter', require("../authentication/facebook_auth"));
router.use('/google', require("../authentication/facebook_auth"));*/

module.exports = router;