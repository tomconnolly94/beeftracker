$(function(){
    
    $("#select_actor_beefer").click(function(event){
        $("#selector_actor_modal").attr("x-current-actor", "beefer");
    });
    
    $("#select_actor_beefee").click(function(event){
        $("#selector_actor_modal").attr("x-current-actor", "beefee");
    });
        
    //function to take data from the select actor modal and assign it to the DOM
    $("#select_actor_modal_submit").click(function(){
        
        //access data from modal
        var actor_type = $("#selector_actor_modal").attr("x-current-actor");
        var image_link = $("#select_actor").select2().find(":selected").attr("x-actor-image-link");
        var actor_name = $("#select_actor").select2().find(":selected").attr("x-actor-name");
        var actor_id = $("#select_actor").select2().find(":selected").attr("x-actor-id");
        
        //assign data
        $("#select_actor_" + actor_type + " img").attr("src", image_link); //set preview image src
        $("#select_actor_" + actor_type + " img").css("display", "block"); //show img tag
        $("#select_actor_" + actor_type + " i").hide(); //hide + icon
        $("#" + actor_type + "_name").text(actor_name); //insert actor name above preview
        $("#" + actor_type + "_name").attr("x-actor-id", actor_id); //save actor_id to x- attribute for use later
        
        $('#select_actor').val("default").trigger("change"); //reset actor input select box
        $("#selector_actor_modal").modal("hide"); //hide modal
        //$(".select2-search__field").attr("tabindex", "1");
    });

});