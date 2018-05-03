$(function(){
    
    var toolbar_button_first_press = true;
    
    $(".toolbar_button").click(function(event){
        event.preventDefault();
        var clicked_button = this;
        var previously_selected_option = $(this).parent().parent().attr("x-selected-option");
        var events_query;
        var template_dir = "thumbnail_grid";
        var template_name = "thumbnail_grid";
        var section_control_div_id = $(this).parent().parent().parent().parent()[0].id;
        var section_display_div_id = section_control_div_id.replace("control", "display");
        var data_type = $(this).parent().parent().attr("x-data-type");
        var file_server_url_prefix = $("#file_server_url_prefix_store").attr("value"); //extract file server url prefix from hidden div
        
        //set new active button
        $(clicked_button).parent().parent().find('li').removeClass("active");
        $(clicked_button).parent().addClass("active");
        
        if(this.id != previously_selected_option){ //don't run function if the clicked button is already selected (efficiency measure)
            switch(this.id){
                case "all":
                    events_query = { limit: 12 };
                    break;
                case "new":
                    events_query = { limit: 12, decreasing_order: "date_added" };
                    break;
                case "trending":
                    events_query = { limit: 12, decreasing_order: "currently_trending" };
                    break;
                case "hot":
                    events_query = { limit: 12, decreasing_order: "rating" };
                    break;
                case "old":
                    events_query = { limit: 12, increasing_order: "date_added" };
                    break;
                case "popular":
                    events_query = { limit: 12, decreasing_order: "date_added" };
                    break;
            }
            
            $.get("/api/" + data_type, events_query, function(data){
                load_template_render_function(template_dir + "/" + template_name, function(status){
                    fade_new_content_to_div("#" + section_display_div_id, window[template_name + "_tmpl_render_func"]({ file_server_url_prefix: file_server_url_prefix, grid_thumbnail_data: data, data_type: data_type }))
                });
            });
            $(this).parent().parent().attr("x-selected-option", this.id);
        }
    });
    
});