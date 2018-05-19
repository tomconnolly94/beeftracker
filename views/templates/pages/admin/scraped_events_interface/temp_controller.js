$(function(){
    $(".delete_button").unbind().click(function(){
        var id_array_to_delete = [];
        
        //get array of checkboxes
        var checkboxes = $("input[type=checkbox]")
        
        
        
        $.ajax({
            url: "/api/scraped_data/events/",
            data: id_array_to_delete,
            processData: false,
            contentType: "application/json",
            type: 'DELETE',
            success: function(data){
                location.reload();
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) { 
                console.log(errorThrown);
            }
        });
    });
});