 //external dependencies
var express = require('express');
var router = express.Router();

//internal dependencies
var comments_controller = require('../../controllers/comments_controller');
var comment_data_validator = require("../../validation/comment_validation");
var token_authentication = require("../../tools/token_authentication.js"); //get token authentication object
var memoryUpload = require("../../config/multer_config.js").get_multer_object(); //get multer config
var responses_object = require("./endpoint_response.js");

//init response functions
var send_successful_response = responses_object.send_successful_response;
var send_unsuccessful_response = responses_object.send_unsuccessful_response;

//Comments endpoints
router.route('/').post(comment_data_validator.validate, function(request, response){
    
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
router.route('/events/:event_id').get(function(request, response){
    
    var event_id = request.params.event_id;
    
    comments_controller.findCommentsFromEvent(event_id, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, written, tested
router.route('/actors/:actor_id').get(function(request, response){
    comments_controller.findCommentsFromActor(request, response, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, written, tested
router.route('/beef_chains/:beef_chain_id').get(function(request, response){
    
    var beef_chain_id = request.params.beef_chain_id;
        
    comments_controller.findCommentsFromBeefChain(beef_chain_id, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, written, tested
router.route('/:comment_id').delete(token_authentication.authenticate_endpoint_with_admin_user_token, function(request, response){
    comments_controller.deleteComment(request, response, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200);
        }
    });
});//built, written, tested, needs specific user or admin auth

module.exports = router;