$(function(){
    
    //$("#login_form").unbind().submit(function(event){
    $(".login_button").unbind().click(function(event){
        event.preventDefault();
        
        var form_id = $(this).attr("x-form-id")
        
        var username = $(".login_username[x-form-id='" + form_id + "']").val();
        var password = $(".login_password[x-form-id='" + form_id + "']").val();
        var original_url = window.location.href;
        
        $.ajax({
            url: "/api/authenticate",
            type: "POST",
            data: { username: username, password: password, requires_admin: false },
            success: function(result) {
                
                //check for a redirect path
                var query_params = original_url.split("?")[1].length > 0 ? original_url.split("?")[1] : null;
                    
                if(query_params){
                    var query_split = query_params.split("=");
                    if(query_split[0] == "redirected_from"){
                        window.location.href = query_split[1];
                    }
                    else{
                        window.location.href = "/profile";
                    }
                }
                else{
                    window.location.href = "/profile";
                }
            }
        });
    });
    
    $("#logout_button").unbind().click(function(event){
        event.preventDefault();
        
        var original_url = window.location.href;
                
        $.ajax({
            url: "/api/deauthenticate",
            type: "GET",
            success: function(result) {
                window.location.href = "/";
            }
        });
    });
});