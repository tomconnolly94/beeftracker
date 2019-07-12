$(".submit_new_event_button").unbind().click(function(event){
    event.preventDefault();
    
    var event_submission = extract_data_from_page();
    var validation_result = validate_event_submission(event_submission)
    
    if(validation_result == "validation_successful"){
        
        var form_data = new FormData();
        //add image files to formdata
        for(var i = 0; i < event_submission.gallery_items.length; i++){

            var gallery_item = event_submission.gallery_items[i];

            if(gallery_item.media_type == "image" && gallery_item.file){
                form_data.append("file-" + i, gallery_item.file, gallery_item.link);
            }
        }

        form_data.append("data", JSON.stringify(event_submission));
        var post_url = $("#post_url").attr("value");
    
        submit_http_post_req(form_data, post_url);
    }
    else{
        render_error_messages([ validation_result ]);
        init_beef_tags_box();
    }
}); 

$(".submit_update_request_button").unbind().click(function(event){
    event.preventDefault();
    
    var event_submission = extract_data_from_page();
    var validation_result = validate_event_submission(event_submission)
    
    if(validation_result == "validation_successful"){

        var update_request = {
            event_data: event_submission,
            comment: ""
        }
        
        var form_data = new FormData();
        //add image files to formdata
        for(var i = 0; i < event_submission.gallery_items.length; i++){

            var gallery_item = event_submission.gallery_items[i];

            if(gallery_item.media_type == "image" && gallery_item.file){
                form_data.append("file-" + i, gallery_item.file, gallery_item.link);
            }
        }
        
        form_data.append("data", JSON.stringify(update_request));
        var post_url = $("#post_url").attr("value");
    
        submit_http_post_req(form_data, post_url);
    }
    else{
        render_error_messages([ validation_result ]);
        init_beef_tags_box();
    }
});

$(function(){
    var actors = extract_actors_from_page();
    window["select_actor_modal_controller__render_voting_panel"](actors[0], actors[1]);
});