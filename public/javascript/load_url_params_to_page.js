$(function(){

    var add_beef_url_field_mappings = {
        "_id": "_id",
        "beef_title": "title",
        "beef_category": "category",
        "beef_description": "description",
    }

    var urlParams = new URLSearchParams(window.location.search);
    document.getElementById("beef_title").value = urlParams.get("title");
    document.getElementById("beef_description").value = urlParams.get("description");
    $('#beef_category').val(JSON.parse(urlParams.get("cat_id"))).trigger('change');


    write_list_to_display("add_event_data_sources", JSON.parse(urlParams.get("data_sources")));
    var date_split = urlParams.get("date").split("T")
    document.getElementById("beef_date").value = date_split[0];
    document.getElementById("beef_time").value = date_split[1].slice(0,5);

    $("#beef_tags").val(JSON.parse(urlParams.get("tags"))).trigger('change');

    window["select_actor_modal_controller__render_voting_panel"](JSON.parse(urlParams.get("aggressors")), JSON.parse(urlParams.get("targets")))

    var gallery_items = JSON.parse(urlParams.get("gallery_items")).map(function(item, index){
        return { 
            src: window["upload_gallery_item_modal_controller__get_youtube_embed_img_src"](item.link), 
            media_type: item.media_type, 
            file_name: item.link, 
            link: item.link, 
            main_graphic: item.main_graphic, 
            cover_image: urlParams.get("cover_image") == item.link ? true : false
        };
    })
    window["upload_gallery_item_modal_controller__render_voting_panel"](gallery_items, function(){});

    console.log(JSON.parse(urlParams.get("tags")));
    console.log(JSON.parse(urlParams.get("gallery_items")));
});