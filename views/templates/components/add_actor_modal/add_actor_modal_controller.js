$(function(){
    
    $(".actor-type-item").unbind().click(function(event){
        
        var id = $(this).attr("id");
        $(this).parent().parent().parent().attr("x-selected-actor-type", id);
        
        //$("#step_2_button").attr("href", "#step-2");
        //$("#step_3_button").attr("href", "#step-2");
        
    });
    
    //function to handle a image being added to the file input tag
    $("#actor_photo").change(function() {
        let input = this;
        
        if (input.files && input.files[0]) {
            let reader = new FileReader();

            reader.onload = function(e) {
                $('#actor_photo_preview').attr('src', e.target.result);
            }
            reader.readAsDataURL(input.files[0]);
        }
        
        var file_name = input.files[0].name;
        
        $('#media_preview').attr('x-media-link', file_name);
        $('#media_preview').attr('x-file-name', file_name);
        
    });
    
    $("#submit_actor").unbind().click(function(event){
       
        var actor_classification = $("#step-1").attr("x-selected-actor-type");
        
    });
    
    $(".disable").unbind().click(function(event){
        event.preventDefault();
    });
});