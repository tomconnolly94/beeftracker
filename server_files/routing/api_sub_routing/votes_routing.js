 //external dependencies
var express = require('express');
var router = express.Router();

//internal dependencies
var votes_controller = require('../../controllers/votes_controller');
var vote_data_validator = require("../../validation/vote_data_validation");
var token_authentication = require("../../tools/token_authentication.js"); //get token authentication object
var memoryUpload = require("../../config/multer_config.js").get_multer_object(); //get multer config
var responses_object = require("./endpoint_response.js");

//init response functions
var send_successful_response = responses_object.send_successful_response;
var send_unsuccessful_response = responses_object.send_unsuccessful_response;


router.route('/events').put( token_authentication.recognise_user_token, vote_data_validator.validate, function(request, response){
    
    var event_id = request.locals.validated_data.event_id; //get form data
    var vote_direction = request.locals.validated_data.vote_direction; //get form data
    var user_id = request.locals.authenticated_user && request.locals.authenticated_user.id ? request.locals.authenticated_user.id : null;
    
    votes_controller.addVoteToEvent(event_id, vote_direction, user_id, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, written, tested

module.exports = router;