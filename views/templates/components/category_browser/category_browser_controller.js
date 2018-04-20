$(function(){
    $(".category_button").click(function(event){
        event.preventDefault();
        var clicked_button = this;
        
        var template_dir = "category_browser";
        var template_name = "category_browser_display";
        
        
        $(".category_button").parent().find('.category_button').css('color', '#fff');
        $(clicked_button).css("color", "#DF3E3E")
        
        $.get("/api/events", { match_category: this.id, limit: 6 }, function(data){
            console.log(data);
                
            load_template_render_function(template_dir + "/" + template_name, function(status){
                
                var func = window[template_name + "_tmpl_render_func"];
                
                //var html = window[template_name + "_tmpl_render_func"]({ category_event_data: data });
                
                var fade_speed = 75;
                
                $("#beef_category_browser_display").fadeOut(fade_speed, function(){
                    $("#beef_category_browser_display").html(window[template_name + "_tmpl_render_func"]({ file_server_url_prefix: "http://res.cloudinary.com/hghz4zts3/image/upload/v1514066941", category_event_data: data }));
                    $("#beef_category_browser_display").fadeIn(fade_speed);
                });
                
                //set new vategory browser title
                $("#category_header_title").text(clicked_button.text.toUpperCase() + ".")
                //$("#beef_category_browser_display").html("<h1> hello </h1>");
            });
        });
    });
})