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

//objects
var ContactRequest = require("../schemas/contact_request.schema").model;

module.exports = {
    
    findContactRequest: function(query, callback){

        var query_config = {
            table: db_ref.get_contact_requests_table(),
            aggregate_array: [
                {
                    $match: { email_address: email_address }
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
    
    findContactRequests: function(query, callback){

        var match_query = {};

        var query_config = {
            table: db_ref.get_contact_requests_table(),
            aggregate_array: [
                {
                    $match: query
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
            email_address:contact_request_data.email_address,
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
        }

        db_interface.insert(insert_config, function(result){
            callback(result);
        },
        function(error_object){
            callback(error_object);
        });
        
        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{
                //standard query to match an event and resolve aggressor and targets references
                db.collection(db_ref.get_contact_requests_table()).insert(contact_request_record, function(err, docs) {
                    //handle error
                    if(err) { console.log(err);}
                    else{
                        callback({ id: docs.ops[0]._id });
                        
                        //parse json directly to string with indents
                        var text = JSON.stringify(contact_request_record, null, 2);

                        var transporter = nodemailer.createTransport({
                            service: 'Gmail',
                            auth: {
                                user: process.env.SERVER_EMAIL_ADDRESS,
                                pass: process.env.SERVER_EMAIL_PASSWORD
                            }
                        });

                        //config mail options
                        var mailOptions = {
                            from: 'bf_sys@gmail.com', // sender address
                            to: 'beeftracker@gmail.com', // list of receivers
                            subject: "New Contact Request, Env = " + process.env.NODE_ENV, // Subject line
                            text: text //, // plaintext body
                            // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
                        };

                        //send email notifying beeftracker account new submisson
                        transporter.sendMail(mailOptions, function(error, info){
                            if(error){ console.log(error); }
                            else{
                                console.log('Message sent: ' + info.response);
                                //callback({ id: insert_object._id });
                                //callback(null);
                            };
                        });
                    }
                });
            }
        });
    }
    
}