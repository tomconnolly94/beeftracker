//brief basic validation to avoid using the server for trivial mistakes
function validate_actor_submission(actor_submission){
    
    if(!actor_submission.name || actor_submission.name.length < 1){
        return { location: "title", problem: "Please enter a title" };
    }
    
    if(!actor_submission.date_of_origin || actor_submission.date_of_origin.length < 1 || actor_submission.date_of_origin == "undefined/undefined/"){
        return { location: "date", problem: "Please select the date" };
    }
    if(!actor_submission.place_of_origin || actor_submission.place_of_origin.length < 1 || actor_submission.place_of_origin == "undefined/undefined/"){
        return { location: "date", problem: "Please select the date" };
    }
    
    if(!actor_submission.description || actor_submission.description.length < 1){
        return { location: "description", problem: "Please enter a bio" };
    }
    
    if(!actor_submission.data_sources || actor_submission.data_sources.length < 1){
        return { location: "data_sources", problem: "Please enter at least one data source" };
    }
            
    if(!actor_submission.classification || actor_submission.classification.length < 1){
        return { location: "classification", problem: "Please choose a class" };
    }
    
    if(!actor_submission.gallery_items || actor_submission.gallery_items.length < 1){
        return { location: "gallery_items", problem: "Please choose an image" };
    }
    else{
        var cover_image_found;
        var main_graphic_found;
        
        for(var i = 0; i < actor_submission.gallery_items.length; i++){
            if(actor_submission.gallery_items[i].main_graphic){
                main_graphic_found = true;
            }
        }
        
        if(!main_graphic_found){
            return { location: "gallery_items", problem: "please select one of your gallery items as a 'main graphic'" };
        }
    }
    
    return "validation_successful";
}