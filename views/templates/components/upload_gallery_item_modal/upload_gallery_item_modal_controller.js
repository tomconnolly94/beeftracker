$(function(){
    
    var gallery_items = [];
    
    function read_url(input) {

        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function(e) {
                $('#media_preview').attr('src', e.target.result);
            }

            reader.readAsDataURL(input.files[0]);
        }
    }

    function reset_modal(){
        $('#media_preview').attr('src', "");
        
        $("#photo_input_div").css("display", "none");
        $("#soundcloud_input_div").css("display", "none");
        $("#youtube_input_div").css("display", "none");
        
        $('#upload_type').select2("val", null);
        //$('#upload_type').select2('data', null)
        $("#upload_gallery_item_modal").modal("hide");
    }
    
    $("#upload_type").change(function(event){
        
        //hide all input mediums
        $("#photo_input_div").css("display", "none");
        $("#soundcloud_input_div").css("display", "none");
        $("#youtube_input_div").css("display", "none");
        
        var media_type = $("#upload_type").select2()/*.find(":selected")*/.val();
        
        console.log(media_type);
        console.log(media_type + "_input_div");
        
        $("#" + media_type + "_input_div").css("display", "block");
        $("#set_as_cover").css("display", "block");
        $("#media_submit_button").removeAttr("disabled");
        
        //$('#upload_type').val(null).trigger('change');
    });
    
    $("#photo_link").change(function() {
        read_url(this);
    });
    
    $("#media_submit_button").click(function(event){
        event.preventDefault();
        
        gallery_items.push({ url: $("#media_preview").attr("src") })
        console.log(gallery_items);
        
        $.getScript("/template_functions/gallery_manager", function(data, status, jqxhr){
            var html = window["gallery_manager_tmpl_func"]({ gallery_items: [ { url: "https://static.independent.co.uk/s3fs-public/thumbnails/image/2017/12/29/15/wiley-2.jpg"} ] });
            
            $("#gallery_manager").html(window["gallery_manager_tmpl_func"]({ gallery_items: gallery_items }));
            
            //clear and close modal
            reset_modal();
        });
    });
});