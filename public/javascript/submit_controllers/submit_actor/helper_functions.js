//take any validation error messgages and display them to the error panel
function render_actor_modal_error_messages(error_messages){

    var template_dir = "error_panel";
    var template_name = "error_panel";
    var file_server_url_prefix = $("#file_server_url_prefix_store").attr("value"); //extract file server url prefix from hidden div

    load_template_render_function(template_dir + "/" + template_name, function(status){
        
        var html = window[template_name + "_tmpl_render_func"]({ file_server_url_prefix: file_server_url_prefix, errors: error_messages });
        
        fade_new_content_to_div("#submit_actor_error_panel", window[template_name + "_tmpl_render_func"]({ file_server_url_prefix: file_server_url_prefix, errors: error_messages }));
    });
}

//clear all fields in the add_actor_modal
function reset_add_actor_modal(){
    
    //clear fields
    $("#actor_name").val("").trigger("change");
    $("#actor_place_of_origin").val("").trigger("change");
    $("#actor_bio").val("").trigger("change");
    
    //reset all fields in variable_fields_panel
    $("#variable_fields_panel").find("input").val("").trigger("change");
    
    //reset link fields
    $("#add_actor_website_link").val("").trigger("change");
    $("#add_actor_wikipedia_link").val("").trigger("change");
    $("#add_actor_twitter_link").val("").trigger("change");
    $("#add_actor_instagram_link").val("").trigger("change");
    $("#add_actor_youtube_link").val("").trigger("change");
    $("#add_actor_spotify_link").val("").trigger("change");
    
    //remove all entries from add-lists
    $("#add_actor_modal .list-group-item").remove();
    
    //reset img_preview
    $("#actor_photo_preview").attr("src", "/images/no_preview_available.jpg");
    $("#actor_photo_preview").attr("x-media-link", "");
    $("#actor_photo_preview").attr("x-file-name", "");
    
    //reset actor type selection
    $("#step-1").find("a").each(function(){ $(this).removeClass("active"); } );
    $("#step-1").parent().attr("x-selected-actor-type", null);
    
    //clear data_sources input tag
    $("#add_list_input_add_actor_modal_data_sources").attr("");
    
    //reset file input tag
    var file_input_tag = $('#actor_photo');
    file_input_tag.wrap('<form>').closest('form').get(0).reset();
    file_input_tag.unwrap();
    
    //clear error_panel
    render_actor_modal_error_messages([]);
}