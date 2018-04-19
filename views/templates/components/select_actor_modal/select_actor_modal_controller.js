$(function(){
    
    $("#select_actor_beefer").click(function(event){
        $("#selector_actor_modal").attr("x-current-actor", "beefer");
    });
    
    $("#select_actor_beefee").click(function(event){
        $("#selector_actor_modal").attr("x-current-actor", "beefee");
    });
        
    //function to take data from the select actor modal and assign it to the DOM
    $("#select_actor_modal_submit").click(function(){
        
        var actor_type = $("#selector_actor_modal").attr("x-current-actor");
        var image_link = $("#select_actor").select2().find(":selected").attr("x-actor-image-link");
        var actor_name = $("#select_actor").select2().find(":selected").attr("x-actor-name");
        
        //assign data 
        //$("#select_actor_" + actor_type).css("background-image", "url(" + image_link + ")");
        $("#select_actor_" + actor_type + " img").attr("src", image_link);
        $("#select_actor_" + actor_type + " img").css("display", "block");
        $("#select_actor_" + actor_type + " i").hide();
        $("#" + actor_type + "_name").text(actor_name);
        
        //$('#select_actor').val(null).trigger('change');
        $('#select_actor').eq(0).prop('selected',true);
        $("#selector_actor_modal").modal("hide");
        $(".select2-search__field").attr("tabindex", "1");
    });

});