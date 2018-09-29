$(function(){
    
        
    //take any validation error messgages and display them to the error panel
    function render_login_modal_error_messages(error_messages){

        var template_dir = "error_panel";
        var template_name = "error_panel";

        load_template_render_function(template_dir + "/" + template_name, function(status){
            fade_new_content_to_div("#login_error_panel", window[template_name + "_tmpl_render_func"]({ errors: error_messages }));
        });
    }
    
    //$("#login_form").unbind().submit(function(event){
    $(".login_button").unbind().click(function(event){
        event.preventDefault();
        
        var form_id = $(this).attr("x-form-id")
        
        var username = $(".login_username[x-form-id='" + form_id + "']").val();
        var password = $(".login_password[x-form-id='" + form_id + "']").val();
        var original_url = window.location.href;
        
        $.ajax({
            url: "/api/auth/local/authenticate",
            type: "POST",
            data: { username: username, password: password, requires_admin: false },
            success: function(result) {
                
                //check for a redirect path
                var query_params = original_url.split("?")[1] && original_url.split("?")[1].length > 0 ? original_url.split("?")[1] : null;
                var first_path_stage = window.location.pathname.split("/")[0] && original_url.split("/")[0].length > 0 ? original_url.split("/")[0] : null;
                    
                if(query_params){
                    var query_split = query_params.split("=");
                    if(query_split[0] == "redirected_from"){
                        window.location.href = query_split[1];
                    }
                    else{
                        window.location.href = "/profile";
                    }
                }
                else if(first_path_stage != "login"){
                    window.location.href = window.location.pathname;
                }
                else{
                    window.location.href = "/profile";
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {

                if(XMLHttpRequest.status != 200){
                
                    if(XMLHttpRequest && XMLHttpRequest.responseJSON){
                    
                        if(XMLHttpRequest.responseJSON.stage == "server_validation"){

                            var errors = XMLHttpRequest.responseJSON.details.map(function(item){
                                return {
                                    location: item.param,
                                    problem: item.msg
                                }
                            });

                            render_login_modal_error_messages(errors);
                        }
                        else if(XMLHttpRequest.responseJSON.stage == "authentication"){
                            render_login_modal_error_messages(XMLHttpRequest.responseJSON.details);
                        }
                    }
                    else{
                        console.log("URGENT SERVER ERROR.", XMLHttpRequest.statusText);
                    }
                }
            }
        });
    });
    
    $("#logout_button").unbind().click(function(event){
        event.preventDefault();
        
        var original_url = window.location.href;
                
        $.ajax({
            url: "/api/auth/local/deauthenticate",
            type: "GET",
            success: function(result) {
                window.location.href = "/";
            }
        });
    });
});