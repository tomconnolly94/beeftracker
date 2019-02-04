 //external dependencies
var express = require('express');
var router = express.Router();

//internal dependencies
var event_controller = require('../../controllers/events_controller');
var event_peripherals_controller = require('../../controllers/events_peripherals_controller');
var event_data_validator = require("../../validation/event_validation");
var token_authentication = require("../../tools/token_authentication.js"); //get token authentication object
var memoryUpload = require("../../config/multer_config.js").get_multer_object(); //get multer config
var responses_object = require("./endpoint_response.js");

//init response functions
var send_successful_response = responses_object.send_successful_response;
var send_unsuccessful_response = responses_object.send_unsuccessful_response;

// Events endpoints
router.route('/').get(function(request, response){
    
    var query = request.query;
    
    event_controller.findEvents(query, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, written, tested
router.route('/:event_id').get(function(request, response){
    
    var existing_event_id = request.params.event_id;
    
    event_controller.findEvent(existing_event_id, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, written, tested
router.route('/').post(token_authentication.authenticate_endpoint_with_user_token, memoryUpload, event_data_validator.validate, function(request, response){
    
    var data = request.locals.validated_data;
    var files = request.files;
    data.user_id = request.locals.authenticated_user.id;
    
    event_controller.createEvent(data, files, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 201, data);
        }
    });
});//built, written, tested, needs specific user auth
router.route('/:event_id').put(token_authentication.authenticate_endpoint_with_admin_user_token, memoryUpload, event_data_validator.validate, function(request, response){
    
    var data = request.locals.validated_data;
    var files = request.files;
    var existing_event_id = request.params.event_id;
    
    event_controller.updateEvent(data, files, existing_event_id, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 204, data);
        }
    });
});//built, written, tested, needs admin auth
router.route('/:event_id').delete(token_authentication.authenticate_endpoint_with_admin_user_token, function(request, response){
    
    var event_id = request.params.event_id;
    
    event_controller.deleteEvent(event_id, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, written, tested, needs admin auth


//Peripheral events endpoints
router.route('/from-beef-chain/:beef_chain_id').get(function(request, response){
    event_peripherals_controller.findEventsFromBeefChain(request, response, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, written, tested
router.route('/related-to-event/:event_id').get(function(request, response){
    event_peripherals_controller.findEventsRelatedToEvent(request, response, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, written, needs manual testing with valid data
router.route('/related-to-actor/:actor_id').get(function(request, response){
    event_peripherals_controller.findEventsRelatedToActor(request, response, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, written, needs manual testing with valid data


module.exports = router;