$(function(event){
    
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
                    url: "/api/authenticate",
                    type: "POST",
                    data: { 
                        username: register_username,
                        password: register_password,
                        requires_admin: false 
                    },
                    success: function(auth_result) {
                        window.location.href = "/user/" + register_result.user_id;
                    }
                });
            }
        });
    })
});