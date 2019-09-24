//external dependencies
var express = require('express');
var router = express.Router();

//internal dependencies
var broken_links_controller = require('../../controllers/broken_links_controller');
var broken_link_validator = require("../../validation/broken_link_validation");
var token_authentication = require("../../tools/token_authentication.js"); //get token authentication object
var memoryUpload = require("../../config/multer_config.js").get_multer_object(); //get multer config
var responses_object = require("../endpoint_response.js");
var url_param_validator = require("../../validation/url_param_validation");

//init response functions
var send_successful_api_response = responses_object.send_successful_api_response;
var send_unsuccessful_api_response = responses_object.send_unsuccessful_api_response;

//Actors endpoints
router.route('/').get(function (request, response) {
    broken_links_controller.findBrokenLinks({ $match: {} }, function (data) {
        if (data.failed) {
            send_unsuccessful_api_response(response, 400, "No broken links found.");
        } else {
            send_successful_api_response(response, 200, data);
        }
    });

}); //built, written, tested, needs query handling

//Actors endpoints
router.route('/:broken_link_id').get(url_param_validator.validate, function (request, response) {

    var broken_link_id = request.locals.validated_params.broken_link_id;

    broken_links_controller.findBrokenLink(broken_link_id, function (data) {
        if (data.failed) {
            send_unsuccessful_api_response(response, 400, "No broken links found.");
        } else {
            send_successful_api_response(response, 200, data);
        }
    });

}); //built, written, tested, needs query handling

router.route('/').post(token_authentication.authenticate_endpoint_with_user_token, broken_link_validator.validate, memoryUpload, function (request, response) {

    var data = request.locals.validated_data;
    
    broken_links_controller.createBrokenLink(data, function (data) {
        if (data.failed) {
            send_unsuccessful_api_response(response, 400, data.message);
        } else {
            send_successful_api_response(response, 201, data);
        }
    });
}); //built, written, tested

router.route('/:broken_link_id').delete(token_authentication.authenticate_endpoint_with_admin_user_token, url_param_validator.validate, function(request, response){
    
    var broken_link_id = request.locals.validated_params.broken_link_id;
    
    broken_links_controller.deleteBrokenLink(broken_link_id, function(data){
        if(data.failed){
            send_unsuccessful_api_response(response, 400, data.message);
        }
        else{
            send_successful_api_response(response, 200, data);
        }
    });
});//built, written, tested, needs admin auth

module.exports = router;