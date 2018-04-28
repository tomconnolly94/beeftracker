$(function(){
    
    $("#search_box_form").unbind().submit(function(){
        var search_term = $("#search_box_input").val();
        
        var template_name = "search_results";
        var template_dir = "search_results";
        
        var data_type = "events";
        var section_display_div_id = "search_results";
        
        $.get("/api/events", { match_title: search_term }, function(event_data){
            $.get("/api/actors", { match_name: search_term }, function(actor_data){
                
                var all_data = event_data.concat(actor_data);
                
                load_template_render_function(template_dir + "/" + template_name, function(status){
                    fade_new_content_to_div("#" + section_display_div_id, window[template_name + "_tmpl_render_func"]({ file_server_url_prefix: "http://res.cloudinary.com/hghz4zts3/image/upload/v1514066941", search_result_event_data: event_data, search_result_actor_data: actor_data }))
                });
            });
        });
    });
});