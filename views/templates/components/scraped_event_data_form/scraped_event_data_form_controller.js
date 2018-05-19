$(function(){
    
    //delete the eent of which the button was clicked, plus any events with their checkboxes selected
    $(".delete-button").unbind().click(function(){
        var id_array_to_delete = [];
    
        id_array_to_delete.push($(this).attr("x-event-id"));
                
        //get array of checkboxes
        var checkboxes = $(".multi-check-box:checkbox:checked");
        
        for(var i = 0; i < checkboxes.length; i++){
            
            var checkbox = checkboxes[i];
            var event_id = $(checkbox).attr("x-event-id");
            
            if(id_array_to_delete.indexOf(event_id) == -1){
                id_array_to_delete.push(event_id);
            }
        }
        
        $.ajax({
            url: "/api/scraped_data/events/",
            data: JSON.stringify(id_array_to_delete),
            processData: false,
            contentType: "application/json",
            type: 'DELETE',
            success: function(data){
                location.reload();
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) { 
                console.log(errorThrown);
            }
        });
    });
    
    //scrape an actor using their name
    $(".scrape-actor-button").unbind().click(function(){
        
        var actor_name = $(this).parent().parent().find(".aggressor-name").val();
        
        $.ajax({
            url: "/api/scraped_data/actor/"+ actor_name,
            //data: id_array_to_delete,
            processData: false,
            //contentType: "application/json",
            type: 'GET',
            success: function(data){
                
                if(data == "nothing_found"){
                    
                }
                else{//if server can find data for this actor
                    
                    var data = JSON.parse(data);
                    console.log(data);
                    console.log(JSON.parse(data.actor_object));
                    
                    //TODO: add function in add_actor_modal controller to allow loading the actor modal with data, invoke that function with the scraped actor_object.
                    
                    
                    $('#add_actor_modal').modal('show');
                    //location.reload();
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) { 
                console.log(errorThrown);
            }
        });
    });
    
    //confirm event and add it to event_data table
    $(".submit_event").unbind().click(function(){
        
    });
});