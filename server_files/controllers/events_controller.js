////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Module: events_controller
// Author: Tom Connolly
// Description: Module to handle CRUD operations on event objects in the db, adding them to 
// beef_chains wherer appropriate and storing all metadata accurately.
// Testing script: test/unit_testing/controller_tests/events_controller.test.js
//
////////////////////////////////////////////////////////////////////////////////////////////////////

//TODO: 08/02/2018
//refactor delete function
//write test for delete function
//refactor update function (pseudo code the algorithm and clearly define expected input and expected behaviour, very unclear idea at the moment)
//write test for update function

//external dependencies
var BSON = require('bson');

//internal dependencies
var db_ref = require("../config/db_config.js");
var storage_ref = require("../config/storage_config.js");
var storage_interface = require('../interfaces/storage_interface.js');
var db_interface = require('../interfaces/db_interface.js');
var format_embeddable_items = require('../tools/formatting.js').format_embeddable_items;
var logger = require("../tools/logging.js");

//schemas
var Event = require("../schemas/event.schema");
var EventContribution = require("../schemas/event_contribution.schema").model;
var BeefChain = require("../schemas/beef_chain.schema");

var test_mode = false;
var event_projection = {
    "_id": 1,
    "title": 1,
    "aggressors": 1,
    "targets": 1,
    "event_date": 1,
    "date_added": 1,
    "description": 1,
    "links": 1,
    "categories": 1,
    "hit_counts": 1,
    "gallery_items": 1,
    "img_title_thumbnail": 1,
    "cover_image": 1,
    "data_sources": 1,
    "beef_chain_ids": 1,
    "beef_chains": 1,
    "contributions": 1,
    "tags": 1,
    "featured": 1,
    "votes": 1,
    "comments": 1
};

var increment_hit_counts = function (event_id_object) {

    var update_config = {
        table: db_ref.get_current_event_table(),
        match_query: { _id: event_id_object },
        update_clause: { $inc: { "hit_counts.total": 1, "hit_counts.today": 1, "hit_counts.this_month": 1 } },
        options: { upsert: false }
    };

    db_interface.update(update_config, function(result){
        logger.submit_log(logger.LOG_TYPE.EXTRA_INFO, "updated hot count for: " + event_id_object.toString());
    }, function(error_object){
        logger.submit_log(logger.LOG_TYPE.ERROR, error_object);
    });
}

var compare_event_dates = function (a, b) {
    return b.event_date.valueOf() - a.event_date.valueOf();
}

var create_beef_chains = function(event, callback){

    var aggregate_array = [{
        $match: { $or: [] }
    }];

    event.aggressors.forEach(function (aggressor) {
        event.targets.forEach(function (target) {
            aggregate_array[0]["$match"]["$or"].push({
                actors: {
                    $all: [
                        aggressor,
                        target
                    ]
                }
            });
        });
    });
    
    var query_config = {
        table: db_ref.get_beef_chain_table(),
        aggregate_array: aggregate_array
    }

    db_interface.get(query_config, function(existing_beef_chains){

        var db_query_promises = []; //will hold config objects for database insert/updates

        var build_promise = function(beef_chain){

            var beef_chain_update_config = {
                table: db_ref.get_beef_chain_table(),
                match_id_object: beef_chain._id ? beef_chain._id : "000",
                update_clause: beef_chain,
                options: { upsert: true }
            }

            delete beef_chain_update_config.update_clause._id; //if _id is in the update clause, remove it

            return new Promise(function(resolve, reject){

                db_interface.updateSingle(beef_chain_update_config, function(data){
                    if(data.failed){
                        reject(data);
                    }
                    else{
                        resolve(data);
                    }
                });
            });
        };

        /*  loop through existing_beef_chains, where aggressor and target are both found in existing_beef_chain.actors,
         *  push the new event_id to the beef_chain.event_ids and build a promise to execute the db query later.
         *  if there is no beef_chain for this aggressor/target then build a promise based on the current aggressor and 
         *  target
        */
        for(var aggressor_id = 0; aggressor_id < event.aggressors.length; aggressor_id++){
            var aggressor = event.aggressors[aggressor_id];
            targets_loop:
            for(var target_id = 0; target_id < event.targets.length; target_id++){
                var target = event.targets[target_id];
                for(var i = 0; i < existing_beef_chains.length; i++){
                    var existing_beef_chain = existing_beef_chains[i];
                    var actors = existing_beef_chain.actors.map(function(actor){ return actor.str; })
                    if(actors.indexOf(aggressor.str) != -1 && actors.indexOf(target.str) != -1){
                        //beef_chain found for aggressor and target
                        existing_beef_chain.event_ids.push(event._id);
                        db_query_promises.push(build_promise(existing_beef_chain));                    
                        break targets_loop; //ensures that id an existing beef_chain is found, the code below will not be run
                    }
                }

                db_query_promises.push(build_promise(
                    BeefChain({
                        actors: [ aggressor, target ],
                        events: [ event._id ]
                    })
                )); 
            };
        };

        Promise.all(db_query_promises).then(function(values){

            var beef_chain_ids_to_be_pushed_to_event = []; //will hold all the beef_chain_ids that need to be pushed to the event

            for(var i = 0; i < values.length; i++){
                beef_chain_ids_to_be_pushed_to_event.push(values[i]._id);
            }

            var event_update_config = {
                table: db_ref.get_current_event_table(),
                match_id_object: event._id,
                update_clause: { $push: { beef_chain_ids: { $each: beef_chain_ids_to_be_pushed_to_event } } },
                options: {}
            };

            db_interface.updateSingle(event_update_config, function(data){
                callback(data);
            }, function(error_object){
                callback(error_object);
            });
        }).catch(function(error){
            logger.submit_log(logger.LOG_TYPE.ERROR, error);
            callback(error);
        });
    });
};

module.exports = {
    get_aggregate_array: function (match_query_content, additional_aggregate_stages) {
        var aggregate_array = [
            { $match: match_query_content },
            { $unwind: "$aggressors" },
            {
                $lookup: {
                    from: db_ref.get_current_actor_table(),
                    localField: "aggressors",
                    foreignField: "_id",
                    as: "aggressors"
                }
            },
            { $unwind: "$aggressors" },
            { $unwind: "$targets" },
            {
                $lookup: {
                    from: db_ref.get_current_actor_table(),
                    localField: "targets",
                    foreignField: "_id",
                    as: "targets"
                }
            },
            { $unwind: "$targets" },
            { $unwind: "$categories" },
            {
                $lookup: {
                    from: db_ref.get_event_categories_table(),
                    localField: "categories",
                    foreignField: "cat_id",
                    as: "categories"
                }
            },
            { $unwind: "$categories" },
            { $unwind: "$beef_chain_ids"},
            {
                $group: {
                    _id: "$_id",
                    title: { $first: "$title" },
                    aggressors: { $addToSet: "$aggressors" },
                    targets: { $addToSet: "$targets" },
                    event_date: { $first: "$event_date" },
                    date_added: { $first: "$date_added" },
                    description: { $first: "$description" },
                    links: { $first: "$links" },
                    categories: { $addToSet: "$categories" },
                    hit_counts: { $first: "$hit_counts" },
                    gallery_items: { $first: "$gallery_items" },
                    img_title_thumbnail: { $first: "$img_title_thumbnail" },
                    cover_image: { $first: "$cover_image" },
                    rating: { $first: "$rating" },
                    data_sources: { $first: "$data_sources" },
                    beef_chain_ids: { $addToSet: "$beef_chain_ids" },
                    beef_chains: { $addToSet: "$beef_chains" },
                    contributions: { $first: "$contributions" },
                    tags: { $first: "$tags" },
                    featured: { $first: "$featured" },
                    votes: { $first: "$votes" },
                    comments: { $first: "$comments" },
                }
            },
            { $project: event_projection }
        ];
    
        var initial_index = aggregate_array.length - 3;
    
        for (var i = initial_index; i - initial_index < additional_aggregate_stages.length; i++) {
            aggregate_array.splice(i, 0, additional_aggregate_stages[i - initial_index]);
        }
    
        return aggregate_array;
    },

    format_event_data: function (submission_data) {

        var aggressor_ids = []; //create array to store target_ids
        var target_ids = []; //create array to store target_ids

        //format target_ids array
        for (var i = 0; i < submission_data.aggressors.length; i++) {
            aggressor_ids.push(BSON.ObjectID.createFromHexString(submission_data.aggressors[i]));
        }

        //format target_ids array
        for (var i = 0; i < submission_data.targets.length; i++) {
            target_ids.push(BSON.ObjectID.createFromHexString(submission_data.targets[i]));
        }

        var event_contributions = []

        if(submission_data.event_contributions){
            event_contributions = submission_data.event_contributions;
        }
        else{
            event_contributions.push(
                EventContribution({
                    user: BSON.ObjectID.createFromHexString(submission_data.user_id),
                    date_of_submission: new Date(),
                    date_of_approval: null,
                    contribution_details: []
                })
            );
        }

        //format beef event record for insertion
        var event_insert = new Event({
            title: submission_data.title,
            aggressors: aggressor_ids,
            targets: target_ids,
            event_date: submission_data.date,
            date_added: new Date(),
            description: submission_data.description,
            hit_counts: {
                total: 0,
                last_day: 0,
                last_two_days: 0,
                last_week: 0
            },
            gallery_items: submission_data.gallery_items,
            categories: submission_data.categories,
            cover_image: "",
            rating: 0,
            data_sources: submission_data.data_sources,
            contributions: event_contributions,
            record_origin: submission_data.record_origin,
            featured: false,
            tags: submission_data.tags
        });

        if(submission_data._id){ event_insert._id = submission_data._id; }

        return event_insert;
    },

    findEvents: function (query_parameters, callback) {

        query_parameters.match_category = 1; //hard code all queries to only find rap events
        var match_query_content = {};
        var sort_query_content = {};
        var query_present = Object.keys(query_parameters).length === 0 && query_parameters.constructor === Object ? false : true; //check if request comes with query
        var limit_query_content = 30; //max amount of records to return


        if (query_present) {
            //deal with $sort queries
            var sort_field_name;

            if (query_parameters.increasing_order == "name" || query_parameters.decreasing_order == "name") { sort_field_name = "name"; }
            else if (query_parameters.increasing_order == "rating" || query_parameters.decreasing_order == "rating") { sort_field_name = "rating"; }
            else if (query_parameters.increasing_order == "popularity" || query_parameters.decreasing_order == "popularity") { sort_field_name = "hit_count.total"; }
            else if (query_parameters.increasing_order == "currently_trending" || query_parameters.decreasing_order == "currently_trending") { sort_field_name = "hit_counts.today"; }
            else if (query_parameters.increasing_order == "date_added" || query_parameters.decreasing_order == "date_added") { sort_field_name = "date_added"; }
            else if (query_parameters.increasing_order == "event_date" || query_parameters.decreasing_order == "event_date") { sort_field_name = "event_date"; }
            else { query_present = false; }// if no valid queries provided, disallow a sort query

            if (query_parameters.increasing_order) {
                sort_query_content[sort_field_name] = 1;
            }
            else if (query_parameters.decreasing_order) {
                sort_query_content[sort_field_name] = -1;
            }

            //deal with $match queries
            if (query_parameters.featured != null) { match_query_content["featured"] = query_parameters.featured }
            if (query_parameters.match_title) { match_query_content["title"] = { $regex: query_parameters.match_title, $options: "i" } }
            if (query_parameters.match_actor) { match_query_content["$or"] = [{ aggressors: query_parameters.match_actor }, { targets: query_parameters.match_actor }] }
            if (query_parameters.match_category) { match_query_content["categories"] = typeof query_parameters.match_category == "string" ? parseInt(query_parameters.match_category) : query_parameters.match_category }
            if (query_parameters.match_beef_chain_id) { match_query_content["beef_chain_ids"] = query_parameters.match_beef_chain_id }
            if (query_parameters.match_user_id) { match_query_content["contributions"] = { $elemMatch: { user: BSON.ObjectID.createFromHexString(query_parameters.match_user_id) } } }
            if (query_parameters.match_event_ids) { match_query_content["_id"] = { $in: query_parameters.match_event_ids }}

            //deal with $limit query
            if (query_parameters.limit) { limit_query_content = typeof query_parameters.limit == "string" ? parseInt(query_parameters.limit) : query_parameters.limit }
        }

        var additional_aggregate_stages = [
            // { "$lookup": { 
            //     from: "comments", 
            //     localField: "_id", 
            //     foreignField: "event_id", 
            //     as: "comments"  
            // }},
            // {"$lookup": { 
            //     from: "beef_chains", 
            //     localField: "beef_chain_ids", 
            //     foreignField: "_id", 
            //     as: "beef_chain_ids"  
            // }},
            // { '$lookup': 
            //     { from: 'event_data_v4',
            //         localField: 'beef_chain_ids.events',
            //         foreignField: '_id',
            //         as: 'beef_chain_ids.events' 
            //     } 
            // }
        ];

        if(Object.keys(sort_query_content).length > 0){
            additional_aggregate_stages.push({ $sort: sort_query_content });
        }

        if(limit_query_content != 0){
            additional_aggregate_stages.push({ $limit: limit_query_content });
        }

        var aggregate_array = module.exports.get_aggregate_array(match_query_content, additional_aggregate_stages);
        
        var query_config = {
            table: db_ref.get_current_event_table(),
            aggregate_array: aggregate_array
        };

        db_interface.get(query_config, function (results) {
            callback(results)
        },
        function (error_object) {
            callback(error_object);
        });
    },

    findEvent: function (event_id, callback) {

        var additional_aggregate_stages = [
            { "$lookup": { 
                from: "comments", 
                localField: "_id", 
                foreignField: "event_id", 
                as: "comments"  
            }},
            {"$lookup": { 
                from: "beef_chains", 
                localField: "beef_chain_ids", 
                foreignField: "_id", 
                as: "beef_chains"  
            }}, 
            { "$unwind": "$beef_chains"},
            { '$lookup': 
                { from: 'event_data_v4',
                    localField: 'beef_chains.event_ids',
                    foreignField: '_id',
                    as: 'beef_chains.events' 
                } 
            },
            { "$unwind": "$beef_chains"}
        ];

        var query_config = {
            table: db_ref.get_current_event_table(),
            aggregate_array: module.exports.get_aggregate_array({ _id: BSON.ObjectID.createFromHexString(event_id) }, additional_aggregate_stages)
        };

        db_interface.get(query_config, function (results) {

            var result = results[0];
            console.log("result 1")
            console.log(result)
            //sort beef chain events using event dates using above compare function
            for (var i = 0; i < result.beef_chains.length; i++) {
                result.beef_chains[i].events.sort(compare_event_dates);
            }

            callback(result);

            if (process.env.NODE_ENV == "heroku_production") {//only increment hit counts if codebase is in production
                increment_hit_counts(result._id);
            }
        },
        function (error_object) {
            callback(error_object);
        });
    },

    createEvent: function (event_data, event_files, callback) {

        var files = event_files;
        var record_origin = event_data.record_origin;

        //format event record for insertion
        var event_insert = module.exports.format_event_data(event_data);
        if(event_data._id){ event_insert._id = event_data._id; };

        if (test_mode) {
            console.log("test mode is on.");
            console.log(event_insert);

            callback({ failed: true, test_mode: true, message: "Test mode is on, the db was not updated, nothing was added to the file server.", event: event_insert });
        }
        else {
            //find gallery items that need their embedding links generated
            event_insert.gallery_items = format_embeddable_items(event_insert.gallery_items, files);

            var upload_config = {
                record_type: storage_ref.get_event_images_folder(),
                item_data: event_insert.gallery_items,
                files: files
            };

            storage_interface.upload(upload_config, function (items) {

                //function to remove file extension
                var strip_file_ext = function (string) {
                    var split_string = string.split(".");

                    if (split_string.length > 1) {
                        var ext = split_string.pop();
                        string = string.replace(ext, "");
                    }

                    return string;
                }

                //remove file objects to avoid adding file buffer to the db
                for (var i = 0; i < event_insert.gallery_items.length; i++) {

                    //remove file extension from all image gallery items
                    if (event_insert.gallery_items[i].media_type == "image") { //set file to null to avoid storing file buffer in db
                        event_insert.gallery_items[i].link = strip_file_ext(event_insert.gallery_items[i].link);
                        event_insert.gallery_items[i].file_name = strip_file_ext(event_insert.gallery_items[i].file_name);
                    }

                    if (event_insert.gallery_items[i].file) { //set file to null to avoid storing file buffer in db
                        event_insert.gallery_items[i].file = null;
                    }

                    if (event_insert.gallery_items[i].cover_image) {
                        event_insert.cover_image = event_insert.gallery_items[i].link; //save thumbnail main graphic ref
                    }
                }

                var options = {
                    send_email_notification: false,
                    email_notification_text: "Beef",
                    add_to_scraped_confirmed_table: record_origin == "scraped" ? true : false
                };

                var insert_config = {
                    table: db_ref.get_current_event_table(),
                    record: event_insert,
                    options: options
                }

                db_interface.insert(insert_config, function (result) {
                    create_beef_chains(result, function(full_event){
                        callback({
                            _id: full_event._id,
                            beef_chain_ids: full_event.beef_chain_ids,
                            gallery_items: full_event.gallery_items
                        });
                    });
                },
                function(error_object){
                    callback(error_object);
                });
            });
        }
    },

    updateEvent: function (event_data, files, existing_object_id, callback) {

        //ensures that _id is persistent past the update
        event_data._id = BSON.ObjectID.createFromHexString(existing_object_id);

        if (test_mode) {
            console.log("test mode is on.");

            //remove file objects to avoid clogging up the console
            for (var i = 0; i < event_data.gallery_items.length; i++) {
                if (event_data.gallery_items[i].file) {
                    event_data.gallery_items[i].file = null;
                }
            }

            callback({ failed: true, test_mode: true, message: "Test mode is on, the db was not updated, nothing was added to the file server.", event: event_data });
        }
        else {
            //delete existing event with files
            module.exports.deleteEvent(existing_object_id, function(result){
                if(!result.failed){
                    //insert new event with files
                    module.exports.createEvent(event_data, files, function(result){
                        if(!result.failed){
                            callback(result);
                        }
                        else{
                            callback(result);
                        }
                    });
                }
                else{
                    callback(result);
                }
            });
        }
    },

    deleteEvent: function (event_id, callback) {

        var event_delete_config = {
            table: db_ref.get_current_event_table(),
            delete_multiple_records: false,
            match_query: { _id: BSON.ObjectID.createFromHexString(event_id) }
        };

        //access the event to be deleted
        db_interface.delete(event_delete_config, function(event){

            var remove_config = {
                items: event.gallery_items.filter(gallery_item => gallery_item.media_type == "image"),
                record_type: "events"
            };

            var delete_promises = [];
            delete_promises.push(
                new Promise(function(resolve, reject){
                    //remove all image based gallery items from the file server
                    storage_interface.remove(remove_config, function(){
                        //continue
                        resolve();
                    }, function(error_object){
                        reject(error_object);
                    });
                })
            )

            for(var i = 0; i < event.beef_chain_ids.length; i++){

                var beef_chain_id = event.beef_chain_ids[i];

                delete_promises.push(
                    new Promise(function(resolve, reject){

                        var beef_chain_update_config = {
                            table: db_ref.get_beef_chain_table(),
                            match_id_object: beef_chain_id,
                            update_clause: { 
                                $pull: { event_ids: BSON.ObjectID.createFromHexString(event_id) }
                            },
                            options: {}
                        };

                        //remove the event._id entry from the relevant beef_chain documents
                        db_interface.updateSingle(beef_chain_update_config, function(result){

                            //remove the event from the beef_chain table only if events array is empty after above removal
                            if(result.event_ids.length == 0){

                                var beef_chain_delete_config = {
                                    table: db_ref.get_beef_chain_table(),
                                    delete_multiple_records: true, //because we dont need a return value
                                    match_query: { _id: BSON.ObjectID.createFromHexString(result._id) }
                                };

                                db_interface.delete(beef_chain_delete_config, function(){
                                    resolve();
                                }, function(error_object){
                                    reject(error_object);
                                });
                            }
                            else{
                                resolve();
                            }
                        }, function(error_object){
                            reject(error_object);
                        });
                    })
                )
            }

            Promise.all(delete_promises).then(function(values){
                callback({});
            });
        }, function(error_object){
            callback(error_object);
        });
    }
}