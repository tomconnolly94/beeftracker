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
var responses_object = require("./endpoint_response");

//init response functions
var send_successful_response = responses_object.send_successful_response;
var send_unsuccessful_response = responses_object.send_unsuccessful_response;

//Users endpoints
router.route('/:user_id').get(token_authentication.authenticate_endpoint_with_user_token, function(request, response){
    users_controller.getUser(request, response, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, written, manually tested, needs specific user or admin auth
router.route('/').post(memoryUpload, user_data_validator.validate, function(request, response){
    
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
router.route('/:user_id').put(memoryUpload, token_authentication.authenticate_endpoint_with_admin_user_token, user_data_validator.validate, function(request, response){
    
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
router.route('/:user_id/image').put(token_authentication.authenticate_endpoint_with_user_token, memoryUpload,/* actor_data_validator.validate,*/ function(request, response){
    
    console.log(request.locals)
    console.log(request.params)
    
    var data = JSON.parse(request.body.data);//request.locals.validated_data;
    var file = request.files[0];
    
    users_controller.updateUserImage(request.locals.authenticated_user.id, data, file, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, written, tested, needs admin auth
router.route('/:user_id').delete(token_authentication.authenticate_endpoint_with_admin_user_token, function(request, response){
    users_controller.deleteUser(request, response, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, written, manually tested, needs specific user or admin auth
router.route('/request-password-reset').post(email_data_validator.validate, function(request, response){
    
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
router.route('/execute-password-reset').post(password_reset_data_validator.validate, function(request, response){
    
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

module.exports = router;