//routing dependencies
var express = require('express');
var router = express.Router();
var multer = require('multer');

//beeftracker dependencies
var token_authentication = require("../tools/token_authentication.js"); //get token authentication object

//include endpoint controllers
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

var memoryStorage = multer.memoryStorage();
var memoryUpload = multer({
    storage: memoryStorage,
    limits: {fileSize: 500000, files: 2}
}).any('attachment');

//connect uri suffixes to controllers

//Activity logs endpoints
router.route('/activity-logs/events/:event_id').get(activity_logs_controller.findActivityLogsFromEvent);//built, written, tested
router.route('/activity-logs/actors/:actor_id').get(activity_logs_controller.findActivityLogsFromActor);//built, written, tested

//Actors endpoints
router.route('/actors').get(actor_controller.findActors);//built, written, tested, needs query handling
router.route('/actors/:actor_id').get(actor_controller.findActor);//built, written, tested
router.route('/actors').post(memoryUpload, actor_controller.createActor);//built, written, tested
router.route('/actors/:actor_id').put(token_authentication.authenticate_admin_user_token, memoryUpload, actor_controller.updateActor);//built, written, tested, needs admin auth
router.route('/actors/:actor_id').delete(token_authentication.authenticate_admin_user_token, actor_controller.deleteActor);//built, written, tested, needs admin auth

//Actor fields config endpoints
router.route('/actor-variable-fields-config').get(actor_controller.getVariableFieldsConfig);//built, written, tested

//Administration data endpoints
router.route('/contact-us-data').get(administration_data_controller.getContactUsData);//built, not written, not tested
router.route('/about-us-data').get(administration_data_controller.getAboutUsData);//built, not written, not tested
router.route('/privacy-policy-data').get(administration_data_controller.getPrivacyPolicyData);//built, not written, not tested
router.route('/terms-and-conditions-data').get(administration_data_controller.getTermsAndConditionsData);//built, not written, not tested
router.route('/disclaimer-data').get(administration_data_controller.getDisclaimerData);//built, not written

//Comments endpoints
router.route('/comments').post(comments_controller.createComment);//built, written, tested, needs specific user auth
router.route('/comments/events/:event_id').get(comments_controller.findCommentsFromEvent);//built, written, tested
router.route('/comments/actors/:actor_id').get(comments_controller.findCommentsFromActor);//built, written, tested
router.route('/comments/:comment_id').delete(token_authentication.authenticate_admin_user_token, comments_controller.deleteComment);//built, written, tested, needs specific user or admin auth

// Event categories endpoints
router.route('/event-categories').get(event_categories_controller.getEventCategories);//built, written, tested
router.route('/event-categories').post(event_categories_controller.createEventCategory);//built, written, tested

// Events endpoints
router.route('/events').get(event_controller.findEvents);//built, written, tested
router.route('/events/:event_id').get(event_controller.findEvent);//built, written, tested
router.route('/events').post(token_authentication.authenticate_admin_user_token, memoryUpload, event_controller.createEvent);//built, written, tested, needs specific user auth
router.route('/events/:event_id').put(token_authentication.authenticate_admin_user_token, memoryUpload, event_controller.updateEvent);//built, written, tested, needs admin auth
router.route('/events/:event_id').delete(token_authentication.authenticate_admin_user_token, event_controller.deleteEvent);//built, written, tested, needs admin auth

//Peripheral events endpoints
router.route('/events/from-beef-chain/:beef_chain_id').get(event_peripherals_controller.findEventsFromBeefChain);//built, written, tested
router.route('/events/related-to-event/:event_id').get(event_peripherals_controller.findEventsRelatedToEvent);//built, written, needs manual testing with valid data
router.route('/events/related-to-actor/:actor_id').get(event_peripherals_controller.findEventsRelatedToActor);//built, written, needs manual testing with valid data

//Update request endpoints
router.route('/update_request').post(update_request_controller.createUpdateRequest);//built, not written, not tested

//Users endpoints
router.route('/users/:user_id').get(token_authentication.authenticate_user_token, users_controller.getUser);//built, written, manually tested, needs specific user or admin auth
router.route('/users').post(memoryUpload, users_controller.createUser);//built, written, manually tested
router.route('/users/:user_id').put(token_authentication.authenticate_admin_user_token, users_controller.updateUser);//built, not written, not tested, needs specific user or admin auth
router.route('/users/:user_id').delete(token_authentication.authenticate_admin_user_token, users_controller.deleteUser);//built, written, manually tested, needs specific user or admin auth
router.route('/reset-password').post(users_controller.resetUserPassword);//built, not written, not tested

//Authentication endpoints
router.route('/authenticate').post(authentication_controller.authenticateUser);//built, written, not tested
router.route('/deauthenticate').get(authentication_controller.deauthenticateUser);//built, written, not tested

//handle errors
router.route('/*').get(function(request, response) {response.status(404).send({success: false, message: "endpoint not found"}); });

module.exports = router;