 //external dependencies
var express = require('express');
var router = express.Router();

//internal dependencies
var users_controller = require('../../controllers/users_controller');
var email_data_validator = require("../../validation/email_validation");
var password_reset_data_validator = require("../../validation/password_reset_validation");
var user_data_validator = require("../../validation/user_validation");
var token_authentication = require("../../tools/token_authentication"); //get token authentication object
var memoryUpload = require("../../config/multer_config").get_multer_object(); //get multer config
var responses_object = require("../endpoint_response");
var url_param_validator = require("../../validation/url_param_validation");

//init response functions
var send_successful_api_response = responses_object.send_successful_api_response;
var send_unsuccessful_api_response = responses_object.send_unsuccessful_api_response;

//Users endpoints
router.route('/:user_id').get(url_param_validator.validate, token_authentication.authenticate_endpoint_with_user_token, function(request, response){
    
    var user_id = request.locals.validated_params.user_id;
    if(request.locals.authenticated_user.id == user_id || request.locals.authenticated_user.is_admin){

        users_controller.findUser(user_id, request.locals.authenticated_user.is_admin, function(data){
            if(data.failed){
                var code = 400;
                if(data.no_results_found){ code = 404; }
                send_unsuccessful_api_response(response, code, data.message);
            }
            else{
                send_successful_api_response(response, 200, data);
            }
        });
    }
    else{
        send_unsuccessful_api_response(response, 403, "Unauthorised route.");
    }
});//built, written, manually tested, needs specific user or admin auth
router.route('/').post(memoryUpload, user_data_validator.validate, function(request, response){
    
    var user_details = request.locals.validated_data;
    var files = request.files;
    var headers = request.headers;
    
    users_controller.createUser(user_details, files, headers, function(data){
        if(data.failed){
            send_unsuccessful_api_response(response, 400, data.message);
        }
        else{
            send_successful_api_response(response, 201, data);
        }
    });
});//built, written, manually tested
router.route('/:user_id').put(url_param_validator.validate, memoryUpload, token_authentication.authenticate_endpoint_with_admin_user_token, user_data_validator.validate, function(request, response){
    
    var user_details = request.locals.validated_data;
    var user_id = request.locals.validated_params.user_id;
    var files = request.files;
    var headers = request.headers;
    
    users_controller.updateUser(user_details, files, headers, user_id, function(data){
        if(data.failed){
            send_unsuccessful_api_response(response, 400, data.message);
        }
        else{
            send_successful_api_response(response, 200, data);
        }
    });
});//built, not written, not tested, needs specific user or admin auth
router.route('/:user_id/image').put(url_param_validator.validate, token_authentication.authenticate_endpoint_with_user_token, memoryUpload,/* actor_data_validator.validate,*/ function(request, response){
    var data = JSON.parse(request.body.data);//request.locals.validated_data;
    var file = request.files[0];
    
    users_controller.updateUserImage(request.locals.authenticated_user.id, data, file, function(data){
        if(data.failed){
            send_unsuccessful_api_response(response, 400, data.message);
        }
        else{
            send_successful_api_response(response, 200, data);
        }
    });
});//built, written, tested, needs admin auth
router.route('/:user_id').delete(url_param_validator.validate, token_authentication.authenticate_endpoint_with_admin_user_token, function(request, response){
    users_controller.deleteUser(request.locals.validated_params.user_id, function(data){
        if(data.failed){
            send_unsuccessful_api_response(response, 400, data.message);
        }
        else{
            send_successful_api_response(response, 200, data);
        }
    });
});//built, written, manually tested, needs specific user or admin auth
router.route('/request-password-reset').post(email_data_validator.validate, function(request, response){
    
    var email_address = request.locals.validated_data.email_address; //get form data
        
    users_controller.requestPasswordReset(email_address, function(data){
        if(data.failed){
            send_unsuccessful_api_response(response, 400, data.message);
        }
        else{
            send_successful_api_response(response, 200, data);
        }
    });
});//built, not written, not tested
router.route('/execute-password-reset').post(password_reset_data_validator.validate, function(request, response){
    
    var id_token = request.locals.validated_data.id_token; //get form data
    var new_password = request.locals.validated_data.password; //get form data
        
    users_controller.executePasswordReset(id_token, new_password, function(data){
        if(data.failed){
            send_unsuccessful_api_response(response, 400, data.message);
        }
        else{
            send_successful_api_response(response, 200, data);
        }
    });
});//built, not written, not tested

module.exports = router;