$(function(){
    
    $("#change_user_image").unbind().change(function(event){
        event.preventDefault()
        
        var gallery_items = [];
        var form_data = new FormData();

        var gallery_item_formatted = {
            file: null,
            media_type: "image",
            link: $(this)[0].files[0].name,
            main_graphic: true,
        }

        form_data.append(gallery_item_formatted.link, $(this)[0].files[0]);
        form_data.append("data", JSON.stringify(gallery_item_formatted));

        var user_id = $("#user_id").text();
        
        $.ajax({
            url: "/api/users/" + user_id + "/image",
            data: form_data,
            processData: false,
            contentType: false,
            type: 'PUT',
            success: function(data){
                location.reload();
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) { 
                console.log(errorThrown);
            }
        });
    });
});