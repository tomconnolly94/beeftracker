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
        var scrape_button_id = $(this).attr("x-identifier");
        
        //define function to replace scrape button with a tick signifying this actor is in the database and the id has been retrieved.
        var post_scrape_function = function(actor){
            $("." + scrape_button_id).css("display", "none");
            $("." + scrape_button_id).parent().each(function(){
                $($(this).find("i")[0]).css("display", "block");
            });
            
            $("." + scrape_button_id).parent().parent().each(function(){
                $($(this).find("input[type=text]")[0]).attr("x-resolved-db-id", actor._id)//assign returned record id to text input
                $($(this).find("input[type=text]")[0]).val(actor.name)
                $($(this).find("input[type=radio]")[0]).prop("disabled", false);
                $($(this).find("input[type=checkbox]")[0]).prop("disabled", false);
            });
        }
        
        
        //perform pre scrape check to make sure the actor is not already in the database
        $.ajax({
            url: "/api/actors?match_multi_names=" + actor_name,
            //data: id_array_to_delete,
            processData: false,
            //contentType: "application/json",
            type: 'GET',
            success: function(data){
                
                if(data.length > 0 ){
                    //actor already in the database, execute post function
                    post_scrape_function(data[0]);
                }
                else{//if server can find data for this actor
                    
                    $.ajax({
                        url: "/api/scraped_data/actor/"+ actor_name,
                        //data: id_array_to_delete,
                        processData: false,
                        //contentType: "application/json",
                        type: 'GET',
                        success: function(data){

                            if(data == "nothing_found"){
                                //insert error handling
                            }
                            else{//if server can find data for this actor

                                var data = JSON.parse(data);
                                console.log(data);
                                console.log(JSON.parse(data.actor_object));

                                //take actor data
                                load_data_into_add_actor_modal(JSON.parse(data.actor_object), data.field_data_dump)

                                $('#add_actor_modal').modal('show');
                                //location.reload();
                            }
                        },
                        error: function(XMLHttpRequest, textStatus, errorThrown) { 
                            console.log(errorThrown);
                        }
                    });
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