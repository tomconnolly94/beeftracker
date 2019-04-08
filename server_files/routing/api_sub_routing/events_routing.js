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
var url_param_validator = require("../../validation/url_param_validation");

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
router.route('/:event_id').get(url_param_validator.validate, function(request, response){
    
    var existing_event_id = request.locals.validated_params.event_id;
    
    event_controller.findEvent(existing_event_id, function(data){
        if(data.failed){
            var code = 400;
            if(data.no_results_found){ code = 404; }
            send_unsuccessful_response(response, code, data.message);
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
router.route('/:event_id').put(url_param_validator.validate, token_authentication.authenticate_endpoint_with_admin_user_token, memoryUpload, event_data_validator.validate, function(request, response){
    
    var data = request.locals.validated_data;
    var files = request.files;
    var existing_event_id = request.locals.validated_params.event_id;
    
    event_controller.updateEvent(data, files, existing_event_id, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, written, tested, needs admin auth
router.route('/:event_id').delete(url_param_validator.validate, token_authentication.authenticate_endpoint_with_admin_user_token, function(request, response){
    
    var event_id = request.locals.validated_params.event_id;
    
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
router.route('/from-beef-chain/:beef_chain_id').get(url_param_validator.validate, function(request, response){

    var beef_chain_id = request.locals.validated_params.beef_chain_id;

    event_peripherals_controller.findEventsFromBeefChain(beef_chain_id, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, written, tested
router.route('/related-to-event/:event_id').get(url_param_validator.validate, function(request, response){

    var event_id = request.locals.validated_params.event_id;

    event_peripherals_controller.findEventsRelatedToEvent(event_id, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, written, needs manual testing with valid data
router.route('/related-to-actor/:actor_id').get(url_param_validator.validate, function(request, response){

    var actor_id = request.locals.validated_params.actor_id;

    event_peripherals_controller.findEventsRelatedToActor(actor_id, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, written, needs manual testing with valid data


module.exports = router;