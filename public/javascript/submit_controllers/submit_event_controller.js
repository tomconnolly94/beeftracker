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
    
    function render_error_messages(error_messages){

        var template_dir = "error_panel";
        var template_name = "error_panel";
        var file_server_url_prefix = $("#file_server_url_prefix_store").attr("value"); //extract file server url prefix from hidden div

        load_template_render_function(template_dir + "/" + template_name, function(status){
            
            var html = window[template_name + "_tmpl_render_func"]({ file_server_url_prefix: file_server_url_prefix, errors: error_messages });
            
            fade_new_content_to_div("#error_panel", window[template_name + "_tmpl_render_func"]({ file_server_url_prefix: file_server_url_prefix, errors: error_messages }));
        });
    }
    
    $(".submit_new_event_button").unbind().click(function(event){
        event.preventDefault();
        
        //get form contents
        var title = $("#beef_title").val();
        var date = $("#beef_date").val().split("-");
        /*var aggressor = $("#beefer_name").attr("x-actor-id");
        var target = $("#beefee_name").attr("x-actor-id");*/
        var aggressors_li = $(".beefer");
        var targets_li = $(".beefee");
        
        var category = $("#beef_category").select2().find(":selected").val();
        var tags = $("#beef_tags").select2().val();
        //var description = $("#beef_content_summernote").val();
        var description = $("#beef_description").val();
        var li_items_data_sources = $("#add_event_data_sources").find("li");
        var data_sources = [];
        var aggressors = [];
        var targets = [];
        
        //format aggressors
        for(var i = 0; i < aggressors_li.length; i++){
            if($(aggressors_li[i]).children("div").children("h4").attr("x-actor-id")){
                aggressors.push($(aggressors_li[i]).children("div").children("h4").attr("x-actor-id"));
            }
        }
        
        //format aggressors
        for(var i = 0; i < targets_li.length; i++){
            if($(targets_li[i]).children("div").children("h4").attr("x-actor-id")){
                targets.push($(targets_li[i]).children("div").children("h4").attr("x-actor-id"));
            }
        }
        
        //extract data sources
        for(var i = 0; i < li_items_data_sources.length; i++){
            data_sources.push(li_items_data_sources[i].textContent);
        }
        
        var li_items_gallery_manager = $("#gallery_manager").find(".gallery-manager-item");
        var gallery_items = [];
        var form_data = new FormData();
        
        //extract gallery items
        for(var i = 0; i < li_items_gallery_manager.length; i++){
            var item = li_items_gallery_manager[i];
            
            var media_type = $(item).children("img").attr("x-media-type");
            var media_name = $(item).children("img").attr("x-file-name");
            var media_link = $(item).children("img").attr("x-media-link");
            var main_graphic = $(item).children("img").attr("x-main-graphic") ? true : false;
            var cover_image = $(item).children("img").attr("x-cover-image") ? true : false;
            var file = null;
            var link = null;
            
            if(media_type == "image"){
                file = b64toBlob(item.children[1].currentSrc.split("base64,")[1]);
                link = "img" + i;
            }
            else if(media_type == "youtube_embed"){
                link = media_link;
            }
            
            var gallery_item_formatted = {
                file: file,
                media_type: media_type,
                link: link,
                main_graphic: main_graphic,
                cover_image: cover_image
            }

            gallery_items.push(gallery_item_formatted);
            
            if(media_type == "image"){
                form_data.append("file-" + i, gallery_item_formatted.file, gallery_item_formatted.link);
            }
        }
        
        var event_submission = {
            title: title,
            aggressors: aggressors,
            targets: targets,
            date: date[2] + "/" + date[1] + "/" + date[0],
            description: description,
            categories: [ category ],
            tags: tags,
            data_sources: data_sources,
            gallery_items: gallery_items,
            record_origin: "submitted"
        }

        var validation_result = validate_event_submission(event_submission)
        
        if(validation_result == "validation_successful"){
            
            form_data.append("data", JSON.stringify(event_submission));
        
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
            render_error_messages([ validation_result ]);
        }
    }); 
});