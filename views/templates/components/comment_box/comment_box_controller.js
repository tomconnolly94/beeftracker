$(function(){
   
    $("#submit_comment") .unbind().click(function(event){
       event.preventDefault();

        var comment_text = $("#comment_text_area").val();
        var user_id = $("#user_img").attr("x-user-id");
        var content_classification = $("#user_img").attr("x-content-type");
        var event_id;
        var beef_chain_id;
        var actor_id;
        var file_server_url_prefix = $("#file_server_url_prefix_store").attr("value"); //extract file server url prefix from hidden div
        var browser = $("#browser").attr("value"); //extract browser type from hidden div
        
        if(content_classification == "event"){
            event_id = window.location.pathname.split("/")[3];
            beef_chain_id = window.location.pathname.split("/")[2];
        }
        else if(content_classification == "actor"){
            actor_id = window.location.pathname.split("/")[2];
        }
        
        var comment_data = {
            text: comment_text,
            user: user_id,
            event_id: event_id,
            actor_id: actor_id,
            beef_chain_id: beef_chain_id
        };

        $.ajax({
            url: "/api/comments",
            data: comment_data,
            type: 'POST',
            success: function(data){
                
                var template_dir = "comment_box";
                var template_name = "comment_box_display";
                
                $.get("/api/comments/beef_chains/" + beef_chain_id, {}, function(comments){
                    
                    console.log(comments);
                    
                    load_template_render_function(template_dir + "/" + template_name, function(status){
                        fade_new_content_to_div("#comment_box_display", window[template_name + "_tmpl_render_func"]({ file_server_url_prefix: file_server_url_prefix, browser: browser, comments: comments }));
                        $("#comment_text_area").val("");
                    });
                });
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) { 
                console.log(errorThrown);
            }
        });
    });
});