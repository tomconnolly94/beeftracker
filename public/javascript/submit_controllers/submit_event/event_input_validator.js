//brief basic validation to avoid using the server for trivial mistakes
function validate_event_submission(event_submission){
    
    if(!event_submission.title || event_submission.title.length < 1){
        return { location: "title", problem: "Please enter a title" };
    }
    
    if(!event_submission.aggressors || event_submission.aggressors.length < 1){
        return { location: "aggressors", problem: "Please add at least one aggressor" };
    }
    
    if(!event_submission.targets || event_submission.targets.length < 1){
        return { location: "targets", problem: "Please add at least one target" };
    }
    
    if(!event_submission.date || event_submission.date.length < 1 || event_submission.date == "undefined/undefined/"){
        return { location: "date", problem: "Please select the date" };
    }
    
    if(!event_submission.description || event_submission.description.length < 1){
        return { location: "description", problem: "Please enter a description" };
    }
    
    if(!event_submission.categories || event_submission.categories.length < 1){
        return { location: "categories", problem: "Please enter a category" };
    }
    
    // if(!event_submission.tags || event_submission.tags.length < 1){
    //     return { location: "tags", problem: "Please enter at least one tag" };
    // }
    
    if(!event_submission.data_sources || event_submission.data_sources.length < 1){
        return { location: "data_sources", problem: "Please enter at least one data source" };
    }
    
    if(!event_submission.gallery_items || event_submission.gallery_items.length < 1){
        return { location: "data_sources", problem: "Please enter at least one data source" };
    }
    else{
        var cover_image_found;
        var main_graphic_found;
        
        for(var i = 0; i < event_submission.gallery_items.length; i++){
            if(event_submission.gallery_items[i].cover_image){
                cover_image_found = true;
            }
            if(event_submission.gallery_items[i].main_graphic){
                main_graphic_found = true;
            }
        }
        
        if(!cover_image_found){
            return { location: "gallery_items", problem: "please select one of your gallery items as a 'cover image'" };
        }
        
        if(!main_graphic_found){
            return { location: "gallery_items", problem: "please select one of your gallery items as a 'main graphic'" };
        }
    }
    
    return "validation_successful";
};