$(function(){
    
    $(".actor-type-item").unbind().click(function(event){
        
        var id = $(this).attr("id");
        $(this).parent().parent().parent().attr("x-selected-actor-type", id);
        
        var div_list = $(this).parent().parent().children();
        
        //remove active class from all divs
        for(var i = 0; i < div_list.length; i++){
            $(div_list[i]).children("a").removeClass("active");        
        }
        
        $(this).addClass("active"); //add active class to seelcted option
        
        var template_dir = "add_actor_modal";
        var template_name = "add_actor_variable_field_panel";
        var file_server_url_prefix = $("#file_server_url_prefix_store").attr("value"); //extract file server url prefix from hidden div
        
        $.get("/api/actor-variable-fields-config", {}, function(data){
            load_template_render_function(template_dir + "/" + template_name, function(status){
                fade_new_content_to_div("#variable_fields_panel", window[template_name + "_tmpl_render_func"]({ file_server_url_prefix: file_server_url_prefix, variable_fields: data, active_classification: id }))
            });
        });
        
        //un-disable step2 modal page
        $("#step_2_anchor").removeClass("disabled_anchor");
        $("#step_3_anchor").removeClass("disabled_anchor");
        //window.location.hash = "step-2";
    });
    
    //function to handle a image being added to the file input tag
    $("#actor_photo").change(function() {
        let input = this;
        
        if (input.files && input.files[0]) {
            let reader = new FileReader();

            reader.onload = function(e) {
                $('#actor_photo_preview').attr('src', e.target.result);
            }
            reader.readAsDataURL(input.files[0]);
        }
        
        var file_name = input.files[0].name;
        
        $('#actor_photo_preview').attr('x-media-link', file_name);
        $('#actor_photo_preview').attr('x-file-name', file_name);
        
    });
    
    $("#submit_actor").unbind().click(function(event){
       
        var actor_classification = $("#step-1").attr("x-selected-actor-type");
        
    });
    
    $(".disable").unbind().click(function(event){
        event.preventDefault();
    });
});