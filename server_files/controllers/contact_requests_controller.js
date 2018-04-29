//external dependencies
var BSON = require("bson");
var nodemailer = require("nodemailer");

//internal dependencies
var db_ref = require("../config/db_config.js");

//objects
var ContactRequest = require("../schemas/contact_request_schema").model;

module.exports = {
    
    findContactRequests: function(callback){
        
        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{
                //standard query to match an event and resolve aggressor and targets references
                db.collection(db_ref.get_contact_requests_table()).find({}, function(err, docs) {
                    //handle error
                    if(err) { console.log(err);}
                    else{
                        callback(docs);
                    }
                });
            }
        });
    },
    
    createContactRequest: function(contact_request_data, callback){
        
        var contact_request_record = new ContactRequest({
            name: contact_request_data.name,
            email_address:contact_request_data.email_address,
            subject: contact_request_data.subject,
            message: contact_request_data.message
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