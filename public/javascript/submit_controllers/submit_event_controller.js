$(function(){
    
    $("#submit_new_event_button").click(function(event){
        event.preventDefault();
        console.log(this);
        
        
        //get form contents
        var title = $("#beef_title").val();
        var date = $("#beef_date").val();
        var aggressor = $("#beefer_name").attr("x-actor-id");
        var target = $("#beefee_name").attr("x-actor-id");
        var category = $("#beef_category").select2().find(":selected").val();
        var tags = $("#beef_tags").select2().val();
        var description = $("#beef_content_summernote").val();
        
        console.log(title);
        console.log(date);
        console.log(aggressor);
        console.log(target);
        console.log(category);
        console.log(tags);
        console.log(description);
    }); 
});