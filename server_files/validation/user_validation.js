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
        
        //validate username
        request.checkBody("first_name", "Field is empty").notEmpty();
        request.checkBody("first_name", "Field is null.").not_null();
        request.checkBody("first_name", "Field is not a string.").is_string();
        request.checkBody("first_name", "Potential HTML code found, please remove this.").detect_xss();
        
        //validate username
        request.checkBody("last_name", "Field is empty").notEmpty();
        request.checkBody("last_name", "Field is null.").not_null();
        request.checkBody("last_name", "Field is not a string.").is_string();
        request.checkBody("last_name", "Potential HTML code found, please remove this.").detect_xss();
        
        //validate username
        request.checkBody("email", "Field is empty").notEmpty();
        request.checkBody("email", "Field is null.").not_null();
        request.checkBody("email", "Field is not a string.").is_string();
        request.checkBody("email", "Field is not an email.").isEmail();
        request.checkBody("email", "Potential HTML code found, please remove this.").detect_xss();
        
        //validate event date
        request.checkBody("d_o_b", "Field is empty").notEmpty();
        request.checkBody("d_o_b", "Field is null.").not_null();
        request.checkBody("d_o_b", "d_o_b is formatted incorrectly.").test_valid_date();
        
        //validate gallery_items
        request.checkBody("gallery_items", "Field is empty").notEmpty();
        request.checkBody("gallery_items", "Field is null.").not_null();
        request.checkBody("gallery_items", "Gallery items are not formatted correctly.").test_gallery_items_structure(request.files);
        
        //validate event date
        request.checkBody("country", "Field is empty").notEmpty();
        request.checkBody("country", "Field is null.").not_null();
        request.checkBody("country", "Field is not a string.").is_string();
        request.checkBody("country", "Potential HTML code found, please remove this.").detect_xss();
        
        //validate image files
        for(var i = 0; i < request.files.length; i++){
            var filename = typeof request.files[i] !== "undefined" ? request.files[i].originalname : '';
            request.checkBody('file', 'Please upload an image Jpeg, Png or Gif').test_image(filename);
        }
        
        request.getValidationResult().then(function(validationResult){
            
            if(validationResult.array().length > 0 ){
                console.log("validation failed.");
                console.log(validationResult.array());
                response.status(400).send({ failed: true, message: "Validation faled, please format input data properly."});
            }
            else{
                console.log("validation succeeded.");
                request.validated_data = request.body;
                next();
            }
        });
    }
};