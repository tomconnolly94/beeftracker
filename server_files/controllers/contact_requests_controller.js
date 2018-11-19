////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Module: 
// Author: Tom Connolly
// Description: 
// Testing script:
//
////////////////////////////////////////////////////////////////////////////////////////////////////

//external dependencies
var BSON = require("bson");
var nodemailer = require("nodemailer");

//internal dependencies
var db_ref = require("../config/db_config.js");
var db_interface = require("../interfaces/db_interface.js");
var email_interface = require("../interfaces/email_interface.js");

//objects
var ContactRequest = require("../schemas/contact_request.schema").model;

module.exports = {
    
    findContactRequests: function(query, callback){

        var match_query = {};

        if(query.email_address){
            match_query.email_address = query.email_address
        }
        else if(query.name){
            match_query.name = query.name
        }

        var query_config = {
            table: db_ref.get_contact_requests_table(),
            aggregate_array: [
                {
                    $match: match_query
                }
            ]
        }
        db_interface.get(query_config, function(results){
            callback(results);
        },
        function(error_object){
            callback(error_object);
        });
    },
    
    createContactRequest: function(contact_request_data, callback){
        
        var contact_request_record = new ContactRequest({
            name: contact_request_data.name,
            email_address: contact_request_data.email_address,
            subject: contact_request_data.subject,
            message: contact_request_data.message
        });

        var insert_config = {
            record: contact_request_record,
            table: db_ref.get_contact_requests_table(),
            options: {
                email_config: {
                    email_title: "New Contact Request from: " + contact_request_data.email_address, // Subject line
                    email_html: "<html> <h1> Record </h1> <h5> ENV: " + process.env.NODE_ENV + " </h5> <p>" + JSON.stringify(contact_request_record) + "</p> </html>",
                    recipient_address: contact_request_data.email_address
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
}