$(function(){
    
    var toolbar_button_first_press = true;
    
    $(".toolbar_button").click(function(event){
        event.preventDefault();
        var clicked_button = this;
        var previously_selected_option = this.parentElement["x-selected-option"];
        var events_query;
        var template_dir = "thumbnail_grid";
        var template_name = "thumbnail_grid";
        
        
        $(clicked_button).parent().parent().find('li').removeClass("active");
        $(clicked_button).parent().addClass("active");
        
        
        if(this.id != previously_selected_option){
            switch(this.id){
                case "all":
                    events_query = { limit: 12 };
                    break;
                case "new":
                    events_query = { limit: 12, increasing_order: "date_added" };
                    break;
                case "trending":
                    events_query = { limit: 12, increasing_order: "currently_trending" };
                    break;
                case "old":
                    events_query = { limit: 12, decreasing_order: "date_added" };
                    break;
                case "popuplar":
                    events_query = { limit: 12, decreasing_order: "date_added" };
                    break;
            }
            
            $.get("/api/events", events_query, function(data){
                console.log(data);

                load_template_render_function(template_dir + "/" + template_name, function(status){
                    
                    var html = window[template_name + "_tmpl_render_func"]({ file_server_url_prefix: "http://res.cloudinary.com/hghz4zts3/image/upload/v1514066941", grid_data: data });
                    
                    fade_new_content_to_div("#section_toolbar_display_1", window[template_name + "_tmpl_render_func"]({ file_server_url_prefix: "http://res.cloudinary.com/hghz4zts3/image/upload/v1514066941", grid_thumbnail_data: data }))

                    //set new vategory browser title
                    //$("#category_header_title").text(clicked_button.text.toUpperCase() + ".")
                    //$("#beef_category_browser_display").html("<h1> hello </h1>");
                });
            });
            $(this).attr("x-selected-option", this.id);
        }
    });
    
});