//external dependencies

//internal dependencies

module.exports = {
    
    get_custom_validation_functions: function(){
        return {
            
        }
    },
    
    validate: function(request, response, next){
        
        //access form data and reassign it to the request body
        if (typeof request.body.data === 'string' || request.body.data instanceof String){
            request.body = JSON.parse(request.body.data); //get form data
        }
        
        console.log(request.body);
        
        //validate title
        request.checkBody("name", "Field is empty").notEmpty();
        request.checkBody("name", "Field is null.").not_null();
        request.checkBody("name", "Potential HTML code found, please remove this.").detect_xss();
        
        //validate description
        request.checkBody("email_address", "Field is empty").notEmpty();
        request.checkBody("email_address", "Field is null.").not_null();
        request.checkBody("email_address", "Potential HTML code found, please remove this.").detect_xss();
        
        //validate description
        request.checkBody("subject", "Field is empty").notEmpty();
        request.checkBody("subject", "Field is null.").not_null();
        request.checkBody("subject", "Potential HTML code found, please remove this.").detect_xss();
        
        //validate description
        request.checkBody("message", "Field is empty").notEmpty();
        request.checkBody("message", "Field is null.").not_null();
        request.checkBody("message", "Potential HTML code found, please remove this.").detect_xss();
        
        request.getValidationResult().then(function(validationResult){
            
            if(validationResult.array().length > 0 ){
                console.log("validation failed.");
                console.log(validationResult.array());
                response.status(400).send({ failed: true, message: "Validation faled, please format input data properly."});
            }
            else{
                console.log("validation succeeded.");
                if(!request.locals){ request.locals = {}; }
                request.locals.validated_data = {
                    name: request.body.name,
                    email_address: request.body.email_address,
                    subject: request.body.subject,
                    message: request.body.message
                };
                next();
            }
        });
    }
};