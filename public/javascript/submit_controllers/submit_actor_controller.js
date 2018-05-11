$(function(){
    
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
        $("#variable_fields_panel").find("input").val("").trigger("change")
        
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
        $("#actor_photo_preview").attr("src", "/images/no_preview_available.jpg")
        $("#actor_photo_preview").attr("x-media-link", "")
        $("#actor_photo_preview").attr("x-file-name", "")
        
        //reset actor type selection
        $("#step-1").find("a").each(function(){ $(this).removeClass("active") } );
        $("#step-1").parent().attr("x-selected-actor-type", null);
        
        //clear data_sources input tag
        $("#add_list_input_add_actor_modal_data_sources").attr("");
        
        //reset file input tag
        var file_input_tag = $('#actor_photo');
        file_input_tag.wrap('<form>').closest('form').get(0).reset();
        file_input_tag.unwrap();
        
        //clear error_panel
        render_actor_modal_error_messages([])
    }
    
    $(".submit_new_actor_button").unbind().click(function(event){
        event.preventDefault();
        
        //get form contents
        var name = $("#actor_name").val();
        var date_of_origin = $("#actor_date_of_origin").val() ? $("#actor_date_of_origin").val().split("-") : null;
        var place_of_origin = $("#actor_place_of_origin").val();
        var actor_bio = $("#actor_bio").val();
        var actor_classification = $("#step-1").parent().attr("x-selected-actor-type");
        var file_server_url_prefix = $("#file_server_url_prefix_store").attr("value"); //extract file server url prefix from hidden div
        
        var variable_fields_panel_children = $("#variable_fields_panel").children("div").slice(3);
        var variable_fields_obj = {};
        
        for(var i = 0; i < variable_fields_panel_children.length; i++){
            
            var item = variable_fields_panel_children[i];

            if(item.className.includes("list")){
                //deal with list
                variable_fields_obj[$($(item).children("div").find("ul")[0]).attr("id")] = $.makeArray($(item).find("li").map(function(){ return $(this).text()}));
            }
            else{
                variable_fields_obj[$(item).children("input").attr("id")] = $(item).children("input").val();
            }
        }
        
        var website_link = $("#add_actor_website_link").val();
        var wikipedia_link = $("#add_actor_wikipedia_link").val();
        var twitter_link = $("#add_actor_twitter_link").val();
        var instagram_link = $("#add_actor_instagram_link").val();
        var youtube_link = $("#add_actor_youtube_link").val();
        var spotify_link = $("#add_actor_spotify_link").val();
        var links = [];
        
        if(website_link && website_link.length > 0){
            links.push({ title: "Website", url: website_link });
        }
        if(wikipedia_link && wikipedia_link.length > 0){
            links.push({ title: "Wikipedia", url: wikipedia_link });
        }
        if(twitter_link && twitter_link.length > 0){
            links.push({ title: "Twitter", url: twitter_link });
        }
        if(instagram_link && instagram_link.length > 0){
            links.push({ title: "Instagram", url: instagram_link });
        }
        if(youtube_link && youtube_link.length > 0){
            links.push({ title: "YouTube", url: youtube_link });
        }
        if(spotify_link && spotify_link.length > 0){
            links.push({ title: "Spotify", url: spotify_link });
        }
        
        
        var li_items_also_known_as = $("#add_actor_modal_also_known_as").children();
        var also_known_as = [];
        
        //extract data sources
        for(var i = 0; i < li_items_also_known_as.length; i++){
            console.log(li_items_also_known_as[i]);
            also_known_as.push(li_items_also_known_as[i].textContent);
        }
        
        var li_items_data_sources = $("#add_actor_modal_data_sources").children();
        var data_sources = [];
        
        //extract data sources
        for(var i = 0; i < li_items_data_sources.length; i++){
            console.log(li_items_data_sources[i]);
            data_sources.push(li_items_data_sources[i].textContent);
        }
        
        var gallery_items = [];
        var form_data = new FormData();

        var media_link = $("#actor_photo_preview").attr("src");
        var media_name = $("#actor_photo_preview").attr("x-file-name");
        var file = null;
        var link = null;

        if(media_link && media_link.length > 0 && media_link != "/images/no_preview_available.jpg"){
            file = b64toBlob(media_link.split("base64,")[1]);
        }

        var gallery_item_formatted = {
            file: file,
            media_type: "image",
            link: media_name,
            main_graphic: true,
            cover_image: null
        }

        gallery_items.push(gallery_item_formatted);
        form_data.append("file-" + i, gallery_item_formatted.file, gallery_item_formatted.link);
        
        var actor_submission = {
            name: name,
            date_of_origin: date_of_origin ? date_of_origin[2] + "/" + date_of_origin[1] + "/" + date_of_origin[0] : null,
            place_of_origin: place_of_origin,
            description: actor_bio,
            data_sources: data_sources,
            also_known_as: also_known_as,
            classification: actor_classification,
            variable_field_values: variable_fields_obj,
            links: links,
            gallery_items: gallery_items,
            record_origin: "submitted"
        }
        
        console.log(actor_submission);

        var validation_result = validate_actor_submission(actor_submission)
        
        if(validation_result == "validation_successful"){
            
            form_data.append("data", JSON.stringify(actor_submission));
        
            $.ajax({
                url: "/api/actors",
                data: form_data,
                processData: false,
                contentType: false,
                type: 'POST',
                success: function(data){
                    
                    reset_add_actor_modal(); //reset modal fields
                    $("#add_actor_modal").modal("hide"); //close add_actor_modal
                    
                    var new_option = new Option(actor_submission.name, data.id, true, true);
                    new_option.setAttribute("x-actor-image-link", file_server_url_prefix + "/actors/" + data.gallery_items[0].link);
                    new_option.setAttribute("x-actor-name", actor_submission.name);
                    new_option.setAttribute("x-actor-id", data.id);
                    $("#select_actor").append(new_option).trigger("change");
                    
                    $("#selector_actor_modal").modal("show"); //show select_actor_modal
                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    
                    if(XMLHttpRequest.status != 200){

                        if(XMLHttpRequest && XMLHttpRequest.responseJSON){

                            if(XMLHttpRequest.responseJSON.stage == "server_validation"){

                                var errors = XMLHttpRequest.responseJSON.details.map(function(item){
                                    return {
                                        location: item.param,
                                        problem: item.msg
                                    }
                                });

                                render_actor_modal_error_messages(errors);
                            }
                        }
                        else{
                            console.log("URGENT SERVER ERROR.", XMLHttpRequest.statusText);
                        }
                    }
                }
            });
        }
        else{
            render_actor_modal_error_messages([ validation_result ]);
        }
    }); 
});