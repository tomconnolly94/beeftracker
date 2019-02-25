 //external dependencies
var express = require('express');
var router = express.Router();

//internal dependencies
var actor_controller = require('../../controllers/actors_controller');
var actor_data_validator = require("../../validation/actor_validation");
var token_authentication = require("../../tools/token_authentication.js"); //get token authentication object
var memoryUpload = require("../../config/multer_config.js").get_multer_object(); //get multer config
var responses_object = require("./endpoint_response.js");
var url_param_validator = require("../../validation/url_param_validation");

//init response functions
var send_successful_response = responses_object.send_successful_response;
var send_unsuccessful_response = responses_object.send_unsuccessful_response;

//Actors endpoints
router.route('/').get(function(request, response){
    
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
router.route('/:actor_id').get(url_param_validator.validate, function(request, response){
    
    var actor_id = request.locals.validated_params.actor_id;
    
    actor_controller.findActor(actor_id, function(data){
        if(data.failed){
            var code = 400;
            if(data.no_results_found){ code = 404; }
            send_unsuccessful_response(response, code, "Actor not found.");
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, written, tested
router.route('/').post(token_authentication.authenticate_endpoint_with_user_token, memoryUpload, actor_data_validator.validate, function(request, response){
    
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
router.route('/:actor_id').put(url_param_validator.validate, token_authentication.authenticate_endpoint_with_admin_user_token, memoryUpload, actor_data_validator.validate, function(request, response){
    
    var data = request.locals.validated_data;
    var files = request.files;
    var actor_id = request.locals.validated_params.actor_id;
        
    actor_controller.updateActor(data, files, actor_id, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, written, tested, needs admin auth
router.route('/:actor_id').delete(url_param_validator.validate, token_authentication.authenticate_endpoint_with_admin_user_token, function(request, response){
    
    var actor_id = request.locals.validated_params.actor_id;

    actor_controller.deleteActor(actor_id, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200);
        }
    });
});//built, written, tested, needs admin auth

module.exports = router;