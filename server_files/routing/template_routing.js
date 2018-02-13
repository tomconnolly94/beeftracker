//external dependencies
var express = require('express');
var router = express.Router();
var pug = require('pug');

//internal dependencies
var token_authentication = require("../tools/token_authentication.js"); //get token authentication object

var template_dir = "public/templates/components/";

//Activity logs endpoints
router.route('/carousel').get(function(request, response){
    var categories = [ "cat4", "cat5", "cat6", "cat9"];
    var author = "tom";
    
    response.status(200).render("components/carousel/carousel.jade", { author: author, categories: categories });
});

//handle errors
router.route('/*').get(function(request, response){ response.status(404).send({ success: false, message: "Template not found." }); });

module.exports = router;