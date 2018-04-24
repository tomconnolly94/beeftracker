$(function(){
    
    //array to hold all current gallery items, purely to keep a state outside of the media submit button handler
    let gallery_items = [];
    
    //clear all data from modal and reset it to its original state
    function reset_modal(){
        $('#media_preview').attr('src', "");
        
        $("#photo_input_div").css("display", "none");
        $("#soundcloud_input_div").css("display", "none");
        $("#youtube_input_div").css("display", "none");
        
        //$('#upload_type').select2("val", "Select Type");
        $('#upload_type').select2().val(null);
        //$('#upload_type').select2('data', null)
        $("#upload_gallery_item_modal").modal("hide");
    }
    
    //onchange event for when a media type is selected
    $("#upload_type").change(function(event){
        
        //hide all input mediums
        $("#photo_input_div").css("display", "none");
        $("#soundcloud_input_div").css("display", "none");
        $("#youtube_input_div").css("display", "none");
        
        let media_type = $("#upload_type").select2().find(":selected").val();
        
        $("#" + media_type + "_input_div").css("display", "block");
        $("#set_as_cover").css("display", "block");
        $("#media_submit_button").removeAttr("disabled");
        
        //$('#upload_type').val(null).trigger('change');
    });
    
    //function to handle a photo being added to the file input tag
    $("#photo_link").change(function() {
        let input = this;
        
        if (input.files && input.files[0]) {
            let reader = new FileReader();

            reader.onload = function(e) {
                $('#media_preview').attr('src', e.target.result);
            }
            reader.readAsDataURL(input.files[0]);
        }
    });
    
    //function to handle a youtube link being added to the file input tag
    $("#youtube_video_link").on('input', function(e) {
        
        let youtube_id = this.value.split("watch?v=")[1];
        let youtube_src = "https://img.youtube.com/vi/" + youtube_id + "/0.jpg";
        
        $('#media_preview').attr('src', youtube_src);
    });
    
    //function to handle media being officially added to the gallery manager with the "add" button
    $("#media_submit_button").click(function(event){
        event.preventDefault();
        
        gallery_items.push({ url: $("#media_preview").attr("src") });
        
        load_template_render_function("gallery_manager/gallery_manager", function(status){
            $("#gallery_manager").html(window["gallery_manager_tmpl_render_func"]({ gallery_items: gallery_items }));

            //clear and close modal
            reset_modal();
        });
    });
    
    //function to remove item from gallery manager
    $("#gallery_manager").on("click", "#remove_gallery_item", function(event){
        event.preventDefault();
        $(this.parentElement).remove();
        for(var i = 0; i < gallery_items.length; i++){
            if(this.parentElement.children[1].attributes[0].value == gallery_items[i].url){
                gallery_items.splice(i, 1);
                i--;
            }
        }
    });
});