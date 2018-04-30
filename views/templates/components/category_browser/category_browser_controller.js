$(function(){
    $(".category_button").click(function(event){
        event.preventDefault();
        
        var clicked_button = this;
        var template_dir = "thumbnail_grid";
        var template_name = "thumbnail_grid";
        var file_server_url_prefix = $("#file_server_url_prefix_store").attr("value"); //extract file server url prefix from hidden div
        
        $(".category_button").parent().find('.category_button').css('color', '#fff');
        $(clicked_button).css("color", "#DF3E3E");
        
        $.get("/api/events", { match_category: this.id, limit: 6 }, function(data){                
            load_template_render_function(template_dir + "/" + template_name, function(status){
                fade_new_content_to_div("#beef_category_browser_display", window[template_name + "_tmpl_render_func"]({ file_server_url_prefix: file_server_url_prefix, grid_thumbnail_data: data, data_type: "events" }))
                
                //set new vategory browser title
                $("#category_header_title").text(clicked_button.text.toUpperCase() + ".");
                $('.lazy').Lazy();
            });
        });
    });
})