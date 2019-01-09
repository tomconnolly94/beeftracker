////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Module: update_requests_controller
// Author: Tom Connolly
// Description: Module to handle requests made by registered users to update the data on an currently 
// active event or actor page.
// Testing script: test/unit_testing/controller_tests/update_requests_controller.test.js
//
////////////////////////////////////////////////////////////////////////////////////////////////////

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
var EventContribution = require("../schemas/event_contribution.schema.js").model;

module.exports = {
    
    createUpdateRequest: function(update_request, files, callback){
        
        var object_data = update_request.data;
        var object_type;
        var insert_object;
        
        if(update_request.event){
            insert_object = format_event_data(object_data);
            insert_object._id = update_request.existing_event_id;
            object_type = "events";
        }
        else if(update_request.actor){
            insert_object = format_actor_data(object_data);
            insert_object._id = update_request.existing_actor_id;
            object_type = "actors";
        }
                
        var insert = function(insert_object, incoming_data){

            var query_config = {
                table: db_ref.get_current_event_table(),
                aggregate_array: [
                    {
                        $match: { _id: insert_object._id }
                    }
                ]
            };

            db_interface.get(query_config, function(results){
                var diffs = [];
                var existing_event_record = results[0];

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

                var insert_config = {
                    table: db_ref.get_event_update_requests_table(),
                    record: {
                        update_data: insert_object,
                        existing_event_id: incoming_data.existing_event_id,
                        user_id: incoming_data.user_id
                    },
                    options: db_options
                };
                
                db_interface.insert(insert_config, function(result){
                    callback(result);
                });
            },
            function(error_object){
                callback(error_object);
            });
        }
        
        if(insert_object.gallery_items && insert_object.gallery_items.length > 0){
            
            //find gallery items that need their embedding links generated
            insert_object.gallery_items = format_embeddable_items(insert_object.gallery_items, files);

            var upload_config = {
                record_type: storage_ref.get_update_requests_folder() + "/" + object_type,
                item_data: insert_object.gallery_items,
                files: files
            };

            storage_interface.upload(upload_config, function(items){

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
                insert(insert_object, update_request);
            });
        }
        else{
            insert(insert_object, update_request);
        }
    }
}