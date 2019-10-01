function write_list_to_display(display_id, list){

    var template_dir = "add_list";
    var template_name = "add_list_display";

    load_template_render_function(template_dir + "/" + template_name, function(status){
        fade_new_content_to_div("#" + display_id, window[template_name + "_tmpl_render_func"]({ list_items: list, display_id: display_id }))

        $("#add_list_input_" + display_id).val(""); //clear text input box
    });
}

window.register_add_list_controllers = function(){
    $(".add_list_item_button").each(function(index){

        $(this).unbind().on("click", function(event){
            event.preventDefault();
            
            var display_id = $(this).attr("x-display-id"); //get the id if the display of this componenet, needed in case componenet is used twice on the same page
            var new_list_item = $("#add_list_input_" + display_id).val(); //get list item from text input
            var existing_list_items = $("#" + display_id).children("li").map(function() { return $(this).text();}) //get exisitng list items and map their values to an array
            
            if(new_list_item && new_list_item.length > 0){
                existing_list_items.push(new_list_item); //add new source to global array

                write_list_to_display(display_id, existing_list_items);
            }
        });

    });
    
    $(".add_list").each(function(index){
        $(this).unbind().on("click", ".remove-list-item", function(event){
            event.preventDefault();
            $(this.parentElement.parentElement).remove();
        });
    });
}

$(function(){
    window.register_add_list_controllers();
});