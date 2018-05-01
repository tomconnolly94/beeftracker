$(function(){
    
    $("#login_form").unbind().submit(function(event){
        var username = $("#login_username").val();
        var password = $("#login_password").val();
        
        
        $.ajax({
            url: "/api/authenticate",
            type: "POST",
            data: { username: username, password: password },
            success: function(result) {
                console.log("login complete.");
            }
        });
    });
});