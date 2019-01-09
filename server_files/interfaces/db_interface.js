////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Module: 
// Author: Tom Connolly
// Description: 
// Testing script:
//
////////////////////////////////////////////////////////////////////////////////////////////////////

//file to hold all functions involving the server's interfacing with the database
var db_ref = require("../config/db_config.js");
var email_interface = require("../interfaces/email_interface");
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
        if(table == db_ref.get_current_event_table() && options.operation == "insert"){ 
            create_beef_chains(db, event, table); 
        }
        
        //add _id field so object can be found later
        insert_object._id = document.ops[0]._id;

        if(options.email_config){ //deal with sending email notification
            email_interface.send(options.email_config);                 
        }
    }
}

module.exports = {
    
    get: function(query_config, success_callback, failure_callback){

        var table = query_config.table;
        var aggregate_array = query_config.aggregate_array;
        
        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ 
                console.log(err); 
                failure_callback({ failed: true, module: "db_interface", function: "get", message: "Failed at db connection"});
            }
            else{
                //standard query to match an event and resolve aggressor and targets references
                db.collection(table).aggregate(aggregate_array).toArray(function(err, results) {
                    //handle error
                    if(err) { 
                        console.log(err);
                        failure_callback({ failed: true, module: "db_interface", function: "get", message: "Failed at db query"});
                    }
                    else{
                        if(results.length > 0){
                            success_callback(results);
                        }
                        else{
                            failure_callback({failed: true, module: "db_interface", function: "get", message: "No results found" })
                        }
                    }
                });
            }
        });
    },
    
    insert: function(insert_config, success_callback, failure_callback){
        
        var table = insert_config.table;
        var record = insert_config.record;
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

    update: function(update_config, success_callback, failure_callback){
    
        var table = update_config.table;
        var existing_object_id = update_config.existing_object_id;
        var update_clause = update_config.update_clause;
        var options = update_config.options;
        
        db_ref.get_db_object().connect(db_url, function(err, db) {
            if(err){ 
                console.log(err); 
                failure_callback({ failed: true, module: "db_interface", function: "update", message: "Failed at db connection"});
            }
            else{
                var object = BSON.ObjectID.createFromHexString(existing_object_id);
                                
                //standard query to insert into live events table
                db.collection(table).findOneAndUpdate({_id: object}, update_clause, { $upsert: true }, function(err, document){
                    if(err){
                        console.log(err);
                        failure_callback({ failed: true, module: "db_interface", function: "update", message: "Failed at db query"});
                    }
                    else{
                        options.operation = "update";
                        post_insert_procedure(db, document, record, table, options);
                        success_callback(record);
                    }
                });
            }
        });        
    },
    
    delete: function(delete_config, success_callback, failure_callback){
        
        var table = delete_config.table;
        var delete_multiple_records = delete_config.delete_multiple_records; //if false, deleted item is returned in callback parameter, if true, multiple items can be deleted with the single delete query
        var match_query = delete_config.match_query;
        
        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){
                console.log(err); 
                failure_callback({ failed: true, module: "db_interface", function: "delete", message: "Failed at db connection"});
            }
            else{
                if(delete_multiple_records){

                    //standard query to match an event and resolve aggressor and targets references
                    db.collection(table).remove(match_query).toArray(function(err) {
                        //handle error
                        if(err){
                            console.log(err);
                            failure_callback({ failed: true, module: "db_interface", function: "delete", message: "Failed at db query"});
                        }
                        else{
                            success_callback({});
                        }
                    });
                }
                else{
                    //standard query to match an event and resolve aggressor and targets references
                    db.collection(table).findOneAndDelete(match_query).toArray(function(err, results) {
                        //handle error
                        if(err){
                            console.log(err);
                            failure_callback({ failed: true, module: "db_interface", function: "delete", message: "Failed at db query"});
                        }
                        else{
                            success_callback(results[0]);
                        }
                    });
                }
            }
        });
    }    
}