$(function(){
    
    function execute_endpoint_call(vote_direction){
        
        var event_id = window.location.pathname.split("/").pop();
        var success_html = "<h3> Thanks for voting!</h3><p> Why not <a href='/register'> Create an Account </a> now!";
        
        $.ajax({
            url: "/api/votes/events",
            type: "PUT",
            data: { vote_direction: vote_direction, event_id: event_id },
            success: function(result) {
                console.log("upvote complete");
                fade_new_content_to_div("#voting_panel", success_html);
                append_or_create_cookie("voted_on_beef_ids", event_id);
            }
        });
    }
    
    $("#thumbs_up_vote").click(function(event){
        event.preventDefault();
        console.log("thumbs up");
        execute_endpoint_call(1);
    });
    
    $("#thumbs_down_vote").click(function(event){
        event.preventDefault();        
        console.log("thumbs down");
        execute_endpoint_call(0);
    });
    
});