//external dependencies
//internal dependencies

module.exports = {
    
    get_custom_validation_functions: function(){
        return {
            test_array_of_mongodb_object_ids: function(input_array){
                
                for(var i = 0; i < input_array.length; i++){
                    
                    var input = input_array[i];
                    var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
                    var invalid_value_found = false;
                    
                    if(input.match(checkForHexRegExp)){
                        continue;
                    }
                    else{
                        return false;
                    }
                }
                return true
            },
            test_valid_date: function(date){
                
                function pad(x){return (((''+x).length==2) ? '' : '0') + x; }
                
                var m = date.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
                var d = (m) ? new Date(m[3], m[2]-1, m[1]) : null
                var matchesPadded = (d&&(date==[pad(d.getDate()),pad(d.getMonth()+1),d.getFullYear()].join('/')))
                var matchesNonPadded = (d&&(date==[d.getDate(),d.getMonth()+1,d.getFullYear()].join('/')));
                
                return (matchesPadded || matchesNonPadded) ? d : null;
            },
        }
    },
    
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
        request.checkBody("title", "No title provided.").notEmpty();
        
        //validate aggressor ids
        request.checkBody("aggressors", "No aggressor ids provided.").notEmpty()
        request.checkBody("aggressors", "Aggressor ids are not formatted correctly.").test_array_of_mongodb_object_ids("mongodb_ids");
        
        //validate target ids
        request.checkBody("targets", "Must have at least one target.").notEmpty();
        request.checkBody("targets", "Target ids are not formatted correctly.").test_array_of_mongodb_object_ids("mongodb_ids");
        
        //validate event date
        request.checkBody("date", "Must have a title").notEmpty();
        request.checkBody("date", "Date is invalid.").test_valid_date();
        
        //validate description
        request.checkBody("description", "Must have a title").notEmpty()
        
        //validate gallery_items
        request.checkBody("gallery_items", "Must have a title").notEmpty()
        
        //validate categories
        request.checkBody("categories", "Must have a title").notEmpty()
        
        //validate data_soruces
        request.checkBody("data_sources", "Must have a title").notEmpty()
        
        //validate record_origin
        request.checkBody("record_origin", "Must have a title").notEmpty()
        
        //validate tags
        request.checkBody("tags", "Must have a title").notEmpty()
        
        request.getValidationResult().then(function(validationResult){
            console.log(validationResult);
            console.log(validationResult.isEmpty());
            console.log(validationResult.array());
            
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