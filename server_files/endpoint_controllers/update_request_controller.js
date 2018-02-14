//external dependencies

//internal dependencies
var db_ref = require("../config/db_config.js");
var storage_interface = require('../interfaces/storage_interface.js');
var db_interface = require('../interfaces/db_insert_interface.js');
var format_embeddable_items = require('../tools/formatting.js').format_embeddable_items;
var format_event_data = require("./events_controller.js").format_event_data;
var format_event_data = require("./actors_controller.js").format_event_data;

module.exports = {
    
    createUpdateRequest: function(request, response){
        
        var incoming_data = request.body;    
        var files = request.files;    
        var submission_data = incoming_data.data;
        var insert_object;
        var object_type;
        
        if(incoming_data.event){
            insert_object = format_event_data(submission_data);
            object_type = "events";
        }
        else{
            insert_object = format_actor_data(submission_data);
            object_type = "actors";
        }
        var thumbnail_img;        
        
        //find gallery items that need their embedding links generated
        insert_object.gallery_items = format_embeddable_items(event_insert.gallery_items, files);

        storage_interface.async_loop_upload_items(insert_object.gallery_items, storage_ref.get_update_requests_folder() + "/" + object_type, files, function(items){
            
            event_insert.gallery_items = items;

            //remove file objects to avoid adding file buffer to the db
            for(var i = 0; i < event_insert.gallery_items.length; i++){
                if(event_insert.gallery_items[i].file){
                    event_insert.gallery_items[i].file = null;
                }

                if(event_insert.gallery_items[i].main_graphic){
                    event_insert.img_title_fullsize = event_insert.gallery_items[i].link; //save fullsize main graphic ref
                    event_insert.img_title_thumbnail = event_insert.gallery_items[i].thumbnail_img_title; //save thumbnail main graphic ref
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
    }
}