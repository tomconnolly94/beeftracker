//routing dependencies
var express = require('express');
var router = express.Router();
var multer = require('multer');

//beeftracker dependencies
var token_authentication = require("../tools/token_authentication.js"); //get token authentication object

//include endpoint controllers
var carousel_controller = require('../template_controllers/carousel_controller.js');

//Activity logs endpoints
router.route('/carousel').get(carousel_controller.requestTemplateFunction);//built, written, tested

//handle errors
router.route('/*').get(function(request, response) {response.status(404).send({success: false, message: "endpoint not found"}); });

module.exports = router;