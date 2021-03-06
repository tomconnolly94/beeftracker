 //external dependencies
var express = require('express');
var router = express.Router();

//internal dependencies
var scraped_data_controller = require('../../controllers/scraped_data_controller');
var token_authentication = require("../../tools/token_authentication.js"); //get token authentication object
var memoryUpload = require("../../config/multer_config.js").get_multer_object(); //get multer config
var responses_object = require("../endpoint_response.js");

//init response functions
var send_successful_api_response = responses_object.send_successful_api_response;
var send_unsuccessful_api_response = responses_object.send_unsuccessful_api_response;

//Actor fields config endpoints
router.route('/events').get(token_authentication.authenticate_endpoint_with_admin_user_token, function(request, response){
    scraped_data_controller.findScrapedEventData(function(data){
        if(data.failed){
            send_unsuccessful_api_response(response, 400, data.message);
        }
        else{
            send_successful_api_response(response, 200, data);
        }
    });
});//built, written, tested
router.route('/events').delete(token_authentication.authenticate_endpoint_with_admin_user_token, function(request, response){    
    scraped_data_controller.deleteScrapedEventData(request.body, function(data){
        if(data.failed){
            send_unsuccessful_api_response(response, 400, data.message);
        }
        else{
            send_successful_api_response(response, 200, data);
        }
    });
});//built, written, tested
router.route('/actor/:name').get(url_param_validator.validate, token_authentication.authenticate_endpoint_with_admin_user_token, function(request, response){
    
    var actor_name = request.locals.validated_params.name;
    
    scraped_data_controller.scrapeActor(actor_name, function(data){
        if(data.failed){
            send_unsuccessful_api_response(response, 400, data.message);
        }
        else{
            send_successful_api_response(response, 200, data);
        }
    });
});//built, written, tested

router.route('/actor/:name').get(url_param_validator.validate, token_authentication.authenticate_endpoint_with_admin_user_token, function(request, response){
    
    var actor_name = request.locals.validated_params.name;
    
    scraped_data_controller.scrapeActor(actor_name, function(data){
        if(data.failed){
            send_unsuccessful_api_response(response, 400, data.message);
        }
        else{
            send_successful_api_response(response, 200, data);
        }
    });
});//built, written, tested

module.exports = router;