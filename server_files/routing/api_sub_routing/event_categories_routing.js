 //external dependencies
var express = require('express');
var router = express.Router();

//internal dependencies
var event_categories_controller = require('../../controllers/event_categories_controller');
var event_categories_data_validator = require("../../validation/event_categories_validation");
var responses_object = require("./endpoint_response.js");

//init response functions
var send_successful_response = responses_object.send_successful_response;
var send_unsuccessful_response = responses_object.send_unsuccessful_response;

// Event categories endpoints
router.route('/').get(function(request, response){
    event_categories_controller.getEventCategories(function(data){
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
router.route('/').post(event_categories_data_validator.validate, function(request, response){
    
    var event_category_data = request.locals.validated_data;
    
    event_categories_controller.createEventCategory(event_category_data, function(data){
        if(data.failed){
            var code = 400;
            if(data.no_results_found){ code = 404; }
            send_unsuccessful_response(response, code, data.message);
        }
        else{
            send_successful_response(response, 201, data);
        }
    });
});//built, written, tested

module.exports = router;