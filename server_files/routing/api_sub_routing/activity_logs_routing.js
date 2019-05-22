 //external dependencies
var express = require('express');
var router = express.Router();

//submodule internal dependencies

//internal dependencies
var activity_logs_controller = require('../../controllers/activity_logs_controller');
var responses_object = require("../endpoint_response.js");


//init response functions
var send_successful_api_response = responses_object.send_successful_api_response;
var send_unsuccessful_api_response = responses_object.send_unsuccessful_api_response;

//Activity logs endpoints
router.route('/events/:event_id').get(function(request, response){

    var event_id = request.locals.validated_params.event_id;

    activity_logs_controller.findActivityLogsFromEvent(event_id, function(activity_logs){
        if(activity_logs.length > 0){
            send_successful_api_response(response, 200, activity_logs);
        }
        else{
            send_unsuccessful_api_response(response, 400, { success: false, message: "Activity logs not found."});
        }
    });
    
});//built, written, tested
router.route('/actors/:actor_id').get(function(request, response){

    var actor_id = request.locals.validated_params.actor_id;

    activity_logs_controller.findActivityLogsFromActor(actor_id, function(activity_logs){ 
        if(activity_logs.length > 0){
            send_successful_api_response(response, 200, activity_logs);
        }
        else{
            send_unsuccessful_api_response(response, 400, { success: false, message: "Activity logs not found."});
        }
    });
});//built, written, tested

module.exports = router;