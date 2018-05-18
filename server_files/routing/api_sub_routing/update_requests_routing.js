 //external dependencies
var express = require('express');
var router = express.Router();

//internal dependencies
var update_request_controller = require('../../controllers/update_requests_controller');
var update_request_validator = require("../../validation/update_request_validation");
var memoryUpload = require("../../config/multer_config.js").get_multer_object(); //get multer config
var responses_object = require("./endpoint_response.js");

//init response functions
var send_successful_response = responses_object.send_successful_response;
var send_unsuccessful_response = responses_object.send_unsuccessful_response;

//Update request endpoints
router.route('/').post(memoryUpload, update_request_validator.validate, function(request, response){
    
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

module.exports = router;