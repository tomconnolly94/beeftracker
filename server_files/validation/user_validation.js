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
        console.log(request.body);
        
        //access form data and reassign it to the request body
        request.body = JSON.parse(request.body.data); //get form data
        
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
        
        //validate gallery_items
        /*request.checkBody("gallery_items", "Field is empty").notEmpty();
        request.checkBody("gallery_items", "Field is null.").not_null();
        request.checkBody("gallery_items", "Gallery items are not formatted correctly.").test_gallery_items_structure(request.files);
        */
        request.checkBody("img_title", "Field is empty").notEmpty();
        request.checkBody("img_title", "Field is null.").not_null();
        
        //validate event date
        request.checkBody("country", "Field is empty").notEmpty();
        request.checkBody("country", "Field is null.").not_null();
        request.checkBody("country", "Field is not a string.").is_string();
        request.checkBody("country", "Potential HTML code found, please remove this.").detect_xss();
        
        if(request.files){
            //validate image files
            for(var i = 0; i < request.files.length; i++){
                var filename = typeof request.files[i] !== "undefined" ? request.files[i].originalname : '';
                request.checkBody('file', 'Please upload an image Jpeg, Png or Gif').test_image(filename);
            }
        }
        
        request.getValidationResult().then(function(validationResult){
            
            if(validationResult.array().length > 0 ){
                console.log("validation failed.");
                console.log(validationResult.array());
                response.status(400).send({ failed: true, message: "Validation faled, please format input data properly."});
            }
            else{
                console.log("validation succeeded.");
                request.locals = {};
                request.locals.validated_data = {
                    username: request.body.username,
                    first_name: request.body.first_name,
                    last_name: request.body.last_name,
                    email_address: request.body.email_address,
                    d_o_b: request.body.d_o_b,
                    img_title: request.body.img_title,
                    country: request.body.country
                };
                next();
            }
        });
    }
};