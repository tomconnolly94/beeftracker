
$(function() {
	$('#smartwizard').smartWizard({
		theme: 'circles',
		cycleSteps: true,
		keyNavigation: false,
		toolbarSettings: {
			showNextButton: false,
			showPreviousButton: false,
		},
		anchorSettings: {
			//-anchorClickable: true,
			enableAllAnchors: true
		}
	});

	var next = 1;
	$(".add-more").click(function(e){
		e.preventDefault();
		var addto = "#field" + next;
		var addRemove = "#field" + (next);
		next = next + 1;
		var newIn = '<input autocomplete="off" class="input form-control" id="field' + next + '" name="field' + next + '" type="text">';
		var newInput = $(newIn);
		var removeBtn = '<button id="remove' + (next - 1) + '" class="btn btn-danger remove-me" >-</button></div><div id="field">';
		var removeButton = $(removeBtn);
		$(addto).after(newInput);
		$(addRemove).after(removeButton);
		$("#field" + next).attr('data-source',$(addto).attr('data-source'));
		$("#count").val(next);

		$('.remove-me').click(function(e){
			e.preventDefault();
			var fieldNum = this.id.charAt(this.id.length-1);
			var fieldID = "#field" + fieldNum;
			$(this).remove();
			$(fieldID).remove();
		});
	});

	//Associated Actors
	function formatState (state) {
		if (!state.id) {
			return state.text;
		}
		var $state = $(
			'<span><img style="width: 48px; border-radius: 48px" src="'+state.element.getAttribute('image_src') + '" class="img-flag" /> ' + state.text + '</span>'
		);
		return $state;
	};

	$(".associated-actors-select").select2({
		templateResult: formatState,
		theme: 'classic',
		width: "100%"
	});
});

//function to be run after actor is submitted successfully
var post_submit_actor_callback = function(){};

var load_data_into_add_actor_modal = function(scraped_actor_data, field_data_dump, callback){

    $("#actor_name").val(scraped_actor_data.stage_name);
    $("#actor_photo_preview").attr("src", scraped_actor_data.img_title);
    $("#actor_photo_preview").attr("x-media-link", scraped_actor_data.img_title);
    $("#actor_photo_preview").attr("x-file-name", scraped_actor_data.img_title);
    
    $("#actor_bio").val(scraped_actor_data.bio);
    
    $("#add_list_input_add_actor_modal_data_sources").val(scraped_actor_data.data_source);
    $("#add_actor_modal_data_sources_add_button").trigger("click");
    
    var title = $('<div class="row col-md-12"><h3> Data Dump </h3></div>');
    $("#actor_data_dump").append(title);
    
    var field_data_dump_keys = Object.keys(field_data_dump);
    
    for(var i = 0; i < field_data_dump_keys.length; i++){
        //create row of 
        var row = $('<div class="row col-md-12"><div class="col-md-4"> <h4>' + field_data_dump_keys[i] + '</h4></div><div class="col-md-8"><textarea style="width:100%;">' + field_data_dump[field_data_dump_keys[i]] + '</textarea></div></div>');
        
        $("#actor_data_dump").append(row);
    }
    post_submit_actor_callback = callback;
}
    
$(function(){
    
    //handle user selecting an actor classification
    $(".actor-type-item").unbind().click(function(event){
        
        var id = $(this).attr("id");
        $(this).parent().parent().parent().attr("x-selected-actor-type", id);
        
        var div_list = $(this).parent().parent().children();
        
        //remove active class from all divs
        for(var i = 0; i < div_list.length; i++){
            $(div_list[i]).children("a").removeClass("active");        
        }
        
        $(this).addClass("active"); //add active class to seelcted option
        
        var template_dir = "add_actor_modal";
        var template_name = "add-actor-variable-field-panel";
        var file_server_url_prefix = $("#file_server_url_prefix_store").attr("value"); //extract file server url prefix from hidden div
        var browser = $("#browser").attr("value"); //extract file server url prefix from hidden div
        
        $.get("/api/actor-variable-fields-config", {}, function(data){
            load_template_render_function(template_dir + "/" + template_name, function(status){
                fade_new_content_to_div("#variable_fields_panel", window[template_name + "_tmpl_render_func"]({ file_server_url_prefix: file_server_url_prefix, browser: browser, variable_fields: data, active_classification: id }))
            });
        });
        
        //un-disable step2 modal page
        $("#step_2_anchor").removeClass("disabled_anchor");
        $("#step_3_anchor").removeClass("disabled_anchor");
        //window.location.hash = "step-2";
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
        
        $('#actor_photo_preview').attr('x-media-link', file_name);
        $('#actor_photo_preview').attr('x-file-name', file_name);
        
    });
        
    $(".disable").unbind().click(function(event){
        event.preventDefault();
    });     
});