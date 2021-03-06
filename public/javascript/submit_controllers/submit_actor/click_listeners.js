
$(".submit_new_actor_button").unbind().click(function(event){
    event.preventDefault();
    
    //get form contents
    var name = $("#actor_name").val();
    var date_of_origin = $("#actor_date_of_origin").val().split("-");
    var place_of_origin = $("#actor_place_of_origin").val();
    var actor_bio = $("#actor_bio").val().replace(/&/g, '+'); //XSS doesnt like the '&' character, replace it with a '+' to bypass validation
    var actor_classification = $("#step-1").parent().attr("x-selected-actor-type");
    var file_server_url_prefix = $("#file_server_url_prefix_store").attr("value"); //extract file server url prefix from hidden div
    
    var variable_fields_panel_children = $("#variable_fields_panel").children("div").slice(3);
    var variable_fields_obj = {};
    
    for(var i = 0; i < variable_fields_panel_children.length; i++){
        
        var item = variable_fields_panel_children[i];

        if(item.className.includes("list")){
            //deal with list
            variable_fields_obj[$($(item).children("div").find("ul")[0]).attr("id")] = $.makeArray($(item).find("li").map(function(){ return $(this).text();}));
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
    for(i = 0; i < li_items_also_known_as.length; i++){
        also_known_as.push(li_items_also_known_as[i].textContent);
    }
    
    var li_items_data_sources = $("#add_actor_modal_data_sources").children();
    var data_sources = [];
    
    //extract data sources
    for(i = 0; i < li_items_data_sources.length; i++){
        data_sources.push(li_items_data_sources[i].textContent);
    }
    
    var gallery_items = [];
    var form_data = new FormData();

    var media_link = $("#actor_photo_preview").attr("src");
    var media_name = $("#actor_photo_preview").attr("x-file-name");

    var gallery_item_formatted = {
        file: null,
        media_type: "image",
        link: media_name || "default",
        main_graphic: true,
        cover_image: true
    };

    if(media_link && media_link.length > 0 && media_link != "/images/no_preview_available.jpg"){
        
        if(media_link.indexOf("data:image") != -1){
            gallery_item_formatted.file = b64toBlob(media_link.split("base64,")[1]);
            form_data.append("file-" + i, gallery_item_formatted.file, gallery_item_formatted.link);
        }
    }


    gallery_items.push(gallery_item_formatted);
    
    var formatted_date = new Date(parseInt(date_of_origin[0]), parseInt(date_of_origin[1])-1, parseInt(date_of_origin[2]), parseInt(12), parseInt(00));
    
    var actor_submission = {
        name: name,
        date_of_origin: formatted_date,
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
                
                var new_option = new Option(actor_submission.name, data._id, true, true);
                new_option.setAttribute("x-actor-image-link", data.gallery_items[0].link);
                new_option.setAttribute("x-actor-name", actor_submission.name);
                new_option.setAttribute("x-actor-id", data._id);
                $("#select_actor").append(new_option).trigger("change");
                window.location.hash = "step-1";
                
                $("#selector_actor_modal").modal("show"); //show select_actor_modal
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                
                if(XMLHttpRequest.status != 200){

                    if(XMLHttpRequest && XMLHttpRequest.responseJSON){

                        if(XMLHttpRequest.responseJSON.stage == "server_validation"){

                            var helpful_repsonse_map = {
                                "Not an array of links.": "There was a problem with the formatting of one of the links you entered. Please ensure all links have 'http://www' at the beginning.",
                                "Not an array of urls.": "There was a problem with the formatting of one of the data sources you entered. Please ensure all links have 'http://www' at the beginning."
                            };

                            var errors = XMLHttpRequest.responseJSON.details.map(function(item){

                                //map possibly unhelpful server responses to more useful, user friendly messages

                                return {
                                    location: item.param,
                                    problem: item.msg in helpful_repsonse_map ? helpful_repsonse_map[item.msg] : item.msg
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