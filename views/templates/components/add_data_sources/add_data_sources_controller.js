$(function(){
    
    var data_sources = [];
    
    $(".add_data_source_button").click(function(event){
        event.preventDefault();
        
        var clicked_button = this;
        var template_dir = "add_data_sources";
        var template_name = "add_data_sources_display";
        var display_id = $(this).attr("x-display-id"); //get the id if the display of this componenet, needed in case componenet is used twice on the same page
        var new_data_source = $("#data_source_input_" + display_id).val(); //get data source from text input
        
        data_sources.push(new_data_source); //add new source to global array
                     
        load_template_render_function(template_dir + "/" + template_name, function(status){
            fade_new_content_to_div("#" + display_id, window[template_name + "_tmpl_render_func"]({ file_server_url_prefix: "http://res.cloudinary.com/hghz4zts3/image/upload/v1514066941", data_sources: data_sources, display_id: display_id }))

            $("#data_source_input_" + display_id).val(""); //clear text input box
        });
    });
    
    $(".data_sources_list").on("click", ".remove-data-source", function(event){
        event.preventDefault();
        
        console.log($(this.parentElement.parentElement).val());
        $(this.parentElement.parentElement).remove();
        
        var item_index = data_sources.indexOf(this.parentElement.parentElement.textContent)
        
        if(item_index != -1){
            data_sources.splice(item_index, 1)
        }
    });
});