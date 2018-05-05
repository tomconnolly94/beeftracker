$(function(){
    
    //array to hold all current gallery items, purely to keep a state outside of the media submit button handler
    let gallery_items = [];
    let set_as_main_graphic_used = false;
    let set_as_cover_image_used = false;
    
    //clear all data from modal and reset it to its original state
    function reset_modal(){
        $('#media_preview').attr('src', ""); //reset media preview element        
        $('#media_preview').attr('x-media-type', "");
        $('#media_preview').attr('x-file-name', "");
        $('#set_as_main_graphic_checkbox').prop("checked", false); //reset set as main graphic input checkbox
        $('#set_as_cover_image_checkbox').prop("checked", false); //reset set as cover input checkbox
        
        $('#set_as_main_graphic').css("display", "none"); //hide set as main graphic input div
        $('#set_as_cover_image').css("display", "none"); //hide set as cover input div
        
        //hide all input divs in modal
        $("#photo_input_div").css("display", "none"); 
        $("#soundcloud_input_div").css("display", "none");
        $("#youtube_input_div").css("display", "none");
        
        //clear all input text boxes
        $("#youtube_video_link").val("");
        
        var file_input_tag = $('#photo_link');
        file_input_tag.wrap('<form>').closest('form').get(0).reset();
        file_input_tag.unwrap();
        
        $('#upload_type').val("default").trigger("change"); //reset media type input select box
        $("#upload_gallery_item_modal").modal("hide"); //hide modal
    }
    
    //onchange event for when a media type is selected
    $("#upload_type").change(function(event){
        
        //hide all input mediums
        $("#photo_input_div").css("display", "none");
        $("#soundcloud_input_div").css("display", "none");
        $("#youtube_input_div").css("display", "none");
        
        let media_type = $("#upload_type").val();
        
        $("#" + media_type + "_input_div").css("display", "block"); //show text input tag
        if(!set_as_main_graphic_used){
            $("#set_as_main_graphic").css("display", "block"); //show set as cover checkbox input
        }
        if(!set_as_cover_image_used){
            $("#set_as_cover_image").css("display", "block"); //show set as cover checkbox input
        }
        $("#media_submit_button").removeAttr("disabled"); //enable the "add" button
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
        
        var file_name = input.files[0].name;
        
        $('#media_preview').attr('x-media-type', "image");
        $('#media_preview').attr('x-media-link', file_name);
        $('#media_preview').attr('x-file-name', file_name);
        var file_name = $(this).val().split("\\").pop();
        
    });
    
    //function to handle a youtube link being added to the file input tag
    $("#youtube_video_link").on('input', function(e) {
        
        let youtube_id = this.value.split("watch?v=")[1];
        let youtube_src = "https://img.youtube.com/vi/" + youtube_id + "/0.jpg";
        
        $('#media_preview').attr('x-media-type', "youtube_embed");
        $('#media_preview').attr('x-media-link', this.value);
        $('#media_preview').attr('x-file-name', youtube_src);
        $('#media_preview').attr('src', youtube_src);
    });
    
    //function to handle media being officially added to the gallery manager with the "add" button
    $("#media_submit_button").click(function(event){
        event.preventDefault();
        
        gallery_items.push({ src: $("#media_preview").attr("src"), media_type: $("#media_preview").attr("x-media-type"), file_name: $("#media_preview").attr("x-file-name"), link: $("#media_preview").attr("x-media-link") , main_graphic: $("#set_as_main_graphic_checkbox").prop("checked"), cover_image:  $("#set_as_cover_image_checkbox").prop("checked") });
        
        if($("#set_as_main_graphic_checkbox").prop("checked")){
            set_as_main_graphic_used = true;
            $("#set_as_main_graphic").css("display", "none"); //hide set as cover checkbox input
        }
        
        if($("#set_as_cover_image_checkbox").prop("checked")){
            set_as_cover_image_used = true;
            $("#set_as_cover_image").css("display", "none"); //hide set as cover checkbox input
        }
        
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
            if(this.parentElement.children[1].attributes[0].value == gallery_items[i].src){
                if(gallery_items[i].main_graphic){
                    set_as_main_graphic_used = false;
                }
                if(gallery_items[i].cover_image){
                    set_as_main_graphic_used = false;
                }
                gallery_items.splice(i, 1);
                i--;
            }
        }
    });
});