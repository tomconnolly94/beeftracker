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
    }
    
    function render_error_messages(error_messages){

        var template_dir = "error_panel";
        var template_name = "error_panel";
        var file_server_url_prefix = $("#file_server_url_prefix_store").attr("value"); //extract file server url prefix from hidden div

        load_template_render_function(template_dir + "/" + template_name, function(status){
            fade_new_content_to_div("#submit_event_error_panel", window[template_name + "_tmpl_render_func"]({ file_server_url_prefix: file_server_url_prefix, errors: error_messages }));
        });
    }
    
    function submit_http_post_req(form_data, post_url){
        $.ajax({
            url: post_url,
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
                        else if(XMLHttpRequest.responseJSON.stage == "token_authentication"){
                            attempt_to_obtain_new_access_token(function(success){
                                if(success){
                                    //make request again
                                    submit_http_post_req(form_data);
                                }
                            });
                        }
                    }
                    else{
                        console.log("URGENT SERVER ERROR.", XMLHttpRequest.statusText);
                    }
                }
            }
        });
    }

    function extract_actors_from_page(){
        var aggressors_li = $(".beefer");
        var targets_li = $(".beefee");
        var aggressors = [];
        var targets = [];
        
        //format aggressors
        for(var i = 0; i < aggressors_li.length; i++){
            if($(aggressors_li[i]).children("div").children("h4").attr("x-actor-id")){

                var new_actor_record = {
                    src: $(aggressors_li[i]).children("div").children("a").children("img").attr("src"),
                    name: $(aggressors_li[i]).children("div").children("h4").text(),
                    _id: $(aggressors_li[i]).children("div").children("h4").attr("x-actor-id")
                };

                aggressors.push(new_actor_record);
            }
        }
        
        //format aggressors
        for(var i = 0; i < targets_li.length; i++){
            if($(targets_li[i]).children("div").children("h4").attr("x-actor-id")){

                var new_actor_record = {
                    src: $(targets_li[i]).children("div").children("a").children("img").attr("src"),
                    name: $(targets_li[i]).children("div").children("h4").text(),
                    _id: $(targets_li[i]).children("div").children("h4").attr("x-actor-id")
                };

                targets.push(new_actor_record);
            }
        }

        return [aggressors, targets];
    }

    function extract_data_from_page(){

        //get form contents
        var title = $("#beef_title").val();
        var date = $("#beef_date").val().split("-");
        var time = $("#beef_time").val().split(":");
        var category = $("#beef_category").select2().find(":selected").val();
        var tags = $("#beef_tags").select2().val();
        //var description = $("#beef_content_summernote").val();
        var description = $("#beef_description").val().replace(/&/g, '+'); //XSS doesnt like the '&' character, replace it with a '+' to bypass validation
        var li_items_data_sources = $("#add_event_data_sources").find("li");
        var data_sources = [];

        var actors = extract_actors_from_page();
        var aggressors = actors[0].map(function(actor){ return actor._id });
        var targets = actors[1].map(function(actor){ return actor._id });;
        
        //extract data sources
        for(var i = 0; i < li_items_data_sources.length; i++){
            data_sources.push(li_items_data_sources[i].textContent);
        }
        
        var li_items_gallery_manager = $("#gallery_manager").find(".gallery-manager-item");
        var gallery_items = [];
        
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
                if(item.children[1].currentSrc.includes("base64")){
                    file = b64toBlob(item.children[1].currentSrc.split("base64,")[1]);
                    link = "img" + i;
                }
                else{
                    link = item.children[1].currentSrc;
                }
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
        }
        
        var formatted_date = new Date(parseInt(date[0]), parseInt(date[1])-1, parseInt(date[2]), parseInt(time[0]), parseInt(time[1]));
        
        var event_submission = {
            title: title,
            aggressors: aggressors,
            targets: targets,
            date: formatted_date,
            description: description,
            categories: [ category ],
            tags: tags,
            data_sources: data_sources,
            gallery_items: gallery_items,
            record_origin: "submitted"
        }

        return event_submission;
    }
    
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
        }
    });

    var actors = extract_actors_from_page();
    window["select_actor_modal_controller__render_voting_panel"](actors[0], actors[1]);
});