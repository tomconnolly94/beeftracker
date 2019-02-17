//external dependencies
var path = require("path");
var valid_url = require('valid-url');

//internal dependencies

module.exports = {
    
    get_custom_validation_functions: function(){
        return {
        }
    },
    
    validate: function(request, response, next){
        console.log("validator started.");
                
        //access form data and reassign it to the request body
        if (typeof request.body.data === 'string' || request.body.data instanceof String){
            request.body = JSON.parse(request.body.data); //get form data
        }
        
        //validate username
        request.checkBody("username", "Field is empty").notEmpty();
        request.checkBody("username", "Field is null.").not_null();
        request.checkBody("username", "Field is not a string.").is_string();
        request.checkBody("username", "Potential HTML code found, please remove this.").detect_xss();
        
        //validate first name
        request.checkBody("first_name", "Field is empty").notEmpty();
        request.checkBody("first_name", "Field is null.").not_null();
        request.checkBody("first_name", "Field is not a string.").is_string();
        request.checkBody("first_name", "Potential HTML code found, please remove this.").detect_xss();
        
        //validate last name
        request.checkBody("last_name", "Field is empty").notEmpty();
        request.checkBody("last_name", "Field is null.").not_null();
        request.checkBody("last_name", "Field is not a string.").is_string();
        request.checkBody("last_name", "Potential HTML code found, please remove this.").detect_xss();
        
        //validate password
        request.checkBody("password", "Field is empty").notEmpty();
        request.checkBody("password", "Field is null.").not_null();
        request.checkBody("password", "Field is not a string.").is_string();
        request.checkBody("password", "Potential HTML code found, please remove this.").detect_xss();
        
        //validate email
        request.checkBody("email_address", "Field is empty").notEmpty();
        request.checkBody("email_address", "Field is null.").not_null();
        request.checkBody("email_address", "Field is not a string.").is_string();
        request.checkBody("email_address", "Field is not an email.").isEmail();
        request.checkBody("email_address", "Potential HTML code found, please remove this.").detect_xss();
        
        //validate date
        request.checkBody("d_o_b", "Field is empty").notEmpty();
        request.checkBody("d_o_b", "Field is null.").not_null();
        request.checkBody("d_o_b", "d_o_b is formatted incorrectly.").test_valid_date();
        
        /*
        request.checkBody("img_title", "Field is empty").notEmpty();
        request.checkBody("img_title", "Field is null.").not_null();
        */
        /*
        //validate event date
        request.checkBody("country", "Field is empty").notEmpty();
        request.checkBody("country", "Field is null.").not_null();
        request.checkBody("country", "Field is not a string.").is_string();
        request.checkBody("country", "Potential HTML code found, please remove this.").detect_xss();
        */

        //validate image files
        for(var i = 0; i < request.files.length; i++){
            request.checkBody('file', 'Please upload an image Jpeg, Png, blob or Gif').test_image(request.files[i].mimetype);
        }
        
        request.getValidationResult().then(function(validationResult){
            
            if(validationResult.array().length > 0 ){
                console.log("validation failed.");
                console.log(validationResult.array());
                response.status(400).send({ failed: true, stage: "server_validation", message: "Validation failed, please format input data properly.", details: validationResult.array()});
            }
            else{
                console.log("validation succeeded.");
                if(!request.locals){ request.locals = {}; }
                request.locals.validated_data = {
                    username: request.body.username,
                    first_name: request.body.first_name,
                    last_name: request.body.last_name,
                    email_address: request.body.email_address,
                    password: request.body.password,
                    d_o_b: request.body.d_o_b,
                    img_title: request.body.img_title ? request.body.img_title : null,
                    country: request.body.country ? request.body.country : null
                };
                next();
            }
        });
    }
};