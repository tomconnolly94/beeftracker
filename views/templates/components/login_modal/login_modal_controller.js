$(function(){
    
    //$("#login_form").unbind().submit(function(event){
    $("#login_button").unbind().click(function(event){
        event.preventDefault();
        
        var username = $("#login_username").val();
        var password = $("#login_password").val();
        var original_url = window.location.href;
        
        $.ajax({
            url: "/api/authenticate",
            type: "POST",
            data: { username: username, password: password, requires_admin: false },
            success: function(result) {
                window.location.href = original_url;
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