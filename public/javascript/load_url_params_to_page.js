$(function(){

    var url_params = new URLSearchParams(window.location.search);

    var param_function_mapping = {
        _id: function(param){
            //TODO: do something with _Id to save it for the update request
        },
        title: function(param){
            document.getElementById("beef_title").value = param;
        },
        date: function(param){
            var date_split = url_params.get("date").split("T")
            document.getElementById("beef_date").value = date_split[0];
            document.getElementById("beef_time").value = date_split[1].slice(0,5);
        },
        description: function(param){
            document.getElementById("beef_description").value = param;
        },
        cat_id: function(param){
            $('#beef_category').val(JSON.parse(param)).trigger('change');
        },
        aggressors: function(param){
            window["select_actor_modal_controller__render_voting_panel"](JSON.parse(param), JSON.parse(url_params.get("targets")))
        },
        targets: function(param){
            
        },
        gallery_items: function(param){
            var gallery_items = JSON.parse(param).map(function(item, index){

                var src = "";
        
                if(item.media_type == "youtube_embed"){
                    src = window["youtube_url_translation"].get_youtube_embed_img_src(item.link);
                }
                else if(item.media_type == "image"){
                    src = $("#file_server_url_prefix_store").attr("value") + "/events/" + item.link;
                }
        
                return {
                    src: src, 
                    media_type: item.media_type, 
                    file_name: item.link, 
                    link: item.link, 
                    main_graphic: item.main_graphic, 
                    cover_image: url_params.get("cover_image") == item.link ? true : false
                };
            });

            window["upload_gallery_item_modal_controller__render_voting_panel"](gallery_items, function(){});
        },
        data_sources: function(param){
            write_list_to_display("add_event_data_sources", JSON.parse(param));
        },
        tags: function(param){
            

            function convertObjectToSelectOptions(obj){
                var htmlTags = '';
                for (var tag in obj){
                    htmlTags += '<option value="'+tag+'" selected="selected">'+obj[tag]+'</option>';
                }
                return htmlTags;
            }


            var tag_arr = JSON.parse(url_params.get("tags"));
            var tag_obj = {};
            for(var i = 0; i < tag_arr.length; i++){
                tag_obj[i] = tag_arr[i];
            }
            
            $('#beef_tags').html(convertObjectToSelectOptions(tag_obj)).trigger('change');
        }
    };

    //loop through all available search params, if a mapping function is available for that param, then execute it
    for(let url_param of url_params){
        if (url_param[0] in param_function_mapping){
            param_function_mapping[url_param[0]](url_param[1]);
        }
    }
});
