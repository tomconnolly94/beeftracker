//external dependencies
var express = require('express');
var router = express.Router();

//internal dependencies
var authentication_controller = require("../controllers/authentication_controller");
var authentication_request_validator = require("../validation/authentication_request_validation");
var responses_object = require("./endpoint_sub_routing/endpoint_response");

//init response functions
var send_successful_response = responses_object.send_successful_response;
var send_unsuccessful_response = responses_object.send_unsuccessful_response;

/*
    Connection of server routes to controllers - middleware ordering = auth function (optional) -> multer file formatting function (optional) -> data validation function (optional) -> endpoint handler function

    Endpoint handler functions are designed to handle the HTTP request and response, they use controllers to access the data they require
*/

router.use('/activity-logs', require('./endpoint_sub_routing/activity_logs_routing.js'));
router.use('/auth', require('./authentication_routing')); //routes send javascript functions which render HTML on the client side
router.use('/actors', require('./endpoint_sub_routing/activity_logs_routing.js'));
router.use('/actor-variable-fields-config', require('./endpoint_sub_routing/activity_logs_routing.js'));
router.use('/comments', require('./endpoint_sub_routing/comments_routing.js'));
router.use('/contact-requests', require('./endpoint_sub_routing/contact_requests_routing.js'));
router.use('/event-categories', require('./endpoint_sub_routing/event_categories_routing.js'));
router.use('/events', require('./endpoint_sub_routing/events_routing.js'));
router.use('/update-requests', require('./endpoint_sub_routing/update_requests_routing.js'));
router.use('/users', require('./endpoint_sub_routing/users_routing.js'));
router.use('/votes', require('./endpoint_sub_routing/users_routing.js'));

//Authentication endpoints
router.route('/authenticate').post(authentication_request_validator.validate, function(request, response){
    
    var auth_details = request.locals.validated_data;
    var headers = request.headers;
    
    authentication_controller.authenticateUser(auth_details, headers, response, function(data, cookie_details){
        if(data.failed){
            send_unsuccessful_response(response, 400, data);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, written, not tested
router.route('/deauthenticate').get(function(request, response){
    authentication_controller.deauthenticateUser(request, response, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, written, not tested

//handle errors
router.route('/*').get(function(request, response) {response.status(400).send({success: false, message: "endpoint not found"}); });

module.exports = router;