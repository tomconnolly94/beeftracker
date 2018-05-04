//external dependencies
var loop = require("async-looper");
var BSON = require('bson');

//internal dependencies
var db_ref = require("../config/db_config.js");
var storage_ref = require("../config/storage_config.js");
var storage_interface = require('../interfaces/storage_interface.js');
var db_interface = require('../interfaces/db_insert_interface.js');
var format_embeddable_items = require('../tools/formatting.js').format_embeddable_items;

//objects
var Event = require("../schemas/event_schema");
var EventContribution = require("../schemas/event_contribution_schema").model;

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
    "img_title_fullsize": 1,
    "data_sources": 1,
    "beef_chain_ids": 1,
    "contributions": 1,
    "tags": 1,
    "featured": 1,
    "votes": 1,
    "rating": { $ceil: { $multiply: [ 5, { $divide: [ "$votes.upvotes", { $add : [ "$votes.upvotes", "$votes.downvotes"] }] }] }}
};

var check_end_or_next = function(event, item, next){
    //if last item, exit loop, else carry on to next iteration
    if(event.gallery_items[event.gallery_items.length-1].link == item.link){
        next(null, loop.END_LOOP);
    }
    else{
        next();
    }
}

var increment_hit_counts = function(event_id){
    
    db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
        if(err){ console.log(err); }
        else{
            //var event_id_object = BSON.ObjectID.createFromHexString(event_id);

            db.collection(db_ref.get_current_event_table()).update({ _id: event_id }, { $inc: { "hit_counts.total": 1, "hit_counts.today": 1, "hit_counts.this_month": 1 } }, function(err, result){
                //callback();
            })
        }
    });
}

module.exports = {
    
    format_event_data: function(submission_data){
    
        var date = submission_data.date.split('/'); //split date by delimeter into "DD", "MM" and "YYYY"
        var aggressor_ids = []; //create array to store target_ids
        var target_ids = []; //create array to store target_ids
        var gallery_items_formatted = [];

        console.log(submission_data);
        
        //format target_ids array
        for(var i = 0; i < submission_data.aggressors.length; i++){
            aggressor_ids.push(BSON.ObjectID.createFromHexString(submission_data.aggressors[i]));
        }

        //format target_ids array
        for(var i = 0; i < submission_data.targets.length; i++){
            target_ids.push(BSON.ObjectID.createFromHexString(submission_data.targets[i]));
        }

        var initial_event_contribution = EventContribution({
            user: BSON.ObjectID.createFromHexString(submission_data.user_id),
            date_of_submission: new Date(),
            date_of_approval: null,
            contribution_details: [] 
        });

        //format beef event record for insertion
        var event_insert = new Event({
            title: submission_data.title,
            aggressors: aggressor_ids,
            targets: target_ids,
            event_date: new Date(date[2],date[1]-1,date[0]+1),
            date_added: new Date(),
            description: submission_data.description,
            links: submission_data.links,
            hit_counts: {
                total: 0,
                last_day: 0,
                last_two_days: 0,
                last_week: 0
            },
            gallery_items: submission_data.gallery_items,
            categories: submission_data.categories,
            img_title_thumbnail: "",
            img_title_fullsize: "",
            rating: 0,
            data_sources: submission_data.data_sources,
            contributions: [ initial_event_contribution ],
            record_origin: submission_data.record_origin,
            featured: false,
            tags: submission_data.tags
        });
        
        //add _id field if it exists
        if(submission_data._id){ event_insert._id = submission._id; }

        return event_insert;
    },

    findEvents: function(query_parameters, callback){
        
        var match_query_content = {};
        var sort_query_content = {};
        var query_present = Object.keys(query_parameters).length === 0 && query_parameters.constructor === Object ? false : true; //check if request comes with query
        var limit_query_content = 30; //max amount of records to return
        var query_table = db_ref.get_current_event_table();
        
        if(query_present){
            
            //deal with $sort queries
            var sort_field_name;
            
            if(query_parameters.increasing_order == "name"){ sort_field_name = "name"; }
            else if(query_parameters.increasing_order == "rating" || query_parameters.decreasing_order == "rating"){ sort_field_name = "rating"; }
            else if(query_parameters.increasing_order == "popularity" || query_parameters.decreasing_order == "popularity"){ sort_field_name = "hit_count.total"; }
            else if(query_parameters.increasing_order == "currently_trending" || query_parameters.decreasing_order == "currently_trending"){ sort_field_name = "hit_counts.today"; }
            else if(query_parameters.increasing_order == "date_added" || query_parameters.decreasing_order == "date_added"){ sort_field_name = "date_added"; }
            else{ query_present = false; }// if no valid queries provided, disallow a sort query

            if(query_parameters.increasing_order){
                sort_query_content[sort_field_name] = 1;
            }
            else if(query_parameters.decreasing_order){
                sort_query_content[sort_field_name] = -1;
            }
            
            //deal with $match queries
            if(query_parameters.featured != null){ match_query_content = { featured: query_parameters.featured } }
            else if(query_parameters.match_title){ match_query_content = { title: { $regex : query_parameters.match_title, $options: "i" } } }
            else if(query_parameters.match_actor){ match_query_content = { $or: [ { aggressors: query_parameters.match_actor }, { targets: query_parameters.match_actor }] } }
            else if(query_parameters.match_category){ match_query_content = { categories: typeof query_parameters.match_category == "string" ? parseInt(query_parameters.match_category) : query_parameters.match_category } }
            else if(query_parameters.match_beef_chain_id){ match_query_content = { beef_chain_ids: query_parameters.match_beef_chain_id} }
            
            //deal with $limit query
            if(query_parameters.limit){ limit_query_content = typeof query_parameters.limit == "string" ? parseInt(query_parameters.limit) : query_parameters.limit }
                        
        }
        
        //if(false){
        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{                
                var aggregate_array = [
                    { $match: match_query_content },
                    { $unwind : "$aggressors"},
                    { $lookup : {
                        from: db_ref.get_current_actor_table(),
                        localField: "aggressors",
                        foreignField: "_id",
                        as: "aggressors" 
                    }},
                    { $unwind : "$aggressors"},
                    { $unwind : "$targets"},
                    { $lookup : { 
                        from: db_ref.get_current_actor_table(),
                        localField: "targets",
                        foreignField: "_id",
                        as: "targets" 
                    }},
                    { $unwind : "$targets"},
                    { $unwind : "$categories"},
                    { $lookup : { 
                        from: db_ref.get_event_categories_table(),
                        localField: "categories",
                        foreignField: "cat_id",
                        as: "categories" 
                    }},
                    { $unwind : "$categories"},
                    { $lookup: { 
                        from: "beef_chains", 
                        localField: "beef_chain_ids", 
                        foreignField: "_id", 
                        as: "beef_chain_ids"  
                    }}, 
                    /*{ $unwind: "$beef_chain_ids"}, 
                    { $lookup: { 
                        from: "event_data_v4", 
                        localField: "beef_chain_ids.events", 
                        foreignField: "_id", 
                        as: "beef_chain_ids.events"
                    }},*/
                    { $unwind: "$beef_chain_ids"},
                    { $group: {
                        _id: "$_id", 
                        title: { $first: "$title"},
                        aggressors: { $addToSet: "$aggressors" },
                        targets: { $addToSet: "$targets"},
                        event_date: { $first: "$event_date"},
                        date_added: { $first: "$date_added"},
                        description: { $first: "$description"},
                        links: { $first: "$links"},
                        categories: { $addToSet: "$categories"},
                        hit_counts: { $first: "$hit_counts"},
                        gallery_items: { $first: "$gallery_items"},
                        img_title_thumbnail: { $first: "$img_title_thumbnail"},
                        img_title_fullsize: { $first: "$img_title_fullsize"},
                        rating: { $first: "$rating"},
                        data_sources: { $first: "$data_sources"},
                        beef_chain_ids: { $addToSet: "$beef_chain_ids"},
                        contributions: { $first: "$contributions"},
                        tags: { $first: "$tags"},
                        featured: { $first: "$featured"},
                        votes: { $first: "$votes"},
                    }},
                    { $project: event_projection }
                ];
                
                //aggregate_array.splice(1, 0, { $limit: limit_query_content });
                
                if(Object.keys(sort_query_content).length > 0){
                    aggregate_array.push({ $sort: sort_query_content });
                }
                
                aggregate_array.push({ $limit: limit_query_content });
                
                db.collection(db_ref.get_current_event_table()).aggregate(aggregate_array).toArray(function(err, docs) {
                    if(err){ console.log(err); }
                    else{
                        if(docs){
                            callback( docs );
                        }
                        else{
                            callback({ failed: true, message: "Events not found." });
                        }
                    }
                });
            }
        });
    },
    
    findEvent: function(event_id, callback){

        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{                
                var event_id_object = BSON.ObjectID.createFromHexString(event_id);
                
                db.collection(db_ref.get_current_event_table()).aggregate([
                    { $match: { _id: event_id_object } },
                    { $unwind : "$aggressors"},
                    { $lookup : {
                        from: db_ref.get_current_actor_table(),
                        localField: "aggressors",
                        foreignField: "_id",
                        as: "aggressors" 
                    }},
                    { $unwind : "$aggressors"},
                    { $unwind : "$targets"},
                    { $lookup : { 
                        from: db_ref.get_current_actor_table(),
                        localField: "targets",
                        foreignField: "_id",
                        as: "targets" 
                    }},
                    { $unwind : "$targets"},
                    { $unwind : "$categories"},
                    { $lookup : { 
                        from: db_ref.get_event_categories_table(),
                        localField: "categories",
                        foreignField: "cat_id",
                        as: "categories" 
                    }},
                    { $unwind : "$categories"},
                    { $lookup: { 
                        from: "beef_chains", 
                        localField: "beef_chain_ids", 
                        foreignField: "_id", 
                        as: "beef_chain_ids"  
                    }}, 
                    { $unwind: "$beef_chain_ids"}, 
                    { $lookup: { 
                        from: "event_data_v4", 
                        localField: "beef_chain_ids.events", 
                        foreignField: "_id", 
                        as: "beef_chain_ids.events"
                    }},
                    { $unwind: "$beef_chain_ids" },
                    { $group: {
                        _id: "$_id", 
                        title: { $first: "$title"},
                        aggressors: { $addToSet: "$aggressors" },
                        targets: { $addToSet: "$targets"},
                        event_date: { $first: "$event_date"},
                        date_added: { $first: "$date_added"},
                        description: { $first: "$description"},
                        links: { $first: "$links"},
                        categories: { $addToSet: "$categories"},
                        hit_counts: { $first: "$hit_counts"},
                        gallery_items: { $first: "$gallery_items"},
                        img_title_thumbnail: { $first: "$img_title_thumbnail"},
                        img_title_fullsize: { $first: "$img_title_fullsize"},
                        rating: { $first: "$rating"},
                        data_sources: { $first: "$data_sources"},
                        beef_chain_ids: { $addToSet: "$beef_chain_ids"},
                        contributions: { $first: "$contributions"},
                        tags: { $first: "$tags"},
                        featured: { $first: "$featured"},
                        votes: { $first: "$votes"},
                    }},
                    { $project: event_projection }
                ]).toArray(function(queryErr, docs) {
                    if(queryErr){ console.log(queryErr); }
                    else{
                        if(docs && docs.length > 0){
                            
                            function compare_event_dates(a, b) {
                                return b.event_date.valueOf() - a.event_date.valueOf();
                            }
                            docs[0].beef_chain_ids[0].events.sort(compare_event_dates); //sort beef chain events using event dates using above compare function
                            
                            callback( docs[0] );
                            if(process.env.NODE_ENV == "heroku_production"){//only increment hit counts if codebase is in production
                                increment_hit_counts(docs[0]._id);
                            }
                        }
                        else{
                            callback({ failed: true, message: "Event not found."});
                        }
                    }
                });            
            }
        });
    },
    
    createEvent: function(event_data, event_files, callback){
    
        var files = event_files;
        var record_origin = event_data.record_origin;
        
        //format event record for insertion
        var event_insert = module.exports.format_event_data(event_data);
                
        if(test_mode){
            console.log("test mode is on.");
                        
            callback({ failed: true, test_mode: true, message: "Test mode is on, the db was not updated, nothing was added to the file server.", event: event_insert });
        }
        else{
            //find gallery items that need their embedding links generated
            event_insert.gallery_items = format_embeddable_items(event_insert.gallery_items, files);
            
            storage_interface.async_loop_upload_items(event_insert.gallery_items, "events", files, function(items){
                
                event_insert.gallery_items = items;
                
                //remove file objects to avoid adding file buffer to the db
                for(var i = 0; i < event_insert.gallery_items.length; i++){
                    if(event_insert.gallery_items[i].file){
                        event_insert.gallery_items[i].file = null;
                    }
                    
                    if(event_insert.gallery_items[i].main_graphic){
                        event_insert.img_title_fullsize = event_insert.gallery_items[i].link; //save fullsize main graphic ref
                        event_insert.img_title_thumbnail = event_insert.gallery_items[i].thumbnail_img_title; //save thumbnail main graphic ref
                    }
                }
                
                var db_options = {
                    send_email_notification: false,
                    email_notification_text: "Beef",
                    add_to_scraped_confirmed_table: record_origin == "scraped" ? true : false
                };

                db_interface.insert_record_into_db(event_insert, db_ref.get_current_event_table(), db_options, function(id){
                    callback(id);
                });
            });
        }
    },
    
    updateEvent: function(event_data, event_files, existing_object_id, callback){
        
            var files = event_files;
        
        //extract data for use later
        var existing_event_id_object = BSON.ObjectID.createFromHexString(existing_object_id);

        //format event record for insertion
        var event_insert = module.exports.format_event_data(event_data);
        
        if(test_mode){
            console.log("test mode is on.");
            
            //remove file objects to avoid clogging up the console
            for(var i = 0; i < event_insert.gallery_items.length; i++){ 
                if(event_insert.gallery_items[i].file){
                    event_insert.gallery_items[i].file = null;
                }
            }
            
            console.log(event_insert);
            callback({ failed: true, test_mode: true, message: "Test mode is on, the db was not updated, nothing was added to the file server.", event: event_insert });
        }
        else{
            var db_options = {
                send_email_notification: true,
                email_notification_text: "Beef",
                add_to_scraped_confirmed_table: request.body.data.record_origin == "scraped" ? true : false
            };

            db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
                if(err){ console.log(err); }
                else{

                    //get the pre-update event object to sort gallery items
                    db.collection(db_ref.get_current_event_table()).find({ _id: existing_event_id_object } ).toArray(function(queryErr, original_event) {
                        if(err){ console.log(err); }
                        else{
                            original_event = original_event[0];

                            //find gallery items that need their embedding links generated
                            event_insert.gallery_items = format_embeddable_items(event_insert.gallery_items, files);

                            storage_interface.async_loop_upload_items(event_insert.gallery_items, "events", files, function(items){

                                event_insert.gallery_items = items;

                                //remove file objects to avoid adding file buffer to the db
                                for(var i = 0; i < event_insert.gallery_items.length; i++){
                                    if(event_insert.gallery_items[i].file){
                                        event_insert.gallery_items[i].file = null;
                                    }

                                    if(event_insert.gallery_items[i].main_graphic){
                                        event_insert.img_title_fullsize = event_insert.gallery_items[i].link; //save fullsize main graphic ref
                                        event_insert.img_title_thumbnail = event_insert.gallery_items[i].thumbnail_img_title; //save thumbnail main graphic ref
                                    }
                                }


                                //call to update the db record
                                db_interface.update_record_in_db(event_insert, db_ref.get_current_event_table(), db_options, existing_object_id, function(document){

                                    var gallery_items_to_remove = [];

                                    //if new thumbnail doesnt match the existing one the new image will have been uploaded so remove the old file
                                    if(event_insert.img_title_thumbnail != original_event.img_title_thumbnail){
                                        gallery_items_to_remove.push({link: original_event.img_title_thumbnail, media_type: "image"});
                                    }

                                    //if new gallery_item doesnt match the existing one the new image will have been uploaded so remove the old file
                                    for(var i = 0; i < original_event.gallery_items.length; i++){
                                        var gallery_item_found = false;
                                        for(var j = 0; j < event_insert.gallery_items.length; j++){
                                            if(original_event.gallery_items[i].link == event_insert.gallery_items[j].link){
                                                gallery_item_found = true;
                                            }
                                        }
                                        if(!gallery_item_found){
                                            gallery_items_to_remove.push(original_event.gallery_items[i]);
                                        }
                                    }

                                    if(gallery_items_to_remove.length > 0){
                                        //remove all old gallery_items
                                        storage_interface.async_loop_remove_items(gallery_items_to_remove, "events", function(items){
                                            console.log("finish")
                                        });
                                    }
                                    callback(existing_object_id);
                                });
                            });
                        }
                    });
                }
            });
        }
    },
    
    deleteEvent: function(request, response, callback){
        
        //extract data
        var event_id = request.params.event_id;

        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{
                var event_id_object = BSON.ObjectID.createFromHexString(event_id);
                
                db.collection(db_ref.get_current_event_table()).findOne({ _id: event_id_object }, function(queryErr, event_obj) {
                    if(queryErr){ console.log(queryErr); }
                    else{
                        if(event_obj){                            
                            var beef_chain_ids = event_obj.beef_chain_ids;
                                                        
                            //add thumbnail image to list
                            event_obj.gallery_items.push({link: event_obj.img_title_thumbnail, media_type: "image"});
                                            
                            storage_interface.async_loop_remove_items(event_obj.gallery_items, "events", function(){
                                 db.collection(db_ref.get_current_event_table()).deleteOne({ _id: event_id_object }, function(queryErr, docs) {
                                    if(queryErr){ console.log(queryErr); }
                                    else{
                                        db.collection(db_ref.get_beef_chain_table()).remove({ "_id" : { $in: beef_chain_ids }, events: { $size: 1 }, "events.0" : event_id_object }, function(queryErr, beef_chain_docs) {
                                            callback( docs[0] );
                                        });
                                    }
                                });
                            });
                        }
                        else{
                            callback({ failed: true, message: "Event cannot be found, and so was not deleted." });
                        }
                    }
                });
            }
        });
    },
    
}