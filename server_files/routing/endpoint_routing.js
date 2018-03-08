//routing dependencies
var express = require('express');
//var app = express();
var router = express.Router();
var multer = require('multer');

//beeftracker dependencies
var token_authentication = require("../tools/token_authentication.js"); //get token authentication object

//endpoint controllers
var activity_logs_controller = require('../endpoint_controllers/activity_logs_controller');
var actor_controller = require('../endpoint_controllers/actors_controller');
var administration_data_controller = require('../endpoint_controllers/administration_data_controller');
var comments_controller = require('../endpoint_controllers/comments_controller');
var event_categories_controller = require('../endpoint_controllers/event_categories_controller');
var event_controller = require('../endpoint_controllers/events_controller');
var event_peripherals_controller = require('../endpoint_controllers/events_peripherals_controller');
var update_request_controller = require('../endpoint_controllers/update_request_controller');
var users_controller = require('../endpoint_controllers/users_controller');
var authentication_controller = require('../endpoint_controllers/authentication_controller');

//input validation functions
var event_data_validator = require("../validation/event_validation");
var actor_data_validator = require("../validation/actor_validation");
var comment_data_validator = require("../validation/comment_validation");

var memoryStorage = multer.memoryStorage();
var memoryUpload = multer({
    storage: memoryStorage,
    limits: {fileSize: 500000, files: 15}
}).any('attachment');

var send_successful_response = function(response, code, data){
    if(data){
        response.status(code).send(data);
    }
    else{
        response.status(code).send();
    }
}
var send_unsuccessful_response = function(response, code, error_message){
    
    var response_json = {
        failed: true
    }
    
    if(error_message){
        response_json.message = error_message;
    }
    response.status(code).send(response_json);
}

//connect uri routes to controllers - middleware ordering = auth function (optional) -> multer file formatting function (optional) -> data validation function (optional) -> endpoint controller function

//Activity logs endpoints
router.route('/activity-logs/events/:event_id').get(function(request, response){

    activity_logs_controller.findActivityLogsFromEvent(request, response, function(activity_logs){
        if(activity_logs.length > 0){
            send_successful_response(response, activity_logs);
        }
        else{
            send_unsuccessful_response(response, 400, "Activity logs not found.");
        }
    });
    
});//built, written, tested
router.route('/activity-logs/actors/:actor_id').get(function(){

    activity_logs_controller.findActivityLogsFromActor(request, response, function(activity_logs){ 
        if(activity_logs.length > 0){
            send_successful_response(response, activity_logs);
        }
        else{
            send_unsuccessful_response(response, 400, "Activity logs not found.");
        }
    });
});//built, written, tested

//Actors endpoints
router.route('/actors').get(function(request, response){
    actor_controller.findActors(request, response, function(actors){
        if(actors.length > 0){
            send_successful_response(response, actors);
        }
        else{
            send_unsuccessful_response(response, 400, "No actors found.");
        }
    });
    
});//built, written, tested, needs query handling
router.route('/actors/:actor_id').get(function(request, response){
    actor_controller.findActor(request, response, function(actor){
        if(actor){
            send_successful_response(response, actor);
        }
        else{
            send_unsuccessful_response(response, 400, "Actor not found.");
        }
    });
});//built, written, tested
router.route('/actors').post(memoryUpload, function(request, response){
    
    var event_data = request.validated_data;
    var event_files = request.validated_files;
    
    actor_controller.createActor(event_data, event_files, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, data);
        }
    });
    
});//built, written, tested
router.route('/actors/:actor_id').put(token_authentication.authenticate_admin_user_token, memoryUpload, function(request, response){
    actor_controller.updateActor(request, response, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, data);
        }
    });
});//built, written, tested, needs admin auth
router.route('/actors/:actor_id').delete(token_authentication.authenticate_admin_user_token, function(request, response){
    actor_controller.deleteActor(request, response, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response);
        }
    });
});//built, written, tested, needs admin auth

//Actor fields config endpoints
router.route('/actor-variable-fields-config').get(function(request, response){
    actor_controller.getVariableActorFieldsConfig(request, response, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, data);
        }
    });
});//built, written, tested

//Administration data endpoints
router.route('/contact-us-data').get(function(request, response){
    administration_data_controller.getContactUsData(request, response, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response);
        }
    });
});//built, not written, not tested
router.route('/about-us-data').get(function(request, response){
    administration_data_controller.getAboutUsData(request, response, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response);
        }
    });
});//built, not written, not tested
router.route('/privacy-policy-data').get(function(request, response){
    administration_data_controller.getPrivacyPolicyData(request, response, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response);
        }
    });
});//built, not written, not tested
router.route('/terms-and-conditions-data').get(function(request, response){
    administration_data_controller.getTermsAndConditionsData(request, response, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response);
        }
    });
});//built, not written, not tested
router.route('/disclaimer-data').get(function(request, response){
    administration_data_controller.getDisclaimerData(request, response, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response);
        }
    });
});//built, not written

//Comments endpoints
router.route('/comments').post(comment_data_validator.validate, function(request, response){
    
    var comment_data = request.validated_data;    
    
    comments_controller.createComment(comment_data, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 201);
        }
    });
});//built, written, tested, needs specific user auth
router.route('/comments/events/:event_id').get(function(request, response){
    comments_controller.findCommentsFromEvent(request, response, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, written, tested
router.route('/comments/actors/:actor_id').get(function(request, response){
    comments_controller.findCommentsFromActor(request, response, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, written, tested
router.route('/comments/:comment_id').delete(token_authentication.authenticate_admin_user_token, function(request, response){
    comments_controller.deleteComment(request, response, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200);
        }
    });
});//built, written, tested, needs specific user or admin auth

// Event categories endpoints
router.route('/event-categories').get(function(request, response){
    event_categories_controller.getEventCategories(request, response, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, written, tested
router.route('/event-categories').post(function(request, response){
    event_categories_controller.createEventCategory(request, response, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 201, data);
        }
    });
});//built, written, tested

// Events endpoints
router.route('/events').get(function(request, response){
    event_controller.findEvents(request, response, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, written, tested
router.route('/events/:event_id').get(function(request, response){
    event_controller.findEvent(request, response, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, written, tested
router.route('/events').post(token_authentication.authenticate_admin_user_token, memoryUpload, event_data_validator.validate, function(request, response){
    
    var event_data = request.validated_data;
    var event_files = request.validated_files;
    
    event_controller.createEvent(event_data, event_files, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 201, data);
        }
    });
});//built, written, tested, needs specific user auth
router.route('/events/:event_id').put(token_authentication.authenticate_admin_user_token, memoryUpload, function(request, response){
    event_controller.updateEvent(request, response, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 204, data);
        }
    });
});//built, written, tested, needs admin auth
router.route('/events/:event_id').delete(token_authentication.authenticate_admin_user_token, function(request, response){
    event_controller.deleteEvent(request, response, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, written, tested, needs admin auth

//Peripheral events endpoints
router.route('/events/from-beef-chain/:beef_chain_id').get(function(request, response){
    event_peripherals_controller.findEventsFromBeefChain(request, response, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, written, tested
router.route('/events/related-to-event/:event_id').get(function(request, response){
    event_peripherals_controller.findEventsRelatedToEvent(request, response, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, written, needs manual testing with valid data
router.route('/events/related-to-actor/:actor_id').get(function(request, response){
    event_peripherals_controller.findEventsRelatedToActor(request, response, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, written, needs manual testing with valid data

//Update request endpoints
router.route('/update-requests').post(memoryUpload, function(request, response){
    update_request_controller.createUpdateRequest(request, response, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, not written, not tested

//Users endpoints
router.route('/users/:user_id').get(token_authentication.authenticate_user_token, function(request, response){
    users_controller.getUser(request, response, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, written, manually tested, needs specific user or admin auth
router.route('/users').post(memoryUpload, function(request, response){
    users_controller.createUser(request, response, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, written, manually tested
router.route('/users/:user_id').put(token_authentication.authenticate_admin_user_token, function(request, response){
    users_controller.updateUser(request, response, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, not written, not tested, needs specific user or admin auth
router.route('/users/:user_id').delete(token_authentication.authenticate_admin_user_token, function(request, response){
    users_controller.deleteUser(request, response, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, written, manually tested, needs specific user or admin auth
router.route('/reset-password').post(function(request, response){
    users_controller.resetUserPassword(request, response, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, not written, not tested

//Authentication endpoints
router.route('/authenticate').post(function(request, response){
    authentication_controller.authenticateUser(request, response, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
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

// ### Component rendering function routes configuration ###
router.use('/auth', require('./authentication_routing')); //routes send javascript functions which render HTML on the client side

//handle errors
router.route('/*').get(function(request, response) {response.status(400).send({success: false, message: "endpoint not found"}); });

module.exports = router;