 //external dependencies
var express = require('express');
var router = express.Router();

//internal dependencies
var activity_logs_controller = require('../../controllers/activity_logs_controller');
var responses_object = require("./endpoint_response.js");

//init response functions
var send_successful_response = responses_object.send_successful_response;
var send_unsuccessful_response = responses_object.send_unsuccessful_response;

//Activity logs endpoints
router.route('/events/:event_id').get(function(request, response){

    activity_logs_controller.findActivityLogsFromEvent(request, response, function(activity_logs){
        if(activity_logs.length > 0){
            send_successful_response(response, 200, activity_logs);
        }
        else{
            send_unsuccessful_response(response, 400, "Activity logs not found.");
        }
    });
    
});//built, written, tested
router.route('/actors/:actor_id').get(function(){

    activity_logs_controller.findActivityLogsFromActor(request, response, function(activity_logs){ 
        if(activity_logs.length > 0){
            send_successful_response(response, 200, activity_logs);
        }
        else{
            send_unsuccessful_response(response, 400, "Activity logs not found.");
        }
    });
});//built, written, tested

module.exports = router;