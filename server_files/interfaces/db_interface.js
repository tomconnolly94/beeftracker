//file to hold all functions involving the server's interfacing with the database
var db_ref = require("../config/db_config.js");
var nodemailer = require('nodemailer');
var async = require("async");
var BSON = require('bson');

const db_url = process.env.MONGODB_URI; //get db uri

var create_beef_chains = function(db, event, table){
    event.aggressors.forEach(function(aggressor, index){
        event.targets.forEach(function(target, index){
            //loop through events, check if event has beef chain id, 
            db.collection(db_ref.get_beef_chain_table()).find({ actors: { $all: [ aggressor, target ]}}).toArray(function(err, beef_chains){ //TODO this query is not matching beef chains correctly
                if(err){ console.log(err); }
                else{
                    //if no beef chain id, get aggressor and each target and insert 
                    if(beef_chains.length > 0){ //beef chain does exist 

                        var beef_chain = beef_chains[0];

                        //check if this event is in the beef_chain table already
                        if(beef_chain.events.indexOf(event._id) == -1){
                            var new_beef_chain_events = beef_chain.events;

                            new_beef_chain_events.push(event._id);

                            db.collection(db_ref.get_beef_chain_table()).update({ _id: beef_chain._id}, { $set: { events: new_beef_chain_events } }); //update beef_chain events with new event included
                            db.collection(db_ref.get_current_event_table()).update({ _id: event._id }, { $push: {beef_chain_ids: beef_chain._id }}); //update event with beef_chain_id
                            //console.log("beef chain: " + beef_chain._id + " updated.");
                        }   

                    }
                    else{ //beef chain doesnt exist, create one
                        db.collection(db_ref.get_beef_chain_table()).insert({ events: [ event._id ], actors: [ aggressor, target ] }, function(err, inserted_doc){ //insert new beef_chain with one event
                            db.collection(db_ref.get_current_event_table()).update({ _id: event._id }, { $push: {beef_chain_ids: inserted_doc.ops[0]._id }}); //update event with beef_chain_id
                            //console.log("beef chain: " + inserted_doc.ops[0]._id + " created.");
                        });
                    }
                }
            });
        });
    });
}

var post_insert_procedure = function(db, document, insert_object, table, options){
    
    if(document != null && document.ops != null){
                            
        var event = document.ops[0];
        
        //find possible beef chains and provided they dont exist and if they do, the event is not already in the beef_chain, add the event to them
        if(table == db_ref.get_current_event_table() && options.operation == "insert"){ create_beef_chains(db, event, table); }
        
        //add _id field so object can be found later
        insert_object._id = document.ops[0]._id;

        if(options.send_email_notification){ //deal with sending email notification

            //parse json directly to string with indents
            var text = JSON.stringify(insert_object, null, 2);

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
                    //callback(null);
                };
            });                        
        }
    }
}

module.exports = {
    
    get: function(query_config, success_callback, failure_callback){
        
        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ 
                console.log(err); 
                failure_callback({ failed: true, module: "db_interface", function: "get", message: "Failed at db connection"});
            }
            else{
                //standard query to match an event and resolve aggressor and targets references
                db.collection(query_config.table).aggregate(query_config.aggregate_array).toArray(function(err, results) {
                    //handle error
                    if(err) { 
                        console.log(err);
                        failure_callback({ failed: true, module: "db_interface", function: "get", message: "Failed at db query"});
                    }
                    else{
                        success_callback(results);
                    }
                });
            }
        });
    },
    
    insert: function(insert_config, success_callback, failure_callback){
        var record = insert_config.record
        var table = insert_config.table;
        var options = insert_config.options;
        
        db_ref.get_db_object().connect(db_url, function(err, db) {
            if(err){
                console.log(err); 
                failure_callback({ failed: true, module: "db_interface", function: "insert", message: "Failed at db connection"});
            }
            else{
                //standard query to insert into live events table
                db.collection(table).insert(record, function(err, document){
                    if(err){
                        console.log(err);
                        failure_callback({ failed: true, module: "db_interface", function: "insert", message: "Failed at db query"});
                    }
                    else{
                        options.operation = "insert";
                        post_insert_procedure(db, document, record, table, options);
                        success_callback({ id: record._id });
                    }
                });
            }
        });        
    },
    
    update: function(update_config, fn_callback, failure_callback){
    
        var record = update_config.record;
        var table = update_config.table;
        var options = update_config.options;
        var existing_object_id = update_config.existing_object_id;
        
        db_ref.get_db_object().connect(db_url, function(err, db) {
            if(err){ 
                console.log(err); 
                failure_callback({ failed: true, module: "db_interface", function: "update", message: "Failed at db connection"});
            }
            else{
                var object = BSON.ObjectID.createFromHexString(existing_object_id);
                                
                //standard query to insert into live events table
                db.collection(table).findOneAndUpdate({_id: object}, { $set: record }, function(err, document){
                    if(err){
                        console.log(err);
                        failure_callback({ failed: true, module: "db_interface", function: "update", message: "Failed at db query"});
                    }
                    else{
                        options.operation = "update";
                        post_insert_procedure(db, document, record, table, options);
                        fn_callback(record);
                    }
                });
            }
        });        
    },
    
    delete: function(delete_config, success_callback, failure_callback){
        
        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){
                console.log(err); 
                failure_callback({ failed: true, module: "db_interface", function: "delete", message: "Failed at db connection"});
            }
            else{
                //standard query to match an event and resolve aggressor and targets references
                db.collection(query_config.table).deleteOne(delete_config.match_query).toArray(function(err, results) {
                    //handle error
                    if(err){
                        console.log(err);
                        failure_callback({ failed: true, module: "db_interface", function: "delete", message: "Failed at db query"});
                    }
                    else{
                        success_callback(results);
                    }
                });
            }
        });
    }    
}