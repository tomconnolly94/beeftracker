//external dependencies
var jsdiff = require('diff');

//internal dependencies
var db_ref = require("../config/db_config.js");
var storage_ref = require("../config/storage_config.js");
var storage_interface = require('../interfaces/storage_interface.js');
var db_interface = require('../interfaces/db_interface.js');
var format_embeddable_items = require('../tools/formatting.js').format_embeddable_items;
var format_event_data = require("./events_controller.js").format_event_data;
var format_actor_data = require("./actors_controller.js").format_actor_data;
var EventContribution = require("../schemas/event_contribution_schema.js").model;

module.exports = {
    
    createUpdateRequest: function(incoming_data, files, callback){
        
        var submission_data = incoming_data.data;
        var object_type;
        var insert_object;
        
        if(incoming_data.event){
            insert_object = format_event_data(submission_data);
            object_type = "events";
        }
        else if(incoming_data.actor){
            insert_object = format_actor_data(submission_data);
            object_type = "actors";
        }
                
        var insert = function(insert_object, incoming_data){
            
            db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
                if(err){ console.log(err); }
                else{
                    db.collection(db_ref.get_current_event_table()).find({ _id: insert_object._id }).toArray(function(err, existing_event_record){
                        if(err){ console.log(err); }
                        else{
                            var diffs = [];

                            for(var i = 0; i < Object.keys(insert_object).length; i++){
                                
                                var field_name = Object.keys(insert_object)[i];
                                
                                if(field_name != "_id"){
                                    
                                    if(existing_event_record[field_name] && insert_object[field_name]){
                                        diffs.push(jsdiff.diffWords(existing_event_record[field_name], insert_object[field_name]));
                                    }
                                }
                            }

                            //create contribution record
                            var new_contribution = EventContribution({
                                user: incoming_data.user_id,
                                date_of_submission: new Date(),
                                contribution_details: diffs
                            });

                            var db_options = {
                                send_email_notification: true,
                                email_notification_text: "Update request",
                                add_to_scraped_confirmed_table: false
                            };
                            
                            var insert_wrapper = {
                                update_data: insert_object,
                                existing_event_id: incoming_data.existing_event_id,
                                user_id: incoming_data.user_id
                            }

                            db_interface.insert(insert_wrapper, db_ref.get_event_update_requests_table(), db_options, function(id){
                                callback(id);
                            });
                        }
                    });
                }
            });
        }
        
        if(insert_object.gallery_items && insert_object.gallery_items.length > 0){
            
            //find gallery items that need their embedding links generated
            insert_object.gallery_items = format_embeddable_items(insert_object.gallery_items, files);

            storage_interface.async_loop_upload_items(insert_object.gallery_items, storage_ref.get_update_requests_folder() + "/" + object_type, files, function(items){

                insert_object.gallery_items = items;

                //remove file objects to avoid adding file buffer to the db
                for(var i = 0; i < insert_object.gallery_items.length; i++){
                    if(insert_object.gallery_items[i].file){
                        insert_object.gallery_items[i].file = null;
                    }

                    if(insert_object.gallery_items[i].main_graphic){
                        insert_object.img_title_fullsize = insert_object.gallery_items[i].link; //save fullsize main graphic ref
                        insert_object.img_title_thumbnail = insert_object.gallery_items[i].thumbnail_img_title; //save thumbnail main graphic ref
                    }
                }
                insert(insert_object, incoming_data);
            });
        }
        else{
            insert(insert_object, incoming_data);
        }
    }
    
}