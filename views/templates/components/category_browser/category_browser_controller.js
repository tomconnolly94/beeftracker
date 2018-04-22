$(function(){
    $(".category_button").click(function(event){
        event.preventDefault();
        var clicked_button = this;
        var template_dir = "thumbnail_grid";
        var template_name = "thumbnail_grid";
        
        $(".category_button").parent().find('.category_button').css('color', '#fff');
        $(clicked_button).css("color", "#DF3E3E")
        
        $.get("/api/events", { match_category: this.id, limit: 6 }, function(data){                
            load_template_render_function(template_dir + "/" + template_name, function(status){
                fade_new_content_to_div("#beef_category_browser_display", window[template_name + "_tmpl_render_func"]({ file_server_url_prefix: "http://res.cloudinary.com/hghz4zts3/image/upload/v1514066941", grid_data: data }))
                
                //set new vategory browser title
                $("#category_header_title").text(clicked_button.text.toUpperCase() + ".")
                //$("#beef_category_browser_display").html("<h1> hello </h1>");
            });
        });
    });
})