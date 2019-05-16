////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Module: db_interface
// Author: Tom Connolly
// Description: Module to take care of all queries to the database, encapsulating connection, query
// and error handling
// Testing script: n/a
//
////////////////////////////////////////////////////////////////////////////////////////////////////

//external dependencies
var BSON = require('bson');

//internal dependencies
var db_ref = require("../config/db_config.js");
var email_interface = require("../interfaces/email_interface");
var logger = require("../tools/logging.js");

//get db uri
const db_url = process.env.MONGODB_URI;

var post_insert_procedure = function (db, document, insert_object, table, options) {

    if (document != null && document.ops != null) {

        var event = document.ops[0];

        //add _id field so object can be found later
        insert_object._id = document.ops[0]._id;

        if (options.email_config) { //deal with sending email notification
            email_interface.send(options.email_config);
        }
    }
}

module.exports = {

    get: function (query_config, success_callback, failure_callback) {

        var table = query_config.table;
        var aggregate_array = query_config.aggregate_array;

        logger.submit_log(logger.LOG_TYPE.EXTRA_INFO, "DB aggregate_array:");
        logger.submit_log(logger.LOG_TYPE.EXTRA_INFO, aggregate_array)

        db_ref.get_db_object().connect(process.env.MONGODB_URI, function (err, db) {
            if (err) {
                console.log(err);
                failure_callback({
                    failed: true,
                    module: "db_interface",
                    function: "get",
                    message: "Failed at db connection"
                });
            } else {
                //standard query to match an event and resolve aggressor and targets references
                db.collection(table).aggregate(aggregate_array).toArray(function (error, results) {
                    //handle error
                    if (error) {
                        logger.submit_log(logger.LOG_TYPE.ERROR, `DB error: ${error}`)
                        failure_callback({
                            failed: true,
                            module: "db_interface",
                            function: "get",
                            message: "Failed at db query"
                        });
                    } else {
                        logger.submit_log(logger.LOG_TYPE.INFO, `DB query returned ${results.length} results.`)
                        logger.submit_log(logger.LOG_TYPE.INFO, `DB table: ${table}`)
                        if (results.length > 0) {
                            success_callback(results);
                        } 
                        else {
                            failure_callback({
                                failed: true,
                                module: "db_interface",
                                function: "get",
                                message: "No results found",
                                no_results_found: true
                            });
                        }
                    }
                });
            }
        });
    },

    insert: function (insert_config, success_callback, failure_callback) {

        var table = insert_config.table;
        var record = insert_config.record;
        var options = insert_config.options;

        db_ref.get_db_object().connect(db_url, function (err, db) {
            if (err) {
                console.log(err);
                failure_callback({
                    failed: true,
                    module: "db_interface",
                    function: "insert",
                    message: "Failed at db connection"
                });
            } else {
                //standard query to insert into live events table
                db.collection(table).insert(record, function (err, document) {
                    if (err) {
                        console.log(err);
                        failure_callback({
                            failed: true,
                            module: "db_interface",
                            function: "insert",
                            message: "Failed at db query"
                        });
                    } else {
                        options.operation = "insert";
                        post_insert_procedure(db, document, record, table, options);
                        success_callback(document.ops[0]);
                    }
                });
            }
        });
    },

    update: function (update_config, success_callback, failure_callback) {

        var table = update_config.table;
        var match_query = update_config.match_query;
        var update_clause = update_config.update_clause;
        var options = update_config.options; //possible fields : upsert (bool), email_config (obj)

        db_ref.get_db_object().connect(db_url, function (err, db) {
            if (err) {
                console.log(err);
                failure_callback({
                    failed: true,
                    module: "db_interface",
                    function: "update",
                    message: "Failed at db connection"
                });
            } else {
                //standard query to insert into live events table
                db.collection(table).update(match_query, update_clause, { $upsert: options.upsert ? true : false }, function (err, result) {
                    if (err) {
                        console.log(err);
                        failure_callback({
                            failed: true,
                            module: "db_interface",
                            function: "update",
                            message: "Failed at db query"
                        });
                    } else {
                        options.operation = "update";
                        post_insert_procedure(db, result.value, update_clause, table, options);
                        success_callback(result.value);
                    }
                });
            }
        });
    },

    //"updateSingle" is limited to updating one object, but it can return that updated object in the success callback, which "update" cannot do
    updateSingle: function (update_config, success_callback, failure_callback) {

        var table = update_config.table;
        var match_id_object = update_config.match_id_object;
        var update_clause = update_config.update_clause;
        var options = update_config.options; //possible fields : upsert (bool), email_config (obj)

        db_ref.get_db_object().connect(db_url, function (err, db) {
            if (err) {
                console.log(err);
                failure_callback({
                    failed: true,
                    module: "db_interface",
                    function: "update",
                    message: "Failed at db connection"
                });
            } else {
                //standard query to insert into live events table
                db.collection(table).findOneAndUpdate({ _id: match_id_object }, update_clause, { upsert: options.upsert ? true : false, returnNewDocument: true }, function (err, result) {
                    if (result.lastErrorObject.upserted){
                        update_clause._id = result.lastErrorObject.upserted;
                        options.operation = "update";
                        post_insert_procedure(db, update_clause, update_clause, table, options);
                        success_callback(update_clause);
                    }
                    else if (err || result.value == null) {
                        console.log(err);
                        failure_callback({
                            failed: true,
                            module: "db_interface",
                            function: "update",
                            message: "Failed at db query"
                        });
                    } else {
                        options.operation = "update";
                        post_insert_procedure(db, result.value, update_clause, table, options);
                        success_callback(result.value);
                    }
                });
            }
        });
    },

    delete: function (delete_config, success_callback, failure_callback) {

        var table = delete_config.table;
        var delete_multiple_records = delete_config.delete_multiple_records; //if false, deleted item is returned in callback parameter, if true, multiple items can be deleted with the single delete query
        var match_query = delete_config.match_query;

        db_ref.get_db_object().connect(process.env.MONGODB_URI, function (err, db) {
            if (err) {
                console.log(err);
                failure_callback({
                    failed: true,
                    module: "db_interface",
                    function: "delete",
                    message: "Failed at db connection"
                });
            } else {
                if (delete_multiple_records) {

                    //standard query to match an event and resolve aggressor and targets references
                    db.collection(table).remove(match_query, function (err, obj) {
                        //handle error
                        if (err) {
                            console.log(err);
                            failure_callback({
                                failed: true,
                                module: "db_interface",
                                function: "delete",
                                message: "Failed at db query"
                            });
                        } else {
                            success_callback({});
                        }
                    });
                } else {
                    //standard query to match an event and resolve aggressor and targets references
                    db.collection(table).findOneAndDelete(match_query, function (err, result) {
                        //handle error
                        if (err || result.value == null) {
                            console.log(err);
                            failure_callback({
                                failed: true,
                                module: "db_interface",
                                function: "delete",
                                message: "Failed at db query"
                            });
                        } else {
                            success_callback(result.value);
                        }
                    });
                }
            }
        });
    }
}