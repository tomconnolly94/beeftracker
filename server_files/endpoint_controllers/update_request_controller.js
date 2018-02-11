//external dependencies

//internal dependencies
var db_ref = require("../config/db_config.js");
var event_projection = require("./events_controller.js").event_projection;
var format_event_data = require("./events_controller.js").format_event_data;
var handle_gallery_items = require("./events_controller.js").handle_gallery_items;

module.exports = {
    
    createEventUpdateRequest: function(request, response){
        
        var event_insert = format_event_data(request, response);
        var thumbnail_img;        
        
        handle_gallery_items(event_insert.gallery_items, "event_update_requests", thumbnail_img, function(){
            
            event_insert.img_title_thumbnail = thumbnail_img;

            //remove file objects to avoid adding file buffer to the db
            for(var i = 0; i < event_insert.gallery_items.length; i++){
                if(event_insert.gallery_items[i].file){
                    event_insert.gallery_items[i].file = null;
                }

                if(event_insert.gallery_items[i].main_graphic){
                    event_insert.img_title_fullsize = event_insert.gallery_items[i].link;
                }
            }
            console.log(event_insert);

            var db_options = {
                send_email_notification: true,
                email_notification_text: "Update request",
                add_to_scraped_confirmed_table: false
            };

            db_interface.insert_record_into_db(event_insert, db_ref.get_event_update_requests_table(), db_options, function(id){
                response.status(201).send(id);
            });
        });
    },
    
    createActorUpdateRequest: function(request, response){
    
    
    }

}