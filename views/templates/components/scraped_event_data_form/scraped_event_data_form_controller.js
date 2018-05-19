$(function(){
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
        
        if(!event_submission.tags || event_submission.tags.length < 1){
            return { location: "tags", problem: "Please enter at least one tag" };
        }
        
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
    }
    
    function render_error_messages(error_messages, scraped_event_id){

        var template_dir = "error_panel";
        var template_name = "error_panel";
        var file_server_url_prefix = $("#file_server_url_prefix_store").attr("value"); //extract file server url prefix from hidden div

        load_template_render_function(template_dir + "/" + template_name, function(status){
            fade_new_content_to_div("#" + scraped_event_id + "_scraped_data_error_panel", window[template_name + "_tmpl_render_func"]({ file_server_url_prefix: file_server_url_prefix, errors: error_messages }));
        });
    }
    
    //delete the eent of which the button was clicked, plus any events with their checkboxes selected
    $(".delete-button").unbind().click(function(){
        var id_array_to_delete = [];
    
        id_array_to_delete.push($(this).attr("x-event-id"));
                
        //get array of checkboxes
        var checkboxes = $(".multi-check-box:checkbox:checked");
        
        for(var i = 0; i < checkboxes.length; i++){
            
            var checkbox = checkboxes[i];
            var event_id = $(checkbox).attr("x-event-id");
            
            if(id_array_to_delete.indexOf(event_id) == -1){
                id_array_to_delete.push(event_id);
            }
        }
        
        $.ajax({
            url: "/api/scraped_data/events/",
            data: JSON.stringify(id_array_to_delete),
            processData: false,
            contentType: "application/json",
            type: 'DELETE',
            success: function(data){
                location.reload();
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) { 
                console.log(errorThrown);
            }
        });
    });
    
    //scrape an actor using their name
    $(".scrape-actor-button").unbind().click(function(){
        
        var actor_name = $(this).parent().parent().find(".aggressor-name").val();
        var scrape_button_id = $(this).attr("x-identifier");
        
        //define function to replace scrape button with a tick signifying this actor is in the database and the id has been retrieved.
        var post_scrape_function = function(actor){
            $("." + scrape_button_id).css("display", "none");
            $("." + scrape_button_id).parent().each(function(){
                $($(this).find("i")[0]).css("display", "block");
            });
            
            $("." + scrape_button_id).parent().parent().each(function(){
                $($(this).find("input[type=text]")[0]).attr("x-resolved-db-id", actor._id)//assign returned record id to text input
                $($(this).find("input[type=text]")[0]).val(actor.name)
                $($(this).find("input[type=radio]")[0]).val(actor._id)
                $($(this).find("input[type=checkbox]")[0]).val(actor._id)
                
                $($(this).find("input[type=radio]")[0]).prop("disabled", false);
                $($(this).find("input[type=checkbox]")[0]).prop("disabled", false);
            });
        }
        
        
        //perform pre scrape check to make sure the actor is not already in the database
        $.ajax({
            url: "/api/actors?match_multi_names=" + actor_name,
            //data: id_array_to_delete,
            processData: false,
            //contentType: "application/json",
            type: 'GET',
            success: function(data){
                if(data.length > 0 ){
                    //actor already in the database, execute post function
                    post_scrape_function(data[0]);
                }
                else{//if server can find data for this actor
                    
                    $.ajax({
                        url: "/api/scraped_data/actor/"+ actor_name,
                        //data: id_array_to_delete,
                        processData: false,
                        //contentType: "application/json",
                        type: 'GET',
                        success: function(data){

                            if(data == "nothing_found"){
                                //insert error handling
                            }
                            else{//if server can find data for this actor

                                var data = JSON.parse(data);
                                console.log(data);
                                console.log(JSON.parse(data.actor_object));

                                //take actor data
                                load_data_into_add_actor_modal(JSON.parse(data.actor_object), data.field_data_dump)

                                $('#add_actor_modal').modal('show');
                                //location.reload();
                            }
                        },
                        error: function(XMLHttpRequest, textStatus, errorThrown) { 
                            console.log(errorThrown);
                        }
                    });
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) { 
                console.log(errorThrown);
            }
        });
    });
    
    //confirm event and add it to event_data table
    $(".submit_event").unbind().click(function(){
        
        //access event data
        var event_id = $(this).attr("x-event-id");
        var title = $("." + event_id + " > .panel-title").val();
        //var aggressor = $("." + event_id + " > .aggressor-selection:checked").val();
        var aggressors_jq = $("." + event_id + " > .aggressor-selection:checked").map(function(){ return $(this).val(); });
        var targets_jq = $("." + event_id + " > .target-selection:checked").map(function(){ return $(this).val(); });
        var date = $("." + event_id + " > .date").val()
        var description = $("." + event_id + " > .description-selection").val();
        var categories_jq = $("." + event_id + " > .category:checked").map(function(){ return $(this).val(); });
        var data_source = $("." + event_id + " > .data-source").attr("href");
        var tags = $("#" + event_id + "_beef_tags").select2().val();
        
        var aggressors = [];
        var targets = [];
        var categories = [];
                
        //build js arrays
        for(var i = 0; i < aggressors_jq.length; i++){
            aggressors.push(aggressors_jq[i]);
        }
        
        for(var i = 0; i < targets_jq.length; i++){
            targets.push(targets_jq[i]);
        }
        
        for(var i = 0; i < categories_jq.length; i++){
            categories.push(categories_jq[i]);
        }
        
        var gallery_items = [];
        var form_data = new FormData();

        var media_link = $("." + event_id + " > .img").attr("src");
        var media_name = $("." + event_id + " > .img").attr("src");
        var file = null;
        var link = null;

        if(media_link && media_link.length > 0 && media_link != "/images/no_preview_available.jpg"){
            
            if(media_link.indexOf("data:image") != -1){
                file = b64toBlob(media_link.split("base64,")[1]);
            }
        }

        var gallery_item_formatted = {
            file: file,
            media_type: "image",
            link: media_name,
            main_graphic: true,
            cover_image: true
        }

        gallery_items.push(gallery_item_formatted);
        
        var event_submission = {
            title: title,
            aggressors: aggressors.pop(),
            targets: targets,
            date: date,
            description: description,
            categories: categories,
            tags: tags,
            data_sources: [ data_source ],
            gallery_items: gallery_items,
            record_origin: "scraped"
        }
        
        var validation_result = validate_event_submission(event_submission)
        
        if(validation_result == "validation_successful"){
            
            form_data.append("data", event_submission);
        
            console.log(event_submission);
            
            $.ajax({
                url: "/api/events",
                data: form_data,
                processData: false,
                contentType: false,
                type: 'POST',
                success: function(data){
                    window.location.href = "/submission-success";
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

                                render_error_messages(errors);
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
            render_error_messages([ validation_result ], event_id);
        }
    });
});