$(function(){
    
    function urltoFile(url, filename, mimeType){
        return (fetch(url)
            .then(function(res){return res.arrayBuffer();})
            .then(function(buf){return new File([buf], filename, {type:mimeType});})
        );
    }
    
    function b64toBlob(b64Data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        var byteCharacters = atob(b64Data);
        var byteArrays = [];

        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);

            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            var byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        var blob = new Blob(byteArrays, {type: contentType});
        return blob;
    }
    
    $("#submit_new_event_button").unbind().click(function(event){
        event.preventDefault();
        
        //get form contents
        var title = $("#beef_title").val();
        var date = $("#beef_date").val().split("-");
        var aggressor = $("#beefer_name").attr("x-actor-id");
        var target = $("#beefee_name").attr("x-actor-id");
        var category = $("#beef_category").select2().find(":selected").val();
        var tags = $("#beef_tags").select2().val();
        var description = $("#beef_content_summernote").val();
        var description = $("#beef_description").val();
        /*
        console.log(title);
        console.log(date);
        console.log(aggressor);
        console.log(target);
        console.log(category);
        console.log(tags);
        console.log(description);
        */
        var li_items_data_sources = $("#add_beef_event_data_sources").find("li");
        var data_sources = [];
        
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
            form_data.append("file-" + i, gallery_item_formatted.file, gallery_item_formatted.link);

        }
        
        var event_submission = {
            title: title,
            aggressors: [ aggressor ],
            targets: [ target ],
            date: date[2] + "/" + date[1] + "/" + date[0],
            description: description,
            categories: [ category ],
            tags: tags,
            data_sources: data_sources,
            gallery_items: gallery_items,
            record_origin: "submitted"
        }

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
                if(XMLHttpRequest.responseJSON.stage == "validation"){
                    
                    var template_dir = "error_panel";
                    var template_name = "error_panel";
                    var file_server_url_prefix = $("#file_server_url_prefix_store").attr("value"); //extract file server url prefix from hidden div
                    
                    load_template_render_function(template_dir + "/" + template_name, function(status){
                        
                        var errors = XMLHttpRequest.responseJSON.details.map(function(item){
                            return {
                                location: item.param,
                                problem: item.msg
                            }
                        });
                        
                        fade_new_content_to_div("#error_panel", window[template_name + "_tmpl_render_func"]({ file_server_url_prefix: file_server_url_prefix, errors: errors }))

                    });
                }
            }   
        });
        
    }); 
});