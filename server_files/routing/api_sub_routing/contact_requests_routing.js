 //external dependencies
var express = require('express');
var router = express.Router();

//internal dependencies
var contact_request_controller = require('../../controllers/contact_requests_controller');
var contact_request_validator = require("../../validation/contact_request_validation");
var responses_object = require("./endpoint_response.js");

//init response functions
var send_successful_response = responses_object.send_successful_response;
var send_unsuccessful_response = responses_object.send_unsuccessful_response;

//Contact reqest endpoints
router.route('/').get(function(request, response){
    contact_request_controller.findContactRequests(function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, written, tested
router.route('/').post(contact_request_validator.validate, function(request, response){
    
    var contact_request_data = request.locals.validated_data;    
    
    contact_request_controller.createContactRequest(contact_request_data, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 201, data);
        }
    });
});//built, written, tested, needs specific user auth

module.exports = router;