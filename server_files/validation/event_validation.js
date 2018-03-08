//external dependencies
var path = require("path");
var valid_url = require('valid-url');

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
            test_record_origin: function(input){
                
                if(input == "scraped" || input == "submission"){
                    return true;
                }
                else{
                    return false;
                }
            },
            test_gallery_items_structure: function(gallery_items){
                
                for(var i = 0; i < gallery_items.length; i++){
                    var gallery_item = gallery_items[i];
                    
                    if(gallery_item["media_type"] == 'undefined' || gallery_item["media_type"].length < 1){
                        return false;
                    }
                    else if(gallery_item["link"] == 'undefined' || gallery_item["link"].length < 1){
                        return false;
                    }
                    else if(gallery_item["main_graphic"] == 'undefined'){
                        return false;
                    }
                }
                return true
            },
            test_image: function(value, filename) {

                var extension = (path.extname(filename)).toLowerCase();
                switch (extension) {
                    case '.jpg':
                        return '.jpg';
                    case '.jpeg':
                        return '.jpeg';
                    case  '.png':
                        return '.png';
                    default:
                        return false;
                }
            },
            test_array_of_urls: function(urls) {

                for(var i = 0; i < urls.length; i++){
                    var url = urls[i];
                    
                    if (valid_url.isUri(url)){
                        continue;
                    } 
                    else {
                        return false;
                    }
                }
                return true;
            },
            test_array_of_numbers: function(numbers) {
                
                if(!Array.isArray(numbers)){
                    return false;
                }

                for(var i = 0; i < numbers.length; i++){
                    var number = numbers[i];
                    
                    if (isNaN(number)){
                        return false;
                    } 
                    else {
                        continue;
                    }
                }
                return true;
            },
            test_array_of_strings: function(strings) {
                
                if(!Array.isArray(strings)){
                    return false;
                }

                for(var i = 0; i < strings.length; i++){
                    var string = strings[i];
                    
                    if (typeof string != "string"){
                        return false;
                    } 
                    else {
                        continue;
                    }
                }
                return true;
            }
        }
    },
    
    validate: function(request, response, next){
        
        //access form data and reassign it to the request body
        request.body = JSON.parse(request.body.data); //get form data
        
        //validate title
        request.checkBody("title", "No title provided.").notEmpty();
        
        //validate aggressor ids
        request.checkBody("aggressors", "No aggressor ids provided.").notEmpty();
        request.checkBody("aggressors", "Aggressor ids are not formatted correctly.").test_array_of_mongodb_object_ids("mongodb_ids");
        
        //validate target ids
        request.checkBody("targets", "Must have at least one target.").notEmpty();
        request.checkBody("targets", "Target ids are not formatted correctly.").test_array_of_mongodb_object_ids("mongodb_ids");
        
        //validate event date
        request.checkBody("date", "No date provided.").notEmpty();
        request.checkBody("date", "Date is not formatted correctly.").test_valid_date();
        
        //validate description
        request.checkBody("description", "No description provided.").notEmpty();
        
        //validate gallery_items
        request.checkBody("gallery_items", "No gallery items provided.").notEmpty();
        request.checkBody("gallery_items", "Gallery items are not formatted correctly.").test_gallery_items_structure();
        
        //validate categories
        request.checkBody("categories", "No categories provided.").notEmpty();
        request.checkBody('categories', 'Categories formatted incorrectly.').test_array_of_numbers();
        
        //validate data_soruces
        request.checkBody("data_sources", "No data sources provided.").notEmpty();
        request.checkBody("data_sources", "Data sources are improperly formatted.").test_array_of_urls();
        
        //validate record_origin
        request.checkBody("record_origin", "No record_origin provided.").notEmpty();
        request.checkBody("record_origin", "Record origin is invalid.").test_record_origin();
        
        //validate tags
        request.checkBody("tags", "No tags provided.").notEmpty();
        request.checkBody("tags", "Tags are not formatted correctly.").test_array_of_strings();
        
        //validate image files
        for(var i = 0; i < request.files.length; i++){
            var filename = typeof request.files[i] !== "undefined" ? request.files[i].originalname : '';
            request.checkBody('file', 'Please upload an image Jpeg, Png or Gif').test_image(filename);
        }
        
        request.getValidationResult().then(function(validationResult){
            
            if(validationResult.array().length > 0 ){
                console.log("validation failed.");
                response.status(400).send({ failed: true, message: "Validation faled, please format input data properly."});
            }
            else{
                console.log("validation succeeded.");
                request.validated_data = request.body;
                next();
            }
        })
    }
};