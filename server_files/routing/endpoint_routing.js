//routing dependencies
var express = require('express');
//var app = express();
var router = express.Router();
var multer = require('multer');

//beeftracker dependencies
var token_authentication = require("../tools/token_authentication.js"); //get token authentication object

//endpoint controllers
var activity_logs_controller = require('../controllers/activity_logs_controller');
var actor_controller = require('../controllers/actors_controller');
var authentication_controller = require('../controllers/authentication_controller');
var comments_controller = require('../controllers/comments_controller');
var contact_request_controller = require('../controllers/contact_requests_controller');
var event_categories_controller = require('../controllers/event_categories_controller');
var event_controller = require('../controllers/events_controller');
var event_peripherals_controller = require('../controllers/events_peripherals_controller');
var update_request_controller = require('../controllers/update_request_controller');
var users_controller = require('../controllers/users_controller');
var votes_controller = require('../controllers/votes_controller');

//input validation functions
var actor_data_validator = require("../validation/actor_validation");
var authentication_request_validator = require("../validation/authentication_request_validation");
var comment_data_validator = require("../validation/comment_validation");
var contact_request_validator = require("../validation/contact_request_validation");
var email_data_validator = require("../validation/email_validation");
var event_categories_data_validator = require("../validation/event_categories_validation");
var event_data_validator = require("../validation/event_validation");
var password_reset_data_validator = require("../validation/password_reset_validation");
var update_request_validator = require("../validation/update_request_validation");
var user_data_validator = require("../validation/user_validation");
var vote_data_validator = require("../validation/vote_data_validation");

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

/*
    Connection of server routes to controllers - middleware ordering = auth function (optional) -> multer file formatting function (optional) -> data validation function (optional) -> endpoint handler function

    Endpoint handler functions are designed to handle the HTTP request and response, they use controllers to access the data they require
*/

//Activity logs endpoints
router.route('/activity-logs/events/:event_id').get(function(request, response){

    activity_logs_controller.findActivityLogsFromEvent(request, response, function(activity_logs){
        if(activity_logs.length > 0){
            send_successful_response(response, 200, activity_logs);
        }
        else{
            send_unsuccessful_response(response, 400, "Activity logs not found.");
        }
    });
    
});//built, written, tested
router.route('/activity-logs/actors/:actor_id').get(function(){

    activity_logs_controller.findActivityLogsFromActor(request, response, function(activity_logs){ 
        if(activity_logs.length > 0){
            send_successful_response(response, 200, activity_logs);
        }
        else{
            send_unsuccessful_response(response, 400, "Activity logs not found.");
        }
    });
});//built, written, tested

//Actors endpoints
router.route('/actors').get(function(request, response){
    
    var query = request.query;
    
    actor_controller.findActors(query, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, "No actors found.");
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
    
});//built, written, tested, needs query handling
router.route('/actors/:actor_id').get(function(request, response){
    
    var actor_id = request.params.actor_id;
    
    actor_controller.findActor(actor_id, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, "Actor not found.");
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, written, tested
router.route('/actors').post(memoryUpload, actor_data_validator.validate, function(request, response){
    
    var data = request.locals.validated_data;
    var files = request.files;
        
    actor_controller.createActor(data, files, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 201, data);
        }
    });
    
});//built, written, tested
router.route('/actors/:actor_id').put(token_authentication.authenticate_endpoint_with_admin_user_token, memoryUpload, actor_data_validator.validate, function(request, response){
    
    var data = request.locals.validated_data;
    var files = request.files;
    
    actor_controller.updateActor(data, files, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, written, tested, needs admin auth
router.route('/actors/:actor_id').delete(token_authentication.authenticate_endpoint_with_admin_user_token, function(request, response){
    actor_controller.deleteActor(request, response, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200);
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
            send_successful_response(response, 200, data);
        }
    });
});//built, written, tested

//Comments endpoints
router.route('/comments').post(comment_data_validator.validate, function(request, response){
    
    var comment_data = request.locals.validated_data;    
    
    comments_controller.createComment(comment_data, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 201, data);
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
router.route('/comments/:comment_id').delete(token_authentication.authenticate_endpoint_with_admin_user_token, function(request, response){
    comments_controller.deleteComment(request, response, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200);
        }
    });
});//built, written, tested, needs specific user or admin auth

//Contact reqest endpoints
router.route('/contact-requests').get(function(request, response){
    contact_request_controller.findContactRequests(function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, written, tested
router.route('/contact-requests').post(contact_request_validator.validate, function(request, response){
    
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
router.route('/event-categories').post(event_categories_data_validator.validate, function(request, response){
    
    var event_category_data = request.locals.validated_data;
    
    event_categories_controller.createEventCategory(event_category_data, function(data){
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
router.route('/events').post(token_authentication.authenticate_endpoint_with_user_token, memoryUpload, event_data_validator.validate, function(request, response){
    
    var data = request.locals.validated_data;
    var files = request.files;
    console.log(request.locals.authenticated_user);
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
router.route('/events/:event_id').put(token_authentication.authenticate_endpoint_with_admin_user_token, memoryUpload, event_data_validator.validate, function(request, response){
    
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
router.route('/events/:event_id').delete(token_authentication.authenticate_endpoint_with_admin_user_token, function(request, response){
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
router.route('/update-requests').post(memoryUpload, update_request_validator.validate, function(request, response){
    
    var data = request.locals.validated_data
    var files = request.files;
    
    update_request_controller.createUpdateRequest(data, files, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, not written, not tested

//Users endpoints
router.route('/users/:user_id').get(token_authentication.authenticate_endpoint_with_user_token, function(request, response){
    users_controller.getUser(request, response, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, written, manually tested, needs specific user or admin auth
router.route('/users').post(memoryUpload, user_data_validator.validate, function(request, response){
    
    var user_details = request.locals.validated_data;
    var files = request.files;
    var headers = request.headers;
    
    users_controller.createUser(user_details, files, headers, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, written, manually tested
router.route('/users/:user_id').put(memoryUpload, token_authentication.authenticate_endpoint_with_admin_user_token, user_data_validator.validate, function(request, response){
    
    var user_details = request.locals.validated_data;
    var user_id = request.params.user_id;
    var files = request.files;
    var headers = request.headers;
    
    users_controller.updateUser(user_details, files, headers, user_id, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, not written, not tested, needs specific user or admin auth
router.route('/users/:user_id').delete(token_authentication.authenticate_endpoint_with_admin_user_token, function(request, response){
    users_controller.deleteUser(request, response, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, written, manually tested, needs specific user or admin auth
router.route('/users/request-password-reset').post(email_data_validator.validate, function(request, response){
    
    var email_address = request.locals.validated_data.email_address; //get form data
        
    users_controller.requestPasswordReset(email_address, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, not written, not tested
router.route('/users/execute-password-reset').post(password_reset_data_validator.validate, function(request, response){
    
    var id_token = request.locals.validated_data.id_token; //get form data
    var new_password = request.locals.validated_data.password; //get form data
        
    users_controller.executePasswordReset(id_token, new_password, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, not written, not tested

router.route('/votes/events').put( token_authentication.recognise_user_token, vote_data_validator.validate, function(request, response){
    
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

//Authentication endpoints
router.route('/authenticate').post(authentication_request_validator.validate, function(request, response){
    
    var auth_details = request.locals.validated_data;
    var headers = request.headers;
    
    authentication_controller.authenticateUser(auth_details, headers, response, function(data, cookie_details){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            //set auth token for verification and logged_in token so client javascript knows how to behave
            /*response.cookie("auth", cookie_details.auth_token, { expires: new Date(cookie_details.expiry_timestamp), httpOnly: cookie_details.cookies_http_only, secure: cookie_details.cookies_secure });
            response.cookie("logged_in", "true", { expires: new Date(cookie_details.expiry_timestamp), httpOnly: false });*/
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