//external dependencies

//internal dependencies

module.exports = {
    
    validate_event: function(request, response, next){
        
        
        //var submission_data = JSON.parse(request.body.data); //get form data
        request.body = JSON.parse(request.body.data); //get form data
        var files;

        if(request.files){ //check if the user submitted a file via a file explorer
            files = request.files;
        }

        console.log("hit validation func");
        console.log(request.body);
        
        //validate title
        request.checkBody("title", "must have a title").notEmpty()
        
        //validate aggressor ids
        request.checkBody("aggressors", "must have an array of aggressor ids").notEmpty()
        
        //validate target ids
        request.checkBody("targets", "must have a title").notEmpty()        
        
        //validate event date
        request.checkBody("date", "must have a title").notEmpty()
        
        //validate description
        request.checkBody("description", "must have a title").notEmpty()
        
        //validate gallery_items
        request.checkBody("gallery_items", "must have a title").notEmpty()
        
        //validate categories
        request.checkBody("categories", "must have a title").notEmpty()
        
        //validate data_soruces
        request.checkBody("data_sources", "must have a title").notEmpty()
        
        //validate record_origin
        request.checkBody("record_origin", "must have a title").notEmpty()
        
        //validate tags
        request.checkBody("tags", "must have a title").notEmpty()
        
        request.getValidationResult().then(function(validationResult){
            console.log(validationResult);
            if(!validationResult.isEmpty()){
                console.log(validationResult.isEmpty())
                console.log("validation failed.");
                response.send({failed: true});
            }
            else{
                console.log("validation succeeded.");
                response.send({failed: false});
            }
        })
    }
};