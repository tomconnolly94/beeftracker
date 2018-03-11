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
        
        //validate username
        request.checkBody("username", "No username provided.").notEmpty();
        request.checkBody("username", "Null username provided.").not_null();
        request.checkBody("username", "Potential HTML code found, please remove this.").detect_xss();
        
        //validate username
        request.checkBody("first_name", "No first_name provided.").notEmpty();
        request.checkBody("first_name", "Null first_name provided.").notNull();
        request.checkBody("first_name", "Potential HTML code found, please remove this.").detect_xss();
        
        //validate username
        request.checkBody("last_name", "No last_name provided.").notEmpty();
        request.checkBody("last_name", "Null last_name provided.").notNull();
        request.checkBody("last_name", "Potential HTML code found, please remove this.").detect_xss();
        
        //validate username
        request.checkBody("email_address", "No email_address provided.").notEmpty();
        request.checkBody("email_address", "Null email_address provided.").notNull();
        request.checkBody("email_address", "Potential HTML code found, please remove this.").detect_xss();
        
        //validate event date
        request.checkBody("d_o_b", "No d_o_b provided.").notEmpty();
        request.checkBody("d_o_b", "Null d_o_b provided.").notNull();
        request.checkBody("d_o_b", "d_o_b is formatted incorrectly.").test_valid_date();
        
        //validate gallery_items
        request.checkBody("gallery_items", "No gallery items provided.").notEmpty();
        request.checkBody("gallery_items", "Gallery items are not formatted correctly.").test_gallery_items_structure();
        
        //validate event date
        request.checkBody("country", "No country provided.").notEmpty();
        request.checkBody("country", "Null country provided.").not_null();
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