$(function(){
    
    var aggressors = [];
    var targets = [];
    var template_dir = "versus_panel";
    var template_name = "versus_panel";
    var file_server_url_prefix = $("#file_server_url_prefix_store").attr("value"); //extract file server url prefix from hidden div
    
    function assign_click_listeners(){

        $(".select_actor_beefer").click(function(event){
            $("#selector_actor_modal").attr("x-current-actor", "beefer");
        });

        $(".select_actor_beefee").click(function(event){
            $("#selector_actor_modal").attr("x-current-actor", "beefee");
        });
        
        $(".remove_actor").unbind().click(function(){
             console.log($(this));
             console.log(aggressors);
            
            for(var i = 0; i < aggressors.length; i++){
                if(aggressors[i].id == $(this).parent().children("h4").attr("x-actor-id")){
                    aggressors.splice(i, 1);
                }
            }
            
            for(var i = 0; i < targets.length; i++){
                if(targets[i].id == $(this).parent().children("h4").attr("x-actor-id")){
                    targets.splice(i, 1);
                }
            }
            
            
            load_template_render_function(template_dir + "/" + template_name, function(status){
                fade_new_content_to_div("#versus_panel", window[template_name + "_tmpl_render_func"]({ file_server_url_prefix: file_server_url_prefix, aggressors: aggressors, targets: targets }), function(){
                    assign_click_listeners();
                });

            });
        });
    }
    
    assign_click_listeners();
    
    //function to take data from the select actor modal and assign it to the DOM
    $("#select_actor_modal_submit").click(function(){
        
        //access data from modal
        var actor_type = $("#selector_actor_modal").attr("x-current-actor");
        var image_link = $("#select_actor").select2().find(":selected").attr("x-actor-image-link");
        var actor_name = $("#select_actor").select2().find(":selected").attr("x-actor-name");
        var actor_id = $("#select_actor").select2().find(":selected").attr("x-actor-id");
        
        /*
        //assign data
        $("#select_actor_" + actor_type + " img").attr("src", image_link); //set preview image src
        $("#select_actor_" + actor_type + " img").css("display", "block"); //show img tag
        $("#select_actor_" + actor_type + " i").hide(); //hide + icon
        $("#" + actor_type + "_name").text(actor_name); //insert actor name above preview
        $("#" + actor_type + "_name").attr("x-actor-id", actor_id); //save actor_id to x- attribute for use later
        */
        var new_actor_record = {
            src: image_link,
            name: actor_name,
            id: actor_id
        };
        
        if(actor_type == "beefer"){
            aggressors.push(new_actor_record);
        }
        else if(actor_type == "beefee"){
            targets.push(new_actor_record);
        }
        
        load_template_render_function(template_dir + "/" + template_name, function(status){
            fade_new_content_to_div("#versus_panel", window[template_name + "_tmpl_render_func"]({ file_server_url_prefix: file_server_url_prefix, aggressors: aggressors, targets: targets }), function(){
                assign_click_listeners();
            });
            
        });
        
        $('#select_actor').val("default").trigger("change"); //reset actor input select box
        $("#selector_actor_modal").modal("hide"); //hide modal
    });
});