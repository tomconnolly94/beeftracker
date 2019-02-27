$(function(){
    $("#contact_request_form").unbind().submit(function(event){
        event.preventDefault();
        
        var name = $("#fullname").val();
        var email_address = $("#email").val();
        var subject = $("#subject").val();
        var message = $("#message").val();
        
        var contact_request = {
            name: name,
            email_address: email_address,
            subject: subject,
            message: message
        }
        
        var form_data = new FormData();
        form_data.append("data", JSON.stringify(contact_request));
        
        $.ajax({
            url: "/api/contact-requests",
            //data: form_data,
            data: contact_request,
            //processData: false,
            //contentType: false,
            type: 'POST',
            success: function(data){
                var fade_speed = 100;

                $("#contact_request_form").fadeOut(fade_speed, function(){
                    $("#contact_request_form").html("<div style='text-align: center;'><h3> Message recieved </h3> <h5> Thankyou for your feedback. </h5></div>");
                    $("#contact_request_form").fadeIn(fade_speed);
                });
            }
        });
    }); 
});