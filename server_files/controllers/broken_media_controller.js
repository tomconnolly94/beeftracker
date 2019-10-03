////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Module: contact_requests_controller
// Author: Tom Connolly
// Description: Module to handle finding and storing data concerning contact attempts from either 
// registered or unregistered users regarding more information, complaints or queries about the 
// site
// Testing script: test/unit_testing/controller_tests/contact_requests_controller.test.js
//
////////////////////////////////////////////////////////////////////////////////////////////////////

//external dependencies
var BSON = require('bson');

//internal dependencies
var db_ref = require("../config/db_config.js");
var db_interface = require("../interfaces/db_interface.js");

//objects
var BrokenMedia = require("../schemas/broken_media.schema");

module.exports = {
    
    findBrokenMediaRecords: function(query, callback){

        var query_config = {
            table: db_ref.get_broken_media_table(),
            aggregate_array: [
                query,
                { $limit: 20 }
            ]
        }
        db_interface.get(query_config, function(results){
            callback(results);
        },
        function(error_object){
            callback(error_object);
        });
    },
    
    findBrokenMediaRecord: function(broken_media_id, callback){

        var query_config = {
            table: db_ref.get_broken_media_table(),
            aggregate_array: [
                {
                    $match: { _id: BSON.ObjectID.createFromHexString(broken_media_id)}
                },
                { $limit: 1 }
            ]
        }
        db_interface.get(query_config, function(result){
            callback(result[0]);
        },
        function(error_object){
            callback(error_object);
        });
    },
    
    createBrokenMediaRecord: function(broken_media_data, callback){
        
        //check if a broken media record for this event already exists
        var query_config = {
            table: db_ref.get_broken_media_table(),
            aggregate_array: [
                {
                    $match: { event_id: BSON.ObjectID.createFromHexString(broken_media_data.event_id)}
                },
                { $limit: 1 }
            ]
        }
        db_interface.get(query_config, function(result){
            callback({
                failed: true,
                module: "broken_media_controller",
                function: "createBrokenMediaRecord",
                message: "A broken media record already exists for this event."
            });
        },
        function(error_object){
            if(error_object.message == "No results found"){
                var broken_media_record = new BrokenMedia({
                    event_id: broken_media_data.event_id,
                    gallery_items: broken_media_data.gallery_items
                });

                var broken_media_record_reduced = JSON.parse(JSON.stringify(broken_media_record)).gallery_items.forEach((x) => delete x.file); //remove file property to avoid printing a file buffer to the email;

                var insert_config = {
                    record: broken_media_record,
                    table: db_ref.get_broken_media_table(),
                    options: {
                        email_config: {
                            email_title: "[Beeftracker] New Broken Link Report", // Subject line
                            email_html: "<html> <h1> Record </h1> <h5> ENV: " + process.env.NODE_ENV + " </h5> <p>" + JSON.stringify(broken_media_record_reduced) + "</p> </html>",
                            recipient_address: null
                        }
                    }
                };

                db_interface.insert(insert_config, function(result){
                    callback(result);
                },
                function(error_object){
                    callback(error_object);
                });
            }
        });
    },

    deleteBrokenMediaRecord: function(broken_media_id, callback){

        var delete_config = {
            table: db_ref.get_broken_media_table(),
            delete_multiple_records: true,
            match_query: { _id: BSON.ObjectID.createFromHexString(broken_media_id) }
        }
        ;
        db_interface.delete(delete_config, function(){
            callback({});
        },
        function(error_object){
            callback(error_object);
        });
    }
}