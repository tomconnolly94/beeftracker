//file to hold all functions involving the server's interfacing with the database
var db_ref = require("../db_config.js");
var nodemailer = require('nodemailer');
var async = require("async");

const db_url = process.env.MONGODB_URI; //get db uri

module.exports = {
       
    insert_record_into_db: function(insert_object, table, options, fn_callback){
        
        console.log("insert function called.");
        
        db_ref.get_db_object().connect(db_url, function(err, db) {
            if(err){ console.log(err); }
            else{
                
                //standard query to insert into live events table
                db.collection(table).insert(insert_object, function(err, document){
                    if(err){ console.log(err); }
                    else{
                        if(document != null && document.ops != null){
                            
                            var event = document.ops[0];
                            var aggressor = event.aggressor;

                            event.targets.forEach(function(target, index){

                                //loop through events, check if event has beef chain id, 
                                db.collection("beef_chains").find({ actors: { $all: [ aggressor, target[0]._id ]}}).toArray(function(err, beef_chains){ //TODO this query is not matching beef chains correctly

                                    if(err){ console.log(err); }
                                    else{
                                        //if no beef chain id, get aggressor and each target and insert 
                                        if(beef_chains.length > 0){ //beef chain does exist 

                                            var beef_chain = beef_chains[0];

                                            //check if this event is in the beef_chain table already
                                            if(beef_chain.events.indexOf(event._id) == -1){
                                                var new_beef_chain_events = beef_chain.events;

                                                new_beef_chain_events.push(event._id);

                                                db.collection("beef_chains").update({ _id: beef_chain._id}, { $set: { events: new_beef_chain_events } }); //update beef_chain events with new event included
                                                db.collection("event_data_v0_3").update({ _id: event._id }, { $set: {beef_chain_id: beef_chain._id }}); //update event with beef_chain_id
                                                console.log("beef_chain " + beef_chain._id + " updated.");
                                            }   

                                        }
                                        else{ //beef chain doesnt exist, create one     

                                            db.collection("beef_chains").insert({ events: [ event._id ], actors: [ aggressor, target[0]._id ] }, function(err, inserted_doc){ //insert new beef_chain with one event
                                                db.collection("event_data_v0_3").update({ _id: event._id }, { $set: {beef_chain_id: inserted_doc.ops[0]._id }}); //update event with beef_chain_id
                                                console.log("beef_chain " + inserted_doc.ops[0]._id + " created.");
                                            });
                                        }
                                    }
                                });
                            });
                            //add _id field so object can be found later
                            insert_object._id = document.ops[0]._id;

                            if(options.send_email_notification){

                                //parse json directly to string with indents
                                var text = JSON.stringify(insert_object, null, 2);

                                var transporter = nodemailer.createTransport({
                                    service: 'Gmail',
                                    auth: {
                                        user: process.env.SERVER_EMAIL_ADDRESS, // Your email id
                                        pass: process.env.SERVER_EMAIL_PASSWORD // Your password
                                    }
                                });

                                //config mail options
                                var mailOptions = {
                                    from: 'bf_sys@gmail.com', // sender address
                                    to: 'beeftracker@gmail.com', // list of receivers
                                    subject: "New " + options.email_notification_text + " Submission", // Subject line
                                    text: text //, // plaintext body
                                    // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
                                };

                                //send email notifying beeftracker account new submisson
                                transporter.sendMail(mailOptions, function(error, info){
                                    if(error){ console.log(error); }
                                    else{
                                        console.log('Message sent: ' + info.response);
                                        //callback({ id: insert_object._id });
                                        callback(null);
                                    };
                                });                        
                            }
                        }
                        fn_callback({ id: insert_object._id });
                    }
                });
            }
        });        
    }
}