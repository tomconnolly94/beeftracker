 //external dependencies
var express = require('express');
var router = express.Router();

//internal dependencies
var actor_controller = require('../../controllers/actors_controller');
var token_authentication = require("../../tools/token_authentication.js"); //get token authentication object
var memoryUpload = require("../../config/multer_config.js").get_multer_object(); //get multer config
var responses_object = require("./endpoint_responses.js");

//init response functions
var send_successful_response = responses_object.send_successful_response;
var send_unsuccessful_response = responses_object.send_unsuccessful_response;

//Actor fields config endpoints
router.route('/').get(function(request, response){
    actor_controller.getVariableActorFieldsConfig(function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, written, tested

module.exports = router;