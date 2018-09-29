$(function(event){
    
    //take any validation error messgages and display them to the error panel
    function render_register_modal_error_messages(error_messages){

        var template_dir = "error_panel";
        var template_name = "error_panel";

        load_template_render_function(template_dir + "/" + template_name, function(status){
            fade_new_content_to_div("#register_error_panel", window[template_name + "_tmpl_render_func"]({ errors: error_messages }));
        });
    }
    
    $("#register_submit").unbind().click(function(event){
        event.preventDefault();
        
        //access input fields
        var register_username = $("#register_username").val();
        var register_first_name = $("#register_first_name").val();
        var register_last_name = $("#register_last_name").val();
        var register_email = $("#register_email").val();
        var register_password = $("#register_password").val();
        var register_d_o_b = $("#register_d_o_b").val().split("-");
        
        $.ajax({
            url: "/api/users",
            type: "POST",
            data: { 
                username: register_username,
                first_name: register_first_name,
                last_name: register_last_name,
                password: register_password,
                email_address: register_email,
                d_o_b: register_d_o_b[2] + "/" + register_d_o_b[1] + "/" + register_d_o_b[0],
                requires_admin: false 
            },
            success: function(register_result) {
                
                
                $.ajax({
                    url: "/api/auth/local/authenticate",
                    type: "POST",
                    data: { 
                        username: register_username,
                        password: register_password,
                        requires_admin: false 
                    },
                    success: function(auth_result) {
                        window.location.href = "/profile";
                    },
                    error: function(err){
                        console.log("Authentication error, please try again.", err);
                    }
                });
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

                            render_register_modal_error_messages(errors);
                        }
                        else if(XMLHttpRequest.responseJSON.stage == "controller_function"){
                            render_register_modal_error_messages(XMLHttpRequest.responseJSON.details);
                        }
                    }
                    else{
                        console.log("URGENT SERVER ERROR.", XMLHttpRequest.statusText);
                    }
                }
            }
        });
    })
});