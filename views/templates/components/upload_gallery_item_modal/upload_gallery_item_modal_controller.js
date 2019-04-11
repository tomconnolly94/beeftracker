$(function(){
    function get_template_dir(){
        return "gallery_manager";
    }

    function get_template_name(){
        return "gallery_manager";
    }
    
    //init components
    $('#upload_type').select2({
        placeholder: 'Select an Upload Type',
        theme: 'classic',
        width: "100%",
        minimumResultsForSearch: -1
    });

    //array to hold all current gallery items, purely to keep a state outside of the media submit button handler
    let panel_gallery_items = [];

    gallery_item_used_properties = {
        set_as_main_graphic_used: false,
        set_as_cover_image_used: false
    }
    
    //clear all data form modal and reset it to its original state
    function reset_modal(){
        $('#media_preview').attr('src', ""); //reset media preview element        
        $('#media_preview').attr('x-media-type', "");
        $('#media_preview').attr('x-file-name', "");
        $('#set_as_main_graphic_checkbox').prop("checked", false); //reset set as main graphic input checkbox
        $('#set_as_cover_image_checkbox').prop("checked", false); //reset set as cover input checkbox
        
        //hide all input divs in modal
        $("#image_input_div").css("display", "none"); 
        $("#spotify_input_div").css("display", "none");
        $("#youtube_input_div").css("display", "none");
        
        //clear all input text boxes
        $("#youtube_video_link").val("");
        
        var file_input_tag = $('#image_link');
        file_input_tag.wrap('<form>').closest('form').get(0).reset();
        file_input_tag.unwrap();
        
        //hide add button, show update button and attach id to update button
        $("#add_button_div").css("display", "block");
        $("#update_button_div").css("display", "none");
        
        $('#upload_type').val("default").trigger("change"); //reset media type input select box
        
        $('#set_as_main_graphic').css("display", "none"); //hide set as main graphic input div
        $('#set_as_cover_image').css("display", "none"); //hide set as cover input div
        $("#set_as_main_graphic *").attr("disabled", false).off('click');
        $("#set_as_cover_image *").attr("disabled", false).off('click');
        
        //$("#upload_gallery_item_modal").modal("hide"); //hide modal
    }

    function set_gallery_item_property_used(property_name){
        gallery_item_used_properties["set_as_" + property_name + "_used"] = true;
        $("#set_as_" + property_name).css("display", "none"); //hide set as cover checkbox input
    }

    var render_voting_panel = function(gallery_items, callback){

        panel_gallery_items = panel_gallery_items.concat(gallery_items);

        for(var i = 0; i < panel_gallery_items.length; i++){
            var gallery_item = panel_gallery_items[i];

            if(gallery_item.main_graphic){
                set_gallery_item_property_used("main_graphic");
            }
            if(gallery_item.cover_image){
                set_gallery_item_property_used("cover_image");
            }
        }
        
        load_template_render_function(get_template_dir() + "/" + get_template_name(), function(status){
            $("#gallery_manager").html(window["gallery_manager_tmpl_render_func"]({ gallery_items: panel_gallery_items }));
            callback();
        });
    }

    //assign to window so it is accessible to other controllers
    window["upload_gallery_item_modal_controller__render_voting_panel"] = render_voting_panel;
    
    
    function add_or_update_gallery_item(new_gallery_items){
        
        if($("#set_as_main_graphic_checkbox").prop("checked")){
            set_gallery_item_property_used("main_graphic");
        }
        
        if($("#set_as_cover_image_checkbox").prop("checked")){
            set_gallery_item_property_used("cover_image");
        }
        render_voting_panel(new_gallery_items, function(){
            $("#upload_gallery_item_modal").modal("hide"); //hide modal
        });
    }

    //onchange event for when a media type is selected
    $("#upload_type").change(function(event){
        
        //hide all input mediums
        $("#image_input_div").css("display", "none");
        $("#youtube_input_div").css("display", "none");
        $("#spotify_input_div").css("display", "none");
        
        $("#set_as_main_graphic").css("display", "none"); //hide set as cover checkbox input
        $("#set_as_cover_image").css("display", "none"); //hide set as cover checkbox input
        
        let media_type = $("#upload_type").val();
        
        $("#" + media_type + "_input_div").css("display", "block"); //show text input tag
        
        if(gallery_item_used_properties["set_as_main_graphic_used"]){
            $("#set_as_main_graphic *").attr("disabled", "disabled").off('click'); //show main graphic checkbox input
        }
        if(gallery_item_used_properties["set_as_cover_image_used"] && media_type == "image"){
            $("#set_as_cover_image *").attr("disabled", "disabled").off('click'); //show set as cover checkbox input
        }
        
        $("#set_as_main_graphic").css("display", "block"); //show main graphic checkbox input
        $("#set_as_cover_image").css("display", "block"); //show set as cover checkbox input
    });
    
    //handler to handle a image being added to the file input tag
    $("#image_link").change(function() {
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
        
        $("#media_submit_button").removeAttr("disabled"); //enable the "add" button        
    });
    
    //handler to handle a youtube link being added to the file input tag
    $("#youtube_video_link").on('input', function(e) {
        
        var youtube_src = window["youtube_url_translation"].get_youtube_embed_img_src(this.value);

        if(youtube_src.length > 1){
            $("#media_submit_button").removeAttr("disabled"); //enable the "add" button
        }

        $('#media_preview').attr('x-media-type', "youtube_embed");
        $('#media_preview').attr('x-media-link', this.value);
        $('#media_preview').attr('x-file-name', youtube_src);
        $('#media_preview').attr('src', youtube_src);

        $("#media_submit_button").removeAttr("disabled"); //enable the "add" button
    });
    
    //handler to handle a youtube link being added to the file input tag
    $("#spotify_link").on('input', function(e) {
        
        var link;
        
        if(this.value.indexOf("spotify:track") > 0){
            var video_id = this.value.split("track:")[1];
            link = "https://embed.spotify.com/?uri=spotify%3Atrack%3A" + video_id;
        }
        else if(this.value.indexOf("embed") == -1){

            var video_id = this.value.split('track/')[1];
            link = "https://embed.spotify.com/?uri=spotify%3Atrack%3A" + video_id;
        }
        
        
        $('#media_preview').attr('x-media-type', "spotify_embed");
        $('#media_preview').attr('x-media-link', link);
        $('#media_preview').attr('x-file-name', link);
        $('#media_preview').attr('src', "/images/no_preview_available.jpg");
        
        $("#media_submit_button").removeAttr("disabled"); //enable the "add" button
    });
    
    //handler to handle media being officially added to the gallery manager with the "add" button
    $("#media_submit_button").click(function(event){
        event.preventDefault();
                
        add_or_update_gallery_item([{ src: $("#media_preview").attr("src"), media_type: $("#media_preview").attr("x-media-type"), file_name: $("#media_preview").attr("x-file-name"), link: $("#media_preview").attr("x-media-link") , main_graphic: $("#set_as_main_graphic_checkbox").prop("checked"), cover_image:  $("#set_as_cover_image_checkbox").prop("checked") }]);
    });
    
    //handler to update a gallery_item based on the current contents of the modal
    $("#media_update_button").click(function(event){
        event.preventDefault();
        
        //access the gallery item index of the item being edited
        var gallery_item_index = $(this).attr("x-gallery-item-index");
        
        panel_gallery_items[gallery_item_index] = { 
            src: $("#media_preview").attr("src"), 
            media_type: $("#media_preview").attr("x-media-type"), 
            file_name: $("#media_preview").attr("x-file-name"), 
            link: $("#media_preview").attr("x-media-link") , 
            main_graphic: $("#set_as_main_graphic_checkbox").prop("checked"), 
            cover_image:  $("#set_as_cover_image_checkbox").prop("checked") 
        };
        
        add_or_update_gallery_item([]);        
    });
    
    //handler to remove item from gallery manager
    $("#gallery_manager").on("click", "#remove_gallery_item", function(event){
        event.preventDefault();
        event.stopPropagation(); //prevent click listener for element beneath the bin button from firing

        var gallery_item_divs = this.parentElement.parentElement.children;

        for(var i = 1; i < gallery_item_divs.length; i++){
            gallery_item_divs[i].children[1].attributes["x-gallery-item-index"].value = parseInt(gallery_item_divs[i].children[1].attributes["x-gallery-item-index"].value) - 1;
        }
        
        $(this.parentElement).remove();
        
        for(var i = 0; i < panel_gallery_items.length; i++){

            this.parentElement.children[1].attributes["x-gallery-item-index"].value = parseInt(this.parentElement.children[1].attributes["x-gallery-item-index"].value) - 1;

            if(this.parentElement.children[1].attributes[0].value == panel_gallery_items[i].src){
                if(panel_gallery_items[i].main_graphic){
                    gallery_item_used_properties["set_as_main_graphic_used"] = false;
                }
                if(panel_gallery_items[i].cover_image){
                    gallery_item_used_properties["set_as_cover_image_used"] = false;
                }
                panel_gallery_items.splice(i, 1);
                i--;
            }
        }
    });
    
    //handler to re-open modal with data loaded if user clicks on a gallery item
    $("#gallery_manager").on("click", ".gallery-manager-item", function(event){
        event.preventDefault();
        
        let media_type = $(this).children("img").attr("x-media-type");
        
        /*gallery_item_used_properties["set_as_main_graphic_used"] = false;
        gallery_item_used_properties["set_as_cover_image_used"] = false;*/
        //set modal fields
        $("#upload_gallery_item_modal").modal("show"); //show modal
        $("#media_preview").attr("src", $(this).children("img").attr("src"));
        $("#media_preview").attr("x-media-type", media_type);
        $("#media_preview").attr("x-file-name", $(this).children("img").attr("x-file-name"));
        $("#media_preview").attr("x-media-link", $(this).children("img").attr("x-media-link"));
        //set upload type select2 val
        $("#upload_type").val(media_type).trigger("change");
                
        $("#set_as_main_graphic_checkbox").prop("checked", $(this).children("img").attr("x-main-graphic") == "x-main-graphic" ? true : false);
        $("#set_as_main_graphic").css("display", "block");// $(this).children("img").attr("x-main-graphic") == "x-main-graphic" ? "block" : "none");
        $("#set_as_cover_image_checkbox").prop("checked", $(this).children("img").attr("x-cover-image") == "x-cover-image" ? true : false);
        $("#set_as_cover_image").css("display", "block");// $(this).children("img").attr("x-cover-image") == "x-cover-image" ? "block" : "none");
        
        if( $(this).children("img").attr("x-main-graphic") == "x-main-graphic" || !gallery_item_used_properties["set_as_main_graphic_used"]){
            $("#set_as_main_graphic *").attr("disabled", false).off('click'); //show main graphic checkbox input
        }
        if($(this).children("img").attr("x-cover-image") == "x-cover-image" || !gallery_item_used_properties["set_as_cover_image_used"]){
            $("#set_as_cover_image *").attr("disabled", false).off('click'); //show set as cover checkbox input
        }
        
        //hide add button, show update button and attach id to update button
        $("#add_button_div").css("display", "none");
        $("#update_button_div").css("display", "block");
        
        //assign gallery_item array index to update button for use later
        $("#media_update_button").attr("x-gallery-item-index", $($($(this)[0]).find("img")[0]).attr("x-gallery-item-index"));
        
    });
        
    $('#upload_gallery_item_modal').on('hidden.bs.modal', function () {
        //whenever modal is closed, on purpose or via losing focus, reset all fields
        reset_modal();
    });
    

    //code to scan which gallery items are loaded into the page already and update the javascript
    var preloaded_gallery_items = $("#gallery_manager div img");

    for(var i = 0; i < preloaded_gallery_items.length; i++){

        var gallery_item = preloaded_gallery_items[i];
        
        var main_graphic_attr = $(gallery_item).attr('x-main-graphic');
        var cover_image_attr = $(gallery_item).attr('x-cover-image');

        panel_gallery_items.push({ 
            src: $(gallery_item).attr("src"), 
            media_type: $(gallery_item).attr("x-media-type"), 
            file_name: $(gallery_item).attr("x-file-name"), 
            link: $(gallery_item).attr("x-media-link") , 
            main_graphic: typeof main_graphic_attr !== typeof undefined && main_graphic_attr !== false ? true : false, 
            cover_image: typeof cover_image_attr !== typeof undefined && cover_image_attr !== false ? true : false 
        });

        gallery_item_used_properties.set_as_main_graphic_used = typeof main_graphic_attr !== typeof undefined && main_graphic_attr !== false ? true : false;
        gallery_item_used_properties.set_as_cover_image_used = typeof cover_image_attr !== typeof undefined && cover_image_attr !== false ? true : false;
    }
});