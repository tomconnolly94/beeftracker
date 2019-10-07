//external dependencies
var express = require('express');
var router = express.Router();

//internal dependencies
var broken_media_controller = require('../../controllers/broken_media_controller');
var broken_media_validator = require("../../validation/broken_media_validation");
var token_authentication = require("../../tools/token_authentication.js"); //get token authentication object
var memoryUpload = require("../../config/multer_config.js").get_multer_object(); //get multer config
var responses_object = require("../endpoint_response.js");
var url_param_validator = require("../../validation/url_param_validation");

//init response functions
var send_successful_api_response = responses_object.send_successful_api_response;
var send_unsuccessful_api_response = responses_object.send_unsuccessful_api_response;

//Actors endpoints
router.route('/').get(function (request, response) {
    broken_media_controller.findBrokenMediaRecords({ $match: {} }, function (data) {
        if (data.failed) {
            send_unsuccessful_api_response(response, 400, "No broken links found.");
        } else {
            send_successful_api_response(response, 200, data);
        }
    });

}); //built, written, tested, needs query handling

//Actors endpoints
router.route('/:broken_media_id').get(url_param_validator.validate, function (request, response) {

    var broken_media_id = request.locals.validated_params.broken_media_id;

    broken_media_controller.findBrokenMediaRecord(broken_media_id, function (data) {
        if (data.failed) {
            send_unsuccessful_api_response(response, 400, "No broken links found.");
        } else {
            send_successful_api_response(response, 200, data);
        }
    });

}); //built, written, tested, needs query handling

router.route('/').post(broken_media_validator.validate, memoryUpload, function (request, response) {

    var data = request.locals.validated_data;
    
    broken_media_controller.createBrokenMediaRecord(data, function (data) {
        if (data.failed) {
            send_unsuccessful_api_response(response, 400, data.message);
        } else {
            send_successful_api_response(response, 201, data);
        }
    });
}); //built, written, tested

router.route('/:broken_media_id').delete(token_authentication.authenticate_endpoint_with_admin_user_token, url_param_validator.validate, function(request, response){
    
    var broken_media_id = request.locals.validated_params.broken_media_id;
    
    broken_media_controller.deleteBrokenMediaRecord(broken_media_id, function(data){
        if(data.failed){
            send_unsuccessful_api_response(response, 400, data.message);
        }
        else{
            send_successful_api_response(response, 200, data);
        }
    });
});//built, written, tested, needs admin auth

module.exports = router;